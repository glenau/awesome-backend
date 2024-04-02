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
        this.projectFolders = this.setProjectFolders();
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

    setProjectFolders() {
        return ['config', 'controllers', 'middlewares', 'routers', 'services', 'utils', 'models'];
    }

    async start() {
        console.log(chalk.blue.bold('\nStarting the project generation process:'));
        try {
            await this.createFolders();
            await this.createPackageFile();
            await this.createProjectFilesFromTemplates();
            await this.installDependencies();
        } catch (error) {
            console.log(chalk.red.bold(error));
        }
    }

    async createFolders() {
        for (const folder of this.projectFolders) {
            const folderPath = path.join(this.projectPath, folder);
            try {
                await fs.promises.mkdir(folderPath, { recursive: true });
            } catch (error) {
                console.error(chalk.red.bold(`Error creating folder ${folderPath}: ${error}`));
            }
        }
        console.log('[Step 1: Creation of the project architecture] - ' + chalk.green.bold('OK'));
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
        console.log('[Step 2: Create package.json] - ' + chalk.green.bold('OK'));
    }

    async createProjectFilesFromTemplates() {
        const projectFiles = await this.getProjectFiles(this.projectTemplatePath);
        for (const fileName of projectFiles) {
            await this.generateAndWriteFile(fileName);
        }
        console.log('[Step 3: Generating Project Files] - ' + chalk.green.bold('OK'));
    }

    async generateAndWriteFile(fileName) {
        const fileTemplatePath = path.join(this.projectTemplatePath, fileName);
        const fileProjectPath = path.join(this.projectPath, fileName.replace(/\.ejs$/, '.js'));

        try {
            const str = await ejs.renderFile(fileTemplatePath, this.answers);
            fs.writeFileSync(fileProjectPath, str);
        } catch (error) {
            console.error(chalk.red.bold(`Error generating file ${fileName}: ${error}`));
        }
    }

    async getProjectFiles(directoryPath) {
        let files = [];
        const items = await fs.promises.readdir(directoryPath);
        for (const item of items) {
            const itemPath = path.join(directoryPath, item);
            const stats = await fs.promises.stat(itemPath);
            if (stats.isDirectory()) {
                const subFiles = await this.getProjectFiles(itemPath);
                files = files.concat(subFiles.map((file) => path.join(item, file)));
            } else {
                files.push(item);
            }
        }
        return files;
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
                    console.error(chalk.red.bold(`Error installing dependencies: ${error.message}`));
                    reject(error);
                } else if (stderr) {
                    console.error(chalk.red.bold(`Error installing dependencies: ${stderr}`));
                    reject(new Error(stderr));
                } else {
                    console.log('[Step 4: Installing Dependencies] - ' + chalk.green.bold('OK\n'));
                    resolve();
                }
            });
        });
    }
}

export default Generation;
