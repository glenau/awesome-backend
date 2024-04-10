Documentation for working with <%= databaseType %> in the '<%= projectName %>' project.

```
Version: 1.0.0.
```

<% if(databaseType === 'MongoDB') { -%>## Getting Started

### Installation

#### MacOS

1. Install MongoDB using [Homebrew](https://brew.sh/):
    ```bash
    brew install mongodb-community
    ```

#### Windows

1. Download [MongoDB Download Center](https://www.mongodb.com/try/download/community) from the official website.
2. Follow the installation instructions provided by the installer.

#### Linux

1. Install MongoDB using the package manager of your distribution. For example, on Ubuntu:
    ```bash
    sudo apt-get install -y mongodb
    ```

### Running

#### MacOS

1. Start MongoDB server using [Homebrew](https://brew.sh/) services:
    ```bash
    brew services start mongodb-community
    ```

#### Windows

1. Start MongoDB server from the command prompt or PowerShell:
    ```bash
    mongod
    ```

#### Linux

1. Start MongoDB service using systemctl:
    ```bash
    sudo systemctl start mongodb
    ```

## MongoDB Compass

MongoDB Compass is a graphical user interface for MongoDB. You can download it from the [official MongoDB website](https://www.mongodb.com/try/download/compass).

## Help

If you have any questions or issues, feel free to refer to [MongoDB Documentation](https://docs.mongodb.com/).
<% } -%>
<% if(databaseType === 'PostgreSQL') { -%>## Getting Started

### Installation

#### MacOS

1. Install PostgreSQL using [Homebrew](https://brew.sh/):
    ```bash
    brew install postgresql
    ```

#### Windows

1. Download [PostgreSQL Download Page](https://www.postgresql.org/download/) from the official website.
2. Follow the installation instructions provided by the installer.

#### Linux

1. Install PostgreSQL using the package manager of your distribution. For example, on Ubuntu:
    ```bash
    sudo apt-get install -y postgresql
    ```

### Running

#### MacOS

1. Start PostgreSQL server using [Homebrew](https://brew.sh/) services:
    ```bash
    brew services start postgresql
    ```

#### Windows

1. Start PostgreSQL server from the command prompt or PowerShell:
    ```bash
    pg_ctl -D /usr/local/var/postgres start
    ```

#### Linux

1. Start PostgreSQL service using systemctl:
    ```bash
    sudo systemctl start postgresql
    ```

## pgAdmin 4

pgAdmin 4 is a graphical user interface for PostgreSQL. You can download it from the [official PostgreSQL website](https://www.postgresql.org/ftp/pgadmin/pgadmin4/).

## Help

If you have any questions or issues, feel free to refer to [PostgreSQL Documentation](https://www.postgresql.org/docs/).
<% } -%>

## Contact

-   [Support](mailto:glenaudev@gmail.com)
-   [NPM](https://www.npmjs.com/package/awesome-backend)
-   [GitHub](https://github.com/glenau/awesome-backend)
