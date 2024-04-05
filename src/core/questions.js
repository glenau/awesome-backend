/*
    Author: Gleb Naumov (©) 2024
    License: MIT
    Project: https://github.com/glenau/awesome-backend
*/

import inquirer from 'inquirer';
import chalk from 'chalk';

class Questions {
    constructor() {
        this.questions = [
            {
                type: 'input',
                name: 'projectName',
                message: 'What is the name of your project?',
                default: 'awesome-backend',
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
                name: 'webFramework',
                message: 'Which web server framework are you interested in?',
                choices: [{ name: 'Express', value: 'express' }],
            },
            {
                type: 'input',
                name: 'serverPort',
                message: 'What port do you want to run the web server on?',
                default: '3000',
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
                message: 'Do you want to add a database?',
                choices: [
                    { name: 'Yes', value: true },
                    { name: 'No', value: false },
                ],
            },
            {
                type: 'list',
                name: 'databaseName',
                message: 'Which database do you prefer to use?',
                choices: ['MongoDB'],
                when: function (answers) {
                    return answers.database;
                },
            },
            {
                type: 'list',
                name: 'projectFolder',
                message: 'Where to create a project?',
                choices: function (answers) {
                    return [
                        { name: `In a folder with the project name '${answers.projectName}'`, value: 'new' },
                        { name: 'In the current folder', value: 'current' },
                    ];
                },
            },
        ];
    }

    async start() {
        try {
            const answers = await inquirer.prompt(this.questions);
            return answers;
        } catch (err) {
            console.log(chalk.red.bold(err));
        }
    }
}

export default new Questions();
