# Notes App

This is a full-stack notes application built with Node.js for the backend and Angular for the frontend. It allows users to sign up, log in, add, edit, delete, and view notes. The backend server is built with Express.js and MongoDB, and the frontend is built with Angular and Tailwind CSS.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)

## Features

- User authentication with JWT
- Add, edit, delete, and view notes
- Forgot and reset password functionality
- Responsive design using Tailwind CSS

## Technologies Used

- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Nodemailer
- Frontend: Angular, Tailwind CSS
- Authentication: JSON Web Tokens (JWT)

## Prerequisites

- Node.js (v14.x or later)
- Angular CLI (v18.x or later)
- MongoDB (local or remote instance)

## Installation

### Backend

1. Clone the repository:

    ```sh
    git clone https://github.com/manthanank/notes-app.git
    cd notes-app/backend
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file in the `backend` directory with the following content:

    ```bash
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-email-password
    ```

4. Start the backend server:

    ```sh
    npm start
    ```

### Frontend

1. Navigate to the frontend directory:

    ```sh
    cd notes-app
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Start the frontend server:

    ```sh
    ng serve
    ```

## Running the Application

- The backend server will run on `http://localhost:5000`.
- The frontend server will run on `http://localhost:4200`.

## API Endpoints

### Auth

- **POST /api/auth/signup**: Create a new user
- **POST /api/auth/login**: Authenticate a user and get a token
- **POST /api/auth/forgot-password**: Send password reset email
- **POST /api/auth/reset-password/:token**: Reset user password

### Notes

- **GET /api/notes**: Get all notes for the authenticated user
- **POST /api/notes**: Add a new notes
- **PUT /api/notes/:id**: Update an existing notes
- **DELETE /api/notes/:id**: Delete an notes

## Usage

1. **Sign Up**: Create a new account by navigating to the sign-up page.
2. **Log In**: Log in with your credentials to access the notes app.
3. **Forgot Password**: If you forget your password, use the forgot password link to reset it.
4. **Reset Password**: Follow the instructions in the reset password email to set a new password.
5. **Add notes**: Use the form to add a new notes.
6. **View Notes**: View all notes on the home page.
7. **Edit notes**: Click on an notes to edit its details.
8. **Delete notes**: Click the delete button to remove an notes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
