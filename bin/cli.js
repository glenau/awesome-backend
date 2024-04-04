#!/usr/bin/env node

/*
    Author: Gleb Naumov (©) 2024
    License: MIT
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
    if (majorVersion < 20) {
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
        } catch (error) {
            console.log(chalk.red.bold(error));
        }
        console.log(
            chalk.cyan.bold('Welcome, traveler! Please answer the following questions, and I will help you generate the server-side part:')
        );
    }

    try {
        // Starting the process with questions
        const answers = await Questions.start();

        // Checking MongoDB
        if (answers.database && answers.databaseName === 'MongoDB') {
            await new Promise((resolve, reject) => {
                exec('mongod --version', (error, stdout, stderr) => {
                    if (error) {
                        console.log(chalk.yellow.bold(`[WARNING] - Looks like you don't have MongoDB installed`));
                        warning = true;
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Checking PostgreSQL
        if (answers.database && answers.databaseName === 'PostgreSQL') {
            await new Promise((resolve, reject) => {
                exec('psql --version', (error, stdout, stderr) => {
                    if (error) {
                        console.log(chalk.yellow.bold(`[WARNING] - Looks like you don't have PostgreSQL installed`));
                        warning = true;
                        reject();
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Starting the project generation process
        await new Generation(answers).start();

        if (!warning) {
            console.log(
                chalk.cyan.bold('Great! Now open your project and run it using the npm command: ' + chalk.green.bold('npm start\n'))
            );
        }

        console.log(
            chalk.cyan.bold(
                'Please read the documentation for your project which is located in the file: ' + chalk.green.bold('README.md\n')
            )
        );
        console.log(chalk.magenta.bold('At this point I say goodbye and wish you good luck!'));
    } catch (error) {
        console.log(chalk.red.bold(error));
    }
}

run();
