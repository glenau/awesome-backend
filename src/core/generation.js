/*
    Author: Gleb Naumov (©) 2024
    License: MIT
    Project: https://github.com/glenau/awesome-backend
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import chalk from 'chalk';
import { exec } from 'child_process';

class Generation {
    // Initializing a class based on responses
    constructor(answers) {
        this.answers = answers;
        this.projectPath = this.setProjectPath();
        this.projectLanguage = this.setProjectLanguage();
        this.projectTemplatePath = this.setProjectTemplatePath();
        this.projectFolders = this.setProjectFolders();
        this.dependencies = this.setProjectDependencies();
        this.ignoredFiles = this.setIgnoredFiles();
    }

    // Setting the path for a future project
    setProjectPath() {
        const projectPath = process.cwd();
        if (this.answers.projectFolder === 'new') {
            return path.join(projectPath, this.answers.projectName);
        }
        return projectPath;
    }

    setProjectLanguage() {
        return 'js';
    }

    // Setting the path for code templates
    setProjectTemplatePath() {
        const currentDir = path.dirname(fileURLToPath(import.meta.url));
        return path.join(currentDir, '..', 'templates/' + this.projectLanguage);
    }

    // Setting the project folder list
    setProjectFolders() {
        return ['config', 'controllers', 'middlewares', 'models', 'routers', 'services', 'utils', 'validators'];
    }

    setIgnoredFiles() {
        const files = {};
        if (!this.answers.database) {
            files['middlewares/database.middleware.ejs'] = true;
        }
        return files;
    }

    // Setting a list of required dependencies for a project
    setProjectDependencies() {
        const dependencies = ['dotenv', 'helmet', 'pino', 'pino-pretty', 'uuid', 'joi'];
        dependencies.push(this.answers.webFramework);
        if (this.answers.database) {
            if (this.answers.databaseName === 'MongoDB') {
                dependencies.push('mongoose');
            }
        }
        return dependencies;
    }

    // Starting a process to generate a server application
    async start() {
        console.log(chalk.cyan.bold('\nStarting the project generation process:'));
        try {
            await this.createFolders();
            await this.createPackageFile();
            await this.createProjectFilesFromTemplates();
            await this.installDependencies();
        } catch (err) {
            console.log(chalk.red.bold(err));
        }
    }

    // Creating Project Folders from a List
    async createFolders() {
        process.stdout.write(chalk.white.bold('[Step 1: Creation of the project architecture] - '));
        for (const folder of this.projectFolders) {
            const folderPath = path.join(this.projectPath, folder);
            try {
                await fs.promises.mkdir(folderPath, { recursive: true });
            } catch (err) {
                console.err(chalk.red.bold(`err creating folder ${folderPath}: ${err}`));
            }
        }
        process.stdout.write(chalk.green.bold('OK\n'));
    }

    // Creating a package.json file for future filling
    async createPackageFile() {
        process.stdout.write(chalk.white.bold('[Step 2: Create package.json] - '));
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
        process.stdout.write(chalk.green.bold('OK\n'));
    }

    // Creating a list of files required for the project
    async createProjectFilesFromTemplates() {
        process.stdout.write(chalk.white.bold('[Step 3: Generating Project Files] - '));
        const projectFiles = await this.getProjectFiles(this.projectTemplatePath);
        for (const fileName of projectFiles) {
            if (!this.ignoredFiles[fileName]) {
                await this.generateAndWriteFile(fileName);
            }
        }
        await this.generateAndWriteFile('.env.example', '.env');
        process.stdout.write(chalk.green.bold('OK\n'));
    }

    // Transformation of templates from .ejs to .js format using user parameters
    async generateAndWriteFile(sourceFileName, targetFileName = sourceFileName.replace(/\.ejs$/, '.' + this.projectLanguage)) {
        const fileTemplatePath = path.join(this.projectTemplatePath, sourceFileName);
        const fileProjectPath = path.join(this.projectPath, targetFileName);
        try {
            const str = await ejs.renderFile(fileTemplatePath, this.answers);
            fs.writeFileSync(fileProjectPath, str);
        } catch (err) {
            console.err(chalk.red.bold(`err generating file ${sourceFileName}: ${err}`));
        }
    }

    // Getting a list of templates
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

    // Performing installation of all dependencies from the list
    async installDependencies() {
        process.stdout.write(chalk.white.bold('[Step 4: Installing Dependencies] - '));
        const command = `npm install ${this.dependencies.join(' ')}`;

        await new Promise((resolve, reject) => {
            exec(command, { cwd: this.projectPath }, (err, stdout, stderr) => {
                if (err) {
                    console.err(chalk.red.bold(`err installing dependencies: ${err.message}`));
                    reject(err);
                } else if (stderr) {
                    console.err(chalk.red.bold(`err installing dependencies: ${stderr}`));
                    reject(new err(stderr));
                } else {
                    process.stdout.write(chalk.green.bold('OK\n\n'));
                    resolve();
                }
            });
        });
    }
}

export default Generation;
