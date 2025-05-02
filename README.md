# Charity Water Projects

A simplified web application for managing and contributing to charity water projects, built with Node.js, Express, and vanilla JavaScript.

## Project Structure

- `index.js` - Main Express server with API endpoints and static file serving
- `backend/build/` - Contains the static frontend HTML/CSS/JS files
- `package.json` - Project dependencies and scripts

## Local Development Setup

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/NawafWork/KLAN-345.git
cd KLAN-345
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Visit `http://localhost:3000` in your browser

## API Endpoints

- `GET /api/projects` - Get all charity water projects
- `GET /api/projects/:id` - Get a specific project by ID
- `POST /api/donations` - Make a donation to a project
- `POST /api/signup` - Create a new user account
- `POST /api/login` - Log in to an existing account

## Deployment to Render

This project is configured for easy deployment to Render.com:

1. Push the code to GitHub

2. In Render.com, create a new Web Service and select your GitHub repository

3. Use the following settings:
   - Environment: Node.js
   - Build Command: `npm run build`
   - Start Command: `npm start`

4. No additional configuration is required - the app uses in-memory storage for this simplified version

## Features

- View charity water projects with progress bars
- See funding progress for each project
- User authentication (signup/login)
- Make donations to projects

## Notes

This is a simplified version with in-memory data storage. In a production application, you would want to:

1. Use a real database like MongoDB or PostgreSQL
2. Add proper authentication with password hashing
3. Implement a more robust frontend framework

## Troubleshooting

If the app appears as a static image when deployed:
1. Check that the server is correctly serving static files from `backend/build`
2. Verify that the API endpoints are responding correctly
3. Ensure the build and start commands are properly configured on Render
