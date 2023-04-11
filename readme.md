# JustJoin.it Clone Backend

This project is the backend for the JustJoin.it Clone, a job portal web application built using the MERN stack (MongoDB, Express, React, and Node.js). The application follows the Model-View-Controller (MVC) architecture, where the frontend (View) is created using the modern React framework, and the backend handles the Model and Controller parts.

## Features and Design Patterns

The backend for the JustJoin.it Clone utilizes modern design patterns and best practices to ensure a well-structured, maintainable, and scalable codebase. We have separated the code into logical modules to improve readability and make it easier to understand and manage. The application is tested using Jest and Supertest, ensuring the reliability and stability of the codebase.

## Libraries and Dependencies

The backend is built using a variety of popular libraries and dependencies, some of which are listed below:

- **bcrypt**: A library for hashing and comparing passwords securely.
- **body-parser**: A middleware for parsing request bodies in Express applications.
- **cors**: A package for enabling Cross-Origin Resource Sharing (CORS) in Express applications.
- **express**: A fast, unopinionated, minimalist web framework for Node.js.
- **jsonwebtoken**: A library for handling JSON Web Tokens (JWT) for authentication and authorization.
- **mongoose**: A MongoDB object modeling tool designed to work in an asynchronous environment.
- **passport**: A popular authentication middleware for Node.js.
- **validator**: A library for data validation and sanitization.

For a full list of libraries and their versions used in this project, please refer to the `package.json` file.

## Running the Backend

To run the backend, follow these steps:

1. Clone the repository.
2. Navigate to the project directory and install the dependencies using `yarn install` or `npm install`.
3. Start the server by running `yarn start` or `npm start`.

## Summary

The JustJoin.it Clone Backend is a MERN stack-based web application that streamlines the job application process. It allows users to select their roles (applicant or recruiter), create an account, and manage various aspects of the job application process. With secure authentication and authorization using JWT tokens, modern design patterns, and a well-structured codebase, this project serves as a solid foundation for building a comprehensive job portal system.
