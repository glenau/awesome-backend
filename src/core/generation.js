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
        return ['config', 'controllers', 'middlewares', 'models', 'routers', 'services', 'utils', 'validators', 'docs'];
    }

    setIgnoredFiles() {
        const files = {};
        if (!this.answers.database) {
            files['middlewares/database.middleware.ejs'] = true;
            files['services/index.ejs'] = true;
            files['docs/mongoDB.md'] = true;
            files['docs/postgreSQL.md'] = true;
        } else {
            files['validators/article.validator.ejs'] = true;
            files['validators/comment.validator.ejs'] = true;
            files['validators/profile.validator.ejs'] = true;

            if (this.answers.databaseType === 'MongoDB') {
                files['docs/postgreSQL.md'] = true;
            }

            if (this.answers.databaseType === 'PostgreSQL') {
                files['docs/mongoDB.md'] = true;
            }
        }

        if (!this.answers.pm2Support) {
            files['docs/pm2.md'] = true;
            files['ecosystem.config.ejs'] = true;
        }

        if (!this.answers.dockerSupport) {
            files['docs/docker.md'] = true;
            files['Dockerfile'] = true;
        }

        return files;
    }

    // Setting a list of required dependencies for a project
    setProjectDependencies() {
        const dependencies = ['dotenv', 'helmet', 'pino', 'pino-pretty', 'uuid'];
        dependencies.push(this.answers.webFramework);

        if (this.answers.database && this.answers.databaseType === 'MongoDB') {
            dependencies.push('mongoose');
        }

        if (this.answers.database && this.answers.databaseType === 'PostgreSQL') {
            dependencies.push('sequelize');
            dependencies.push('pg');
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
                console.error(chalk.red.bold(`Error creating folder ${folderPath}: ${err}`));
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
            description: 'The project is based on the NPM package awesome-backend',
            main: 'index.js',
            type: 'module',
            scripts: {
                start: 'node index.js',
            },
        };

        if (this.answers.moreOptions) {
            if (this.answers.pm2Support) {
                packageData.scripts.dev = 'pm2 start ecosystem.config.cjs --watch';
            }

            if (this.answers.dockerSupport) {
                packageData.scripts['docker:build'] = `docker build -t ${this.answers.projectName} .`;
                packageData.scripts[
                    'docker:run'
                ] = `docker run -p ${this.answers.serverPort}:${this.answers.serverPort} ${this.answers.projectName}`;
            }
        }

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
            console.error(chalk.red.bold(`Error generating file ${sourceFileName}: ${err}`));
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
                    console.error(chalk.red.bold(`Error installing dependencies: ${err.message}\n`));
                    reject(err);
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
        const docsPath = path.join(this.projectPath, 'docs/project.md');
        let content = '\n## Table of Contents\n\n';

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
        docs: Project documentation
        `;

        if (this.answers.dockerSupport) {
            struct += `
            -   docker.md: Docker documentation
            `;
        }

        if (this.answers.databaseType === 'MongoDB') {
            struct += `
            -   mongoDB.md: MongoDB documentation
            `;
        }

        if (this.answers.pm2Support) {
            struct += `
            -   pm2.md: Process Manager documentation
            `;
        }

        if (this.answers.databaseType === 'PostgreSQL') {
            struct += `
            -   postgreSQL.md: PostgreSQL documentation
            `;
        }

        struct += `
        -   postman.json: Postman requests collection
        -   swagger.yaml: API specification
        -   ${this.answers.projectName}.md: General project documentation
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
        `;

        if (this.answers.dockerSupport) {
            struct += `
            Dockerfile: Docker configuration file
            `;
        }

        if (this.answers.pm2Support) {
            struct += `
            ecosystem.config.cjs: PM2 configuration file
            `;
        }

        struct += `
        index.js: Main application file
        package-lock.json: File containing locked dependencies versions
        package.json: Project configuration file in JSON format
        README.md: Instructions for installation and usage of the project
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

        if (this.answers.webFramework === 'express') {
            content += `\n### Express\n`;
            content += `\n-   Server port: \`${this.answers.serverPort}\`\n`;
            content += `-   API entry point: \`localhost:${this.answers.serverPort}/api\`\n`;
            content += `\n_You can find detailed information in the [Express package](https://www.npmjs.com/package/express)._\n`;
        }

        if (this.answers.databaseType === 'MongoDB') {
            content += `\n### MongoDB\n`;
            content += `\n-   Database name: \`${this.answers.databaseName}\`\n`;
            content += `-   Collections:\n`;
            content += `    -   Articles\n`;
            content += `    -   Comments\n`;
            content += `    -   Profiles\n`;
            content += `-   URL: \`mongodb://localhost:27017/${this.answers.databaseName}\`\n`;
            content += `\n_You can find detailed information in the [MongoDB documentation](mongoDB.md)._\n`;
        }

        if (this.answers.databaseType === 'PostgreSQL') {
            content += `\n### PostgreSQL\n`;
            content += `\n-   Database name: \`${this.answers.databaseName}\`\n`;
            content += `-   Tables:\n`;
            content += `    -   Articles\n`;
            content += `    -   Comments\n`;
            content += `    -   Profiles\n`;
            content += `-   URL: \`postgres://localhost:5432/${this.answers.databaseName}\`\n`;
            content += `\n_You can find detailed information in the [PostgreSQL documentation](postgreSQL.md)._\n`;
        }

        if (this.answers.pm2Support) {
            content += `\n### PM2\n`;
            content += `\n-   Start your application:`;
            content += `\n    \`\`\`bash\n    npm run dev\n    \`\`\`\n`;
            content += `\n_You can find detailed information in the [PM2 documentation](pm2.md)._\n`;
        }

        if (this.answers.dockerSupport) {
            content += `\n### Docker\n`;
            content += `\n1.  Build your application:\n`;
            content += `\n    \`\`\`bash\n    npm run docker:build\n    \`\`\`\n`;
            content += `\n2.  Run your application:\n`;
            content += `\n    \`\`\`bash\n    npm run docker:run\n    \`\`\`\n`;
            content += `\n_You can find detailed information in the [Docker documentation](docker.md)._\n`;
        }

        // ## API
        content += `\n## API\n`;
        content += `\n-   [Swagger API documentation](swagger.yaml)\n`;
        content += `\n-   [Postman collection](postman.json)\n`;

        // ## Problems
        content += `\n## Problems\n`;
        content += `\n_If you have not found a solution to your problem, please write to me by [email](mailto:glenaudev@gmail.com)._\n`;

        // ## Contact
        content += `\n## Contact\n`;
        content += `\n-   [Support](mailto:glenaudev@gmail.com)\n`;
        content += `-   [NPM](https://www.npmjs.com/package/awesome-backend)\n`;
        content += `-   [GitHub](https://github.com/glenau/awesome-backend)\n`;

        // Generating table of contents
        let headings = content.match(/^#{1,6}\s+.+/gm);
        if (headings) {
            let tableOfContents = headings
                .map((heading) => {
                    const level = heading.match(/^#{1,6}/)[0].length;
                    const title = heading.replace(/^#{1,6}\s+/, '');
                    const anchorLink = title.toLowerCase().replace(/\s+/g, '-');
                    if (level === 2) {
                        return `-   [${title}](#${anchorLink})`;
                    } else if (level === 3) {
                        return `    -   [${title}](#${anchorLink})`;
                    }
                    return '';
                })
                .join('\n');
            const lines = content.split('\n');
            lines.splice(3, 0, tableOfContents);
            content = lines.join('\n');
        }

        // Update project.md and rename file
        fs.readFile(docsPath, 'utf8', (err, data) => {
            if (err) {
                return;
            }

            data += content;

            fs.writeFile(docsPath, data, 'utf8', (err) => {
                if (err) {
                    return;
                }

                const newFilePath = path.join(path.dirname(docsPath), `${this.answers.projectName}.md`);
                fs.rename(docsPath, newFilePath, (err) => {
                    if (err) {
                        return;
                    }
                });
            });
        });

        // Swagger specification update
        const swaggerPath = path.join(this.projectPath, 'docs/swagger.yaml');
        const swaggerReplacements = {
            SWAGGER_TITLE: this.answers.projectName,
            SWAGGER_DESCRIPTION: `This is '${this.answers.projectName}' project server based on the OpenAPI 3.0 specification.`,
            SWAGGER_URL: `localhost:${this.answers.serverPort}/api`,
        };

        fs.readFile(swaggerPath, 'utf8', (err, data) => {
            if (err) {
                console.error(chalk.red.bold(`Error reading Swagger file: ${err}`));
                return;
            }

            for (const [word, replacement] of Object.entries(swaggerReplacements)) {
                data = data.replace(new RegExp(word, 'g'), replacement);
            }

            fs.writeFile(swaggerPath, data, 'utf8', (err) => {
                if (err) {
                    console.error(chalk.red.bold(`Error updating Swagger file: ${err}`));
                    return;
                }
            });
        });
        process.stdout.write(chalk.green.bold('OK\n\n'));
    }
}

export default Generation;
