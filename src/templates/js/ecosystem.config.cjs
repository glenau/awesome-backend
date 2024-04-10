/*
    PM2 Process Manager Configuration
*/

module.exports = {
    apps: [
        {
            name: '<%= projectName %>',
            script: 'index.js',
            instances: 1,
            exec_mode: 'fork',
        },
    ],
};
