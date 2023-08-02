# Barbell Factor API

## Description
This is a fitness tracking app built with a Node.js and Express backend and MongoDB database. Users can track their workouts, nutrition, and customize training programs.

## Features
- User authentication and account management
- Track exercises completed with details like weight, sets, reps etc
- Log cardio workouts with distance and time
- Record daily nutrition intake and macros
- Create customizable training programs and routines
- Assign and track programs for clients as a coach user
- Search exercises and workouts

## Usage
The backend API provides the following endpoints:

### Users
- `POST /users` - Register a new user
- `POST /users/login` - Login and receive a JSON Web Token
- `GET /users/:userId` - Get user details
- `POST /users/:userId/workouts` - Add a new workout
- `GET /users/:userId/workouts` - Get user's workout history
- `POST /users/:userId/nutrition` - Log daily nutrition intake

### Workouts
- `GET /workouts` - Get all workout templates
- `GET /workouts/:workoutId` - Get a single workout
- `POST /workouts` - Create a new workout template (requires auth)

### Exercises
- `GET /exercises` - Get all exercises
- `GET /exercises/:exerciseId` - Get an exercise
- `POST /exercises` - Create a new exercise (requires auth)

### Programs
- `GET /programs` - Get all programs
- `GET /programs/:programId` - Get a program
- `POST /programs` - Create a new program (requires auth)
- `PUT /programs/:programId` - Update an existing program (requires auth)
- `DELETE /programs/:programId` - Delete a program (requires auth)

## Technologies
- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens
- Bcrypt

## Setup
- Run `npm install` to install dependencies
- Run `npm run dev` to run the server in development
- Run `npm start` to run the server in production
