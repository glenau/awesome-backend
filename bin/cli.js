#!/usr/bin/env node

/*
    Author: Gleb Naumov (©) 2024
    License: MIT
    Project: https://github.com/glenau/awesome-backend
*/

import Questions from '../src/core/questions.js';
import Generation from '../src/core/generation.js';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import os from 'os';

async function run() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1), 10);
    let databaseWarning = false;
    let pmWarning = false;
    let dockerWarning = false;

    // Node.js minimum version warning
    if (majorVersion < 18) {
        console.log(chalk.yellow.bold('The minimum required Node.js version is 20 or higher. Please update your version and try again'));
        console.log(chalk.yellow.bold('Current version: ') + chalk.red.bold(nodeVersion));
        console.log(chalk.yellow.bold('Download new version: ' + chalk.green.bold('https://nodejs.org/en/download')));
        return;
    } else {
        try {
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            const data = fs.readFileSync(`${path.join(currentDir, '..', 'package.json')}`, 'utf8');
            const packageJson = JSON.parse(data);
            const version = packageJson.version;
            console.log(chalk.cyan.bold('Version awesome-backend:'), chalk.green.bold(version));
        } catch (err) {
            console.log(chalk.red.bold(err));
        }
        console.log(chalk.cyan.bold('Welcome! Please answer these questions to generate the server-side part:'));
    }

    try {
        // Starting the process with questions
        const answers = await Questions.start();

        // User for the database
        answers.user = os.userInfo().username;

        // Checking MongoDB
        if (answers.database && answers.databaseType === 'MongoDB') {
            await new Promise((resolve, reject) => {
                exec('mongod --version', (err, stdout, stderr) => {
                    if (err) {
                        console.log(chalk.yellow.bold(`\n[WARNING] - Looks like you don't have MongoDB installed`));
                        databaseWarning = true;
                    } else {
                        console.log(chalk.cyan.bold(`\nMongoDB detected - `) + chalk.green.bold(stdout.trim()));
                    }
                    resolve();
                });
            });
        }

        // Checking PostgreSQL
        if (answers.database && answers.databaseType === 'PostgreSQL') {
            await new Promise((resolve, reject) => {
                exec('psql --version', (err, stdout, stderr) => {
                    if (err) {
                        console.log(chalk.yellow.bold(`\n[WARNING] - Looks like you don't have PostgreSQL installed`));
                        databaseWarning = true;
                    } else {
                        console.log(chalk.cyan.bold(`\nPostgreSQL detected - `) + chalk.green.bold(stdout.trim()));
                    }
                    resolve();
                });
            });
        }

        // Checking advanced features
        if (answers.moreOptions) {
            // Checking PM2
            if (answers.pm2Support) {
                await new Promise((resolve, reject) => {
                    exec('pm2 -v', (err, stdout, stderr) => {
                        if (err) {
                            console.log(chalk.yellow.bold(`\n[WARNING] - Looks like you don't have PM2 installed`));
                            pmWarning = true;
                        } else {
                            console.log(chalk.cyan.bold(`\nPM2 detected - `) + chalk.green.bold(stdout.trim()));
                        }
                        resolve();
                    });
                });
            }

            // Checking Docker
            if (answers.dockerSupport) {
                await new Promise((resolve, reject) => {
                    exec('docker -v', (err, stdout, stderr) => {
                        if (err) {
                            console.log(chalk.yellow.bold(`\n[WARNING] - Looks like you don't have Docker installed`));
                            dockerWarning = true;
                        } else {
                            console.log(chalk.cyan.bold(`\nDocker detected - `) + chalk.green.bold(stdout.trim()));
                        }
                        resolve();
                    });
                });
            }
        }

        // Starting the project generation process
        await new Generation(answers).start();

        // Checking warnings
        if (answers.database) {
            if (!databaseWarning) {
                console.log(chalk.cyan.bold('Great! Open your project and start it with the command:'));
                console.log(chalk.white.bold('- ') + chalk.green.bold('npm run start\n'));
            } else {
                console.log(chalk.yellow.bold('Before you start the project, pay attention to the warnings with the database!\n'));
            }
        } else {
            console.log(chalk.cyan.bold('Great! Open your project and start it with the command:'));
            console.log(chalk.white.bold('- ') + chalk.green.bold('npm run start\n'));
        }

        if (answers.moreOptions) {
            if (answers.pm2Support) {
                if (!pmWarning) {
                    console.log(chalk.cyan.bold('You can also run the project through PM2 using the command:'));
                    console.log(chalk.white.bold('- ') + chalk.green.bold('npm run dev\n'));
                } else {
                    console.log(chalk.yellow.bold('Before you start your project, pay attention to PM2 Process Manager warnings!\n'));
                }
            }

            if (answers.dockerSupport) {
                if (!dockerWarning) {
                    console.log(chalk.cyan.bold('You can also run the project through Docker using the commands:'));
                    console.log(chalk.white.bold('- ') + chalk.green.bold('npm run docker:build'));
                    console.log(chalk.white.bold('- ') + chalk.green.bold('npm run docker:run\n'));
                } else {
                    console.log(chalk.yellow.bold('Before you start your project, pay attention to Docker warnings!\n'));
                }
            }
        }

        console.log(chalk.cyan.bold('Documentation for your project can be found in the docs folder:'));

        if (answers.moreOptions && answers.dockerSupport) {
            console.log(
                chalk.white.bold('- ') + chalk.green.bold('docker.md') + chalk.white.bold(' (Documentation for working with docker)')
            );
        }

        if (answers.database && answers.databaseType === 'MongoDB') {
            console.log(
                chalk.white.bold('- ') + chalk.green.bold('mongoDB.md') + chalk.white.bold(' (Documentation for working with the MongoDB)')
            );
        }

        if (answers.moreOptions && answers.pm2Support) {
            console.log(
                chalk.white.bold('- ') +
                    chalk.green.bold('pm2.md') +
                    chalk.white.bold(' (Documentation for working with the PM2 package manager)')
            );
        }

        if (answers.database && answers.databaseType === 'PostgreSQL') {
            console.log(
                chalk.white.bold('- ') +
                    chalk.green.bold('postgreSQL.md') +
                    chalk.white.bold(' (Documentation for working with the PostgreSQL)')
            );
        }

        console.log(chalk.white.bold('- ') + chalk.green.bold('postman.json') + chalk.white.bold(' (Collection of requests for Postman)'));
        console.log(chalk.white.bold('- ') + chalk.green.bold('swagger.yaml') + chalk.white.bold(' (API Specification)'));
        console.log(
            chalk.white.bold('- ') + chalk.green.bold(`${answers.projectName}.md`) + chalk.white.bold(' (General project documentation)')
        );
        console.log(chalk.magenta.bold('\nAt this point I say goodbye and wish you good luck!'));
    } catch (err) {
        console.log(chalk.red.bold(err));
    }
}

run();
