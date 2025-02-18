# Quiz API - Documentation

## Overview

This API provides functionalities for user authentication and quiz management, allowing users to create, modify, and delete quizzes. It supports user signup, login, and JWT-based authentication.

## Technologies Used

- **Node.js** with **Express.js** for the backend
- **JWT (JSON Web Token)** for authentication
- **File-based storage** using JSON files
- **dotenv** for environment variables management

## Installation & Setup

### Prerequisites

- Node.js installed
- `npm` or `yarn` package manager

### Steps to Run

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd <project-directory>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and define:
   ```sh
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```sh
   npm start
   ```

## API Endpoints

### Authentication Routes

#### 1. User Signup

**POST** `/signup`

- **Request Body:**
  ```json
  {
    "fname": "John",
    "lname": "Doe",
    "email": "john@example.com",
    "passhash": "hashedpassword"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User John Doe Created",
    "userid": "uuid",
    "token": "jwt-token"
  }
  ```

#### 2. User Login

**POST** `/login`

- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "hashedpassword"
  }
  ```
- **Response:**
  ```json
  {
    "token": "jwt-token",
    "user": { "userid": "uuid", "email": "john@example.com" }
  }
  ```

#### 3. Verify JWT Token

**GET** `/verifyMe`

- Requires **JWT Token** in headers
- **Response:**
  ```json
  {
    "message": "User verified",
    "userid": "uuid"
  }
  ```

### Quiz Management Routes

#### 4. Create Quiz

**POST** `/quizes`

- Requires **JWT Token** in headers
- **Request Body:**
  ```json
  {
    "title": "Quiz Title",
    "optionshuffleEnabled": true,
    "questionshuffleEnabled": false,
    "ques": []
  }
  ```
- **Response:**
  ```json
  {
    "message": "Quiz added",
    "id": "uuid"
  }
  ```

#### 5. Get All User Quizzes

**GET** `/quizes`

- Requires **JWT Token** in headers
- **Response:**
  ```json
  [ { "id": "uuid", "title": "Quiz Title" } ]
  ```

#### 6. Get Specific Quiz

**GET** `/quiz/:quizid`

- Requires **JWT Token** in headers
- **Response:**
  ```json
  {
    "id": "uuid",
    "title": "Quiz Title",
    "ques": []
  }
  ```

#### 7. Edit Quiz Title

**PUT** `/editTitle/:quizid`

- Requires **JWT Token** in headers
- **Request Body:**
  ```json
  {
    "title": "Updated Title"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Quiz title updated successfully",
    "title": "Updated Title"
  }
  ```

#### 8. Delete Quiz

**DELETE** `/delete/:quizid`

- Requires **JWT Token** in headers
- **Response:**
  ```json
  {
    "message": "Quiz deleted successfully"
  }
  ```

## Contribution

Feel free to contribute by submitting pull requests, reporting issues, or suggesting improvements!

## License

MIT License

