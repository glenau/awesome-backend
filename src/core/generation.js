/*
    Author: Gleb Naumov (©) 2024
    License: MIT
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import chalk from 'chalk';
import { exec } from 'child_process';

class Generation {
    constructor(answers) {
        this.answers = answers;
        this.projectPath = this.setProjectPath();
        this.projectTemplatePath = this.setProjectTemplatePath();
        this.projectFolders = this.setProjectFolders();
        this.dependencies = this.setProjectDependencies();
    }

    setProjectPath() {
        const projectPath = process.cwd();
        if (this.answers.projectFolder === 'new') {
            return path.join(projectPath, this.answers.projectName);
        }
        return projectPath;
    }

    setProjectTemplatePath() {
        const currentDir = path.dirname(fileURLToPath(import.meta.url));
        return path.join(currentDir, '..', 'templates/js');
    }

    setProjectFolders() {
        return ['config', 'controllers', 'middlewares', 'routers', 'services', 'utils', 'models'];
    }

    setProjectDependencies() {
        const dependencies = ['dotenv', 'helmet', 'pino', 'pino-pretty', 'uuid', 'joi'];
        dependencies.push(this.answers.webFramework);
        if (this.answers.database) {
            dependencies.push(this.answers.databaseNameOML);
        }
        return dependencies;
    }

    async start() {
        console.log(chalk.cyan.bold('\nStarting the project generation process:'));
        try {
            await this.createFolders();
            await this.createPackageFile();
            await this.createProjectFilesFromTemplates();
            if (this.answers.dependencies) {
                await this.installDependencies();
                return 'start';
            } else {
                console.log(chalk.cyan.bold("\nDon't forget to run npm command to install all dependencies:"));
                console.log(chalk.green.bold(`npm install ${this.dependencies.join(' ')}\n`));
                return 'install';
            }
        } catch (error) {
            console.log(chalk.red.bold(error));
        }
    }

    async createFolders() {
        process.stdout.write(chalk.white.bold('[Step 1: Creation of the project architecture] - '));
        for (const folder of this.projectFolders) {
            const folderPath = path.join(this.projectPath, folder);
            try {
                await fs.promises.mkdir(folderPath, { recursive: true });
            } catch (error) {
                console.error(chalk.red.bold(`Error creating folder ${folderPath}: ${error}`));
            }
        }
        process.stdout.write(chalk.green.bold('OK\n'));
    }

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

    async createProjectFilesFromTemplates() {
        process.stdout.write(chalk.white.bold('[Step 3: Generating Project Files] - '));
        const projectFiles = await this.getProjectFiles(this.projectTemplatePath);
        for (const fileName of projectFiles) {
            await this.generateAndWriteFile(fileName);
        }
        await this.generateAndWriteFile('.env.example', '.env');
        process.stdout.write(chalk.green.bold('OK\n'));
    }

    async generateAndWriteFile(sourceFileName, targetFileName = sourceFileName.replace(/\.ejs$/, '.js')) {
        const fileTemplatePath = path.join(this.projectTemplatePath, sourceFileName);
        const fileProjectPath = path.join(this.projectPath, targetFileName);
        try {
            const str = await ejs.renderFile(fileTemplatePath, this.answers);
            fs.writeFileSync(fileProjectPath, str);
        } catch (error) {
            console.error(chalk.red.bold(`Error generating file ${sourceFileName}: ${error}`));
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
        process.stdout.write(chalk.white.bold('[Step 4: Installing Dependencies] - '));
        const command = `npm install ${this.dependencies.join(' ')}`;

        return new Promise((resolve, reject) => {
            exec(command, { cwd: this.projectPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(chalk.red.bold(`Error installing dependencies: ${error.message}`));
                    reject(error);
                } else if (stderr) {
                    console.error(chalk.red.bold(`Error installing dependencies: ${stderr}`));
                    reject(new Error(stderr));
                } else {
                    process.stdout.write(chalk.green.bold('OK\n\n'));
                    resolve();
                }
            });
        });
    }
}

export default Generation;
