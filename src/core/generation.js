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
            files['services/index.ejs'] = true;
        } else {
            files['validators/article.validator.ejs'] = true;
            files['validators/comment.validator.ejs'] = true;
            files['validators/profile.validator.ejs'] = true;
        }
        return files;
    }

    // Setting a list of required dependencies for a project
    setProjectDependencies() {
        const dependencies = ['dotenv', 'helmet', 'pino', 'pino-pretty', 'uuid'];
        dependencies.push(this.answers.webFramework);
        if (this.answers.database) {
            if (this.answers.databaseType === 'MongoDB') {
                dependencies.push('mongoose');
            }
            if (this.answers.databaseType === 'PostgreSQL') {
                dependencies.push('sequelize');
                dependencies.push('pg');
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
            await this.createDocumentations();
        } catch (err) {
            console.log(chalk.red.bold(err));
        }
    }

    // Creating Project Folders from a List
    async createFolders() {
        process.stdout.write(chalk.white.bold('[Step 1: Creating a project architecture] - '));
        for (const folder of this.projectFolders) {
            const folderPath = path.join(this.projectPath, folder);
            try {
                await fs.promises.mkdir(folderPath, { recursive: true });
            } catch (err) {
                console.err(chalk.red.bold(`Error creating folder ${folderPath}: ${err}`));
            }
        }
        process.stdout.write(chalk.green.bold('OK\n'));
    }

    // Creating a package.json file for future filling
    async createPackageFile() {
        process.stdout.write(chalk.white.bold('[Step 2: Creating package.json] - '));
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
        process.stdout.write(chalk.white.bold('[Step 3: Generating project files] - '));
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
            console.err(chalk.red.bold(`Error generating file ${sourceFileName}: ${err}`));
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
        process.stdout.write(chalk.white.bold('[Step 4: Installing dependencies] - '));
        const command = `npm install ${this.dependencies.join(' ')}`;

        await new Promise((resolve, reject) => {
            exec(command, { cwd: this.projectPath }, (err, stdout, stderr) => {
                if (err) {
                    console.err(chalk.red.bold(`Error installing dependencies: ${err.message}\n`));
                    reject(err);
                } else if (stderr) {
                    console.err(chalk.red.bold(`Error installing dependencies: ${stderr}\n`));
                    reject(new err(stderr));
                } else {
                    process.stdout.write(chalk.green.bold('OK\n'));
                    resolve();
                }
            });
        });
    }

    // Creating documentation for the project
    async createDocumentations() {
        process.stdout.write(chalk.white.bold('[Step 5: Creating documentation] - '));
        const docsPath = path.join(this.projectPath, 'docs.md');
        let content = `Documentation for the '${this.answers.projectName}' project.\n\n`;
        content += `\`\`\`\nVersion: 1.0.0.\n\`\`\`\n`;
        content += '\n## Table of Contents\n\n';

        // ## Structure
        content += `\n## Structure\n\n`;
        let struct = `
        \`\`\`yml
        config: Directory for configuration files
        -   env.js: Environment configuration file
        controllers: Directory for controller files
        -   article.controller.js: Controller for articles
        -   comment.controller.js: Controller for comments
        -   profile.controller.js: Controller for profiles
        middlewares: Directory for middleware files
        `;
        if (this.answers.database) {
            struct += `
            -   database.middleware.js: Middleware for database connection
            `;
        }

        struct += `
        -   error.middleware.js: Middleware for error handling
        -   index.js: Object of all middlewares
        -   json.middleware.js: Middleware for json parsing
        -   notFound.middleware.js: Middleware for handling requests to non-existent resources
        -   requestID.middleware.js: Middleware for setting request ID
        -   routers.middleware.js: Middleware for connecting all routers
        -   security.middleware.js: Middleware for attaching secure headers to the response
        -   urlEncoded.middleware.js: Middleware for handling URL-encoded data
        models: Directory for model files
        -   article.model.js: Model for articles
        -   comment.model.js: Model for comments
        -   profile.model.js: Model for profiles
        node_modules: Directory containing installed Node.js modules
        routers: Directory for router files
        -   articles.routers.js: Router for articles
        -   comments.routers.js: Router for comments
        -   index.js: Connecting all routers
        -   profiles.routers.js: Router for profiles
        services: Directory of services for working with data
        -   article.service.js: Service for article-related operations
        -   comment.service.js: Service for comment-related operations
        `;

        if (this.answers.database) {
            struct += `
            -   index.js: Creating a database connection object
            `;
        }

        struct += `
        -   profile.service.js: Service for profile-related operations
        utils: Directory for utility files
        -   logger.js: Utility for logging
        -   response.js: Utility for generating HTTP responses
        validators: Directory for validator files
        `;

        if (!this.answers.database) {
            struct += `
            -   article.validator.js: Middleware for validating articles
            -   comment.validator.js: Middleware for validating comments
            -   profile.validator.js: Middleware for validating profiles
            `;
        }

        struct += `
        -   validator.js: Middleware for validating API
        .env: File for storing environment variables
        .env.example: Example file for storing environment variables
        .gitignore: Git configuration file for ignoring specified files
        docs.md: Documentation
        index.js: Main application file
        package-lock.json: File containing locked dependencies versions
        package.json: Project configuration file in JSON format
        README.md: Instructions for installation and usage of the project
        `;

        struct += `
        \`\`\`
        `;

        content += struct.replace(/^\s+/gm, '').replace(/^-/gm, '\t-');

        // ## Dependencies
        await new Promise((resolve, reject) => {
            fs.readFile(path.join(this.projectPath, 'package.json'), 'utf8', (err, data) => {
                if (err) {
                    return;
                }
                const packageJson = JSON.parse(data);
                const dependencies = packageJson.dependencies;
                if (dependencies) {
                    const dependencyList = Object.keys(dependencies)
                        .map((dep) => `${dep}: ${dependencies[dep]}`)
                        .join('\n');
                    content += `\n## Dependencies\n\n\`\`\`\n${dependencyList}\n\`\`\`\n`;
                }
                resolve();
            });
        });

        // ## Configuration
        content += `\n## Configuration\n`;

        // ## Usage
        content += `\n## Usage\n`;

        // ## API
        content += `\n## API\n`;
        content += `\nFor more examples, please refer to the [API Documentation](swagger.yaml).\n`;

        // ## Troubleshooting
        content += `\n## Troubleshooting\n`;

        // ## Contact
        content += `\n## Contact\n`;

        // Generating table of contents
        let headings = content.match(/^#{1,6}\s+.+/gm);
        if (headings) {
            let tableOfContents = headings
                .map((heading) => {
                    const level = heading.match(/^#{1,6}/)[0].length;
                    const title = heading.replace(/^#{1,6}\s+/, '');
                    const anchorLink = title.toLowerCase().replace(/\s+/g, '-');
                    return `${''.repeat(level - 1)}-   [${title}](#${anchorLink})`;
                })
                .join('\n');
            const lines = content.split('\n');
            lines.splice(8, 0, tableOfContents);
            content = lines.join('\n');
        }

        fs.readFile(docsPath, 'utf8', (err, data) => {
            if (err) {
                return;
            }

            data += content;

            fs.writeFile(docsPath, data, 'utf8', (err) => {
                if (err) {
                    return;
                }
            });
        });
        process.stdout.write(chalk.green.bold('OK\n\n'));
    }
}

export default Generation;
