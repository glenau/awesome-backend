# Use the latest Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Set an environment variable indicating that Docker is being used
ENV DOCKER=true

# Copy the application files from the host machine to the container
COPY . .

# Expose port <%= serverPort %> to the outside world
EXPOSE <%= serverPort %>

# Define the default command to run when the container starts
CMD ["node", "index.js"]