/*
    Author: Gleb Naumov (©) 2024
    License: MIT
    Project: https://github.com/glenau/awesome-backend
*/

import inquirer from 'inquirer';
import chalk from 'chalk';

// Class representing a set of questions to be asked in the CLI
class Questions {
    constructor() {
        // Array of questions for the CLI prompt
        this.questions = [
            {
                type: 'input',
                name: 'projectName',
                message: 'What is your project named?',
                default: 'awesome-backend',
                // Validation function for the project name
                validate: function (value) {
                    if (/^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/.test(value)) {
                        return true;
                    } else {
                        return 'Please enter a valid project name. Project names can only contain letters, numbers, dashes (-), dots (.), tildes (~), underscores (_), and optionally a scoped namespace like @example/';
                    }
                },
            },
            {
                type: 'list',
                name: 'projectLanguage',
                message: 'Which language will you choose?',
                choices: [
                    { name: 'JavaScript', value: 'js' },
                    //   { name: 'TypeScript', value: 'ts' },
                ],
            },
            {
                type: 'list',
                name: 'webFramework',
                message: 'Which web server framework do you prefer?',
                choices: [{ name: 'Express', value: 'express' }],
            },
            {
                type: 'input',
                name: 'serverPort',
                message: 'What port do you want to run the web server on?',
                default: '3000',
                // Validation function for the server port
                validate: function (value) {
                    if (/^(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|\d{1,4})$/.test(value)) {
                        return true;
                    } else {
                        return 'The value must be an integer in the range 0 to 65535';
                    }
                },
            },
            {
                type: 'list',
                name: 'database',
                message: 'Do you want to include a database?',
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false },
                ],
            },
            {
                type: 'list',
                name: 'databaseType',
                message: 'Which database do you prefer?',
                choices: ['MongoDB', 'PostgreSQL'],
                when: function (answers) {
                    return answers.database;
                },
            },
            {
                type: 'input',
                name: 'databaseName',
                message: 'What to name the database?',
                when: function (answers) {
                    return answers.database;
                },
                // Validation function for the database name
                validate: function (value) {
                    if (/^[a-z]+$/.test(value)) {
                        return true;
                    } else {
                        return 'Please enter a valid database name, containing only lowercase letters';
                    }
                },
            },
            {
                type: 'list',
                name: 'projectFolder',
                message: 'Where to create a project?',
                choices: function (answers) {
                    return [
                        { name: `In a folder named '${answers.projectName}'`, value: 'new' },
                        { name: 'In the current folder', value: 'current' },
                    ];
                },
            },
            {
                type: 'list',
                name: 'moreOptions',
                message: 'Want to choose additional options? (optional)',
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false },
                ],
            },
            {
                type: 'list',
                name: 'pm2Support',
                message: 'Want to add PM2 process manager support?',
                when: function (answers) {
                    return answers.moreOptions;
                },
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false },
                ],
            },
            {
                type: 'list',
                name: 'dockerSupport',
                message: 'Want to add Docker support?',
                when: function (answers) {
                    return answers.moreOptions;
                },
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false },
                ],
            },
            {
                type: 'list',
                name: 'compressionSupport',
                message: 'Want to add data compression capabilities?',
                when: function (answers) {
                    return answers.moreOptions && answers.webFramework === 'express';
                },
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false },
                ],
            },
        ];
    }

    // Method to start the CLI prompt and collect answers
    async start() {
        try {
            const answers = await inquirer.prompt(this.questions);
            return answers;
        } catch (err) {
            console.log(chalk.red.bold(err));
        }
    }
}

// Export an instance of the Questions class
export default new Questions();
