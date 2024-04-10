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

async function run() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1), 10);
    let warning = false;

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

        // Checking MongoDB
        if (answers.database && answers.databaseType === 'MongoDB') {
            await new Promise((resolve, reject) => {
                exec('mongod --version', (err, stdout, stderr) => {
                    if (err) {
                        console.log(chalk.yellow.bold(`\n[WARNING] - Looks like you don't have MongoDB installed`));
                        warning = true;
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
                        warning = true;
                    } else {
                        console.log(chalk.cyan.bold(`\nPostgreSQL detected - `) + chalk.green.bold(stdout.trim()));
                    }
                    resolve();
                });
            });
        }

        // Checking PM2
        if (answers.pm2Support) {
            await new Promise((resolve, reject) => {
                exec('pm2 -v', (err, stdout, stderr) => {
                    if (err) {
                        console.log(chalk.yellow.bold(`\n[WARNING] - Looks like you don't have PM2 installed`));
                        warning = true;
                    } else {
                        console.log(chalk.cyan.bold(`\nPM2 detected - `) + chalk.green.bold(stdout.trim()));
                    }
                    resolve();
                });
            });
        }

        // Starting the project generation process
        await new Generation(answers).start();

        if (!warning) {
            console.log(chalk.cyan.bold('Great! Open your project and start it with the command: '));
            console.log(chalk.white.bold('- ') + chalk.green.bold('npm run start\n'));
            if (answers.pm2Support) {
                console.log(chalk.cyan.bold('You can also run the project through PM2 using the command: '));
                console.log(chalk.white.bold('- ') + chalk.green.bold('npm run dev\n'));
            }
        } else {
            console.log(chalk.yellow.bold('Before running the project, please address all warnings!\n'));
        }

        console.log(chalk.cyan.bold('Documentation for your project can be found in the docs folder:'));
        console.log(
            chalk.white.bold('- ') + chalk.green.bold('project.md') + chalk.white.bold(' (Technical documentation for the project)')
        );
        if (answers.pm2Support) {
            console.log(
                chalk.white.bold('- ') +
                    chalk.green.bold('pm2.md') +
                    chalk.white.bold(' (Documentation for working with the PM2 package manager)')
            );
        }
        if (answers.database) {
            console.log(
                chalk.white.bold('- ') +
                    chalk.green.bold('database.md') +
                    chalk.white.bold(' (Documentation for working with the database)')
            );
        }
        console.log(chalk.white.bold('- ') + chalk.green.bold('swagger.yaml') + chalk.white.bold(' (API Specification)'));
        console.log(chalk.magenta.bold('\nAt this point I say goodbye and wish you good luck!'));
    } catch (err) {
        console.log(chalk.red.bold(err));
    }
}

run();
