Documentation for working with PM2 process manager in the '<%= projectName %>' project.

```
Version: 1.0.0.
```

## Getting Started

### Installation

1. Install PM2 globally if you haven't already:
    ```bash
    npm install -g pm2
    ```

### Running

#### Using PM2

1. Navigate to your application directory in the terminal
2. Start your application with PM2:
    ```bash
    pm2 start ecosystem.config.cjs --watch
    ```
3. PM2 will automatically manage your application as a background process

#### Using NPM

1. Navigate to your application directory in the terminal
2. Start your application with NPM:
    ```bash
    npm run dev
    ```
3. PM2 will automatically manage your application as a background process

### Managing

-   `pm2 list` - Shows a list of all running processes
-   `pm2 monit` - Show interactive screen of running processes
-   `pm2 stop <%= projectName %>` - Stops the process with the specified id
-   `pm2 restart <%= projectName %>` - Restarts the process with the specified id
-   `pm2 delete <%= projectName %>` - Deletes the process with the specified id from the PM2 process list

### Logging

When running your application with PM2, logs are automatically managed by PM2. You can view the logs using the PM2 command-line interface:

```bash
pm2 logs <%= projectName %>
```

## Help

If you have any questions or issues, feel free to refer to the PM2 documentation: [PM2 Documentation](https://pm2.keymetrics.io/docs/).

## Contact

-   [Support](mailto:glenaudev@gmail.com)
-   [NPM](https://www.npmjs.com/package/awesome-backend)
-   [GitHub](https://github.com/glenau/awesome-backend)
