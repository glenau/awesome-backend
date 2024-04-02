/*
    Author: Gleb Naumov (©) 2024
    License: MIT
*/

import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import chalk from 'chalk';
import { exec } from 'child_process';

class Generation {
    constructor(answers) {
        this.answers = answers;
        this.projectPath = this.setProjectPath();
        this.projectTemplatePath = this.setProjectTemplatePath();
    }

    setProjectPath() {
        const projectPath = process.cwd();
        if (this.answers.projectFolder === 'new') {
            return path.join(projectPath, this.answers.projectName);
        }
        return projectPath;
    }

    setProjectTemplatePath() {
        const projectTemplatePath = process.cwd();
        return path.join(projectTemplatePath, 'src/templates/js');
    }

    async start() {
        try {
            await this.createFolders();
            await this.createPackageFile();
            await this.createProjectFilesFromTemplates();
            await this.installDependencies();
        } catch (error) {
            console.log(error);
        }
    }

    async createFolders() {
        const foldersToCreate = ['config', 'controllers', 'middlewares', 'routes', 'services', 'utils'];

        if (this.answers.database) {
            foldersToCreate.push('models');
        }

        for (const folder of foldersToCreate) {
            const folderPath = path.join(this.projectPath, folder);
            try {
                await fs.promises.mkdir(folderPath, { recursive: true });
            } catch (error) {
                console.error(`Error creating folder ${folderPath}: ${error}`);
            }
        }
        console.log('Step 1 - Creation of the project architecture - OK');
    }

    async createPackageFile() {
        const packagePath = path.join(this.projectPath, 'package.json');
        const packageData = {
            name: this.answers.projectName,
            version: '1.0.0',
            description: 'Enter your project description',
            author: 'Enter your name',
            main: 'index.js',
            type: 'module',
            scripts: {
                start: 'node index.js',
            },
        };
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 4), 'utf8');
        console.log('Step 2 - Create package.json - OK');
    }

    async createProjectFilesFromTemplates() {
        const projectFiles = ['.env', '.env.example', '.gitignore', 'config/env.ejs', 'index.ejs'];

        for (const fileName of projectFiles) {
            await this.generateAndWriteFile(fileName);
        }
        console.log('Step 3 - Generating Project Files - OK');
    }

    async generateAndWriteFile(fileName) {
        const fileTemplatePath = path.join(this.projectTemplatePath, fileName);
        const fileProjectPath = path.join(this.projectPath, fileName.replace(/\.ejs$/, '.js'));

        try {
            const str = await ejs.renderFile(fileTemplatePath, this.answers);
            fs.writeFileSync(fileProjectPath, str);
        } catch (error) {
            console.error(`Error generating file ${fileName}: ${error}`);
        }
    }

    async installDependencies() {
        const dependencies = ['dotenv'];

        dependencies.push(this.answers.webFramework);

        if (this.answers.database) {
            dependencies.push(this.answers.databaseOML);
        }

        const command = `npm install ${dependencies.join(' ')}`;

        return new Promise((resolve, reject) => {
            exec(command, { cwd: this.projectPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error installing dependencies: ${error.message}`);
                    reject(error);
                } else if (stderr) {
                    console.error(`Error installing dependencies: ${stderr}`);
                    reject(new Error(stderr));
                } else {
                    console.log('Step 4 - Installing Dependencies - OK');
                    resolve();
                }
            });
        });
    }
}

export default Generation;
