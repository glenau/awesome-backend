# <%= projectName %>

Documentation for working with Docker in the '<%= projectName %>' project.

```
Version: 1.0.0.
```

## Getting Started

### Installation

1. Download Docker Desktop from [Docker Hub](https://hub.docker.com/):
2. Follow the installation instructions provided by the installer

### Running docker

-   Start Docker Desktop by launching the application

### Project management

1.  Build a Docker image for the project:

    ```bash
    npm run docker:build
    ```

2.  Run the Docker container for the project:

    ```bash
    npm run docker:run
    ```

### General Docker Commands

-   List all running containers:

    ```bash
    docker ps
    ```

-   List all containers:

    ```bash
    docker ps -a
    ```

-   Stop a running container:

    ```bash
    docker stop <container_id>
    ```

-   Remove a container:

    ```bash
    docker rm <container_id>
    ```

-   Remove an image:

    ```bash
    docker rmi <image_id>
    ```

-   View logs of a container:

    ```bash
    docker logs <container_id>
    ```

-   Execute a command inside a container:
    ```bash
    docker exec -it <container_id> <command>
    ```

## Help

If you have any questions or issues, feel free to refer to [Official Docker Documentation](https://www.docker.com/support/).

## Contact

-   [Support](mailto:glenaudev@gmail.com)
-   [NPM](https://www.npmjs.com/package/awesome-backend)
-   [GitHub](https://github.com/glenau/awesome-backend)
