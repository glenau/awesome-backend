#!/usr/bin/env node

/*
    Author: Gleb Naumov (©) 2024
    License: MIT
*/

import Questions from '../src/core/questions.js';
import Generation from '../src/core/generation.js';
import os from 'os';
import chalk from 'chalk';

async function run() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1), 10);

    if (majorVersion < 20) {
        console.log(chalk.yellow('The minimum required Node.js version is 20 or higher. Please update your version and try again.'));
        return;
    } else {
        console.log(
            chalk.blue.bold('Welcome, traveler! Please answer the following questions, and I will help you generate the server-side part:')
        );
    }

    const platform = os.platform();

    try {
        const answers = await Questions.start();
        const result = await new Generation(answers).start();
    } catch (error) {
        console.log(chalk.red.bold(error));
    }
}

run();
