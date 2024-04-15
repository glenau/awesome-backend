/*
    PM2 Process Manager Configuration
*/

// Export the configuration object for PM2
module.exports = {
    // Array of applications to be managed by PM2
    apps: [
        {
            // Unique name for the application
            name: '<%= projectName %>',
            // Entry point script for the application
            script: 'index.js',
            // Number of instances to be spawned for the application
            instances: 1,
            // Execution mode for the application ('fork' or 'cluster')
            exec_mode: 'fork',
        },
    ],
};
