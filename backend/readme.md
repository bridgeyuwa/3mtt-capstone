# 🎬 3MTT Movie Recommendation App - Backend Service

![Node.js](https://img.shields.io/badge/Node.js-18-green)
![Express.js](https://img.shields.io/badge/Express.js-4.18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)

Backend service for the 3MTT Capstone project, providing RESTful APIs for movie recommendations, user management, and social features.

---

## Table of Contents
1.  [Setup](#️-setup)
2.  [Tech Stack](#-tech-stack)
3.  [Features](#-features)
4.  [Environment Setup](#-environment-setup)
5.  [Project Structure](#-project-structure)
6.  [API Documentation](#️-api-documentation)
7.  [Deployment](#-deployment)
8.  [Local Development](#-local-development)
9.  [Important Notes](#️-important-notes)
10. [Author](#-author)

---

## Setup

Follow these steps to get the backend service up and running:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bridgeyuwa/3mtt-capstone.git
    ```

2.  **Navigate into the backend directory:**
    ```bash
    cd 3mtt-capstone/backend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure environment variables:**
    Copy the `.env.example` file to a new file named `.env` and fill in the required values:
    ```bash
    cp .env.example .env
    ```

5.  **Run the application:**
    * Development mode:
        ```bash
        npm run dev
        ```
    * Production mode:
        ```bash
        npm start
        ```

---

## Tech Stack

- **Runtime**: Node.js v18+
- **Backend Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **Environment Management**: dotenv
- **CORS Handling**: cors
- **HTTP Client**: Axios
- **External API**: TMDB (The Movie Database)
- **Development Tools**: nodemon

---

## Features

### User Authentication
- Register and login users  
- Secure password handling with bcrypt  
- JWT token-based route protection  

### Movie Discovery
- Search by title, genre, year  
- Filter by rating, release date, popularity  
- View detailed info and trailers  
- Get personalized recommendations  

### User Features
- Save favorite movies  
- Create and manage custom watchlists  
- Submit ratings and reviews  
- Edit profile information  

### Social Features
- Follow/unfollow users  
- View followers and following  
- Share public watchlists  

### Technical Capabilities
- RESTful Express.js API  
- MongoDB for persistence  
- TMDB API integration  
- PWA support for offline access  
- Responsive-first design

---

## Environment Setup

Example `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TMDB_API_KEY=your_tmdb_api_key
FRONTEND_URL=http://localhost:3000 
PORT=5000
```

---

## Project Structure

```
backend/
├── controllers/      # Request handlers
├── middleware/       # Auth middleware
├── models/           # Mongoose schemas
├── routes/           # Route definitions
├── utils/            # Helpers and API clients
├── .env              # Environment file
├── .env.example      # Sample env vars
├── package.json      # Node config
└── server.js         # App entry point
```

---

## API Documentation

All endpoints follow REST principles. Auth-protected routes require a `Bearer <token>` in the `Authorization` header.

---

### User Routes

| Method | Route                       | Description                           |
|--------|----------------------------|---------------------------------------|
| POST   | `/api/auth/register`       | Register new user                     |
| POST   | `/api/auth/login`          | Login and get JWT                     |
| GET    | `/api/users/me`            | Get current user's profile            |
| PUT    | `/api/users/me`            | Update current user's profile         |
| GET    | `/api/users`               | List all users                        |
| GET    | `/api/users/:userId`       | View a user's public profile          |
| POST   | `/api/users/:userId/follow`| Follow a user                         |
| POST   | `/api/users/:userId/unfollow` | Unfollow a user                    |
| GET    | `/api/users/:userId/followers` | Get user's followers               |
| GET    | `/api/users/:userId/following` | Get user's following list          |

---

### Movie Routes

| Method | Route                         | Description                                 |
|--------|------------------------------|---------------------------------------------|
| POST   | `/api/movies/favorite/:id`    | Add to favorites (auth required)            |
| DELETE | `/api/movies/favorite/:id`    | Remove from favorites (auth required)       |
| GET    | `/api/movies/favorites`       | List user's favorites (auth required)       |
| GET    | `/api/movies/search`          | Search movies via TMDB                      |
| GET    | `/api/movies/trending`        | Get trending movies                         |
| GET    | `/api/movies/genres`          | List TMDB genres                            |
| GET    | `/api/movies/recommendations` | Get personalized suggestions (auth)         |
| GET    | `/api/movies/:id`             | Movie details by TMDB ID                    |

---

### Watchlist Routes

| Method | Route                                | Description                          |
|--------|--------------------------------------|--------------------------------------|
| GET    | `/api/movies/watchlists`             | Get all user watchlists (auth)       |
| POST   | `/api/movies/watchlists`             | Create new watchlist (auth)          |
| PUT    | `/api/movies/watchlists/add`         | Add movie to watchlist (auth)        |
| PUT    | `/api/movies/watchlists/remove`      | Remove movie from watchlist (auth)   |
| PUT    | `/api/movies/watchlists/:id`         | Rename a watchlist (auth)            |
| DELETE | `/api/movies/watchlists/:id`         | Delete a watchlist (auth)            |
| GET    | `/api/movies/watchlists/:id`         | View public watchlist                |
| GET    | `/api/movies/users/:userId/watchlists` | Get user’s public watchlists        |

---

### Review Routes

| Method | Route                             | Description                                |
|--------|----------------------------------|--------------------------------------------|
| POST   | `/api/reviews`                   | Add/update review (auth required)          |
| GET    | `/api/reviews/movie/:movieId`    | Get all reviews for a movie                |
| GET    | `/api/reviews/user/:userId`      | Get all reviews from a user                |

---

## Deployment

You can deploy the backend to platforms like:
- [Render](https://render.com/)
- [Railway](https://railway.app/)
- [Vercel (via serverless)](https://vercel.com/)

Ensure you configure environment variables on the hosting dashboard.

---

## Local Development

- Runs on `http://localhost:5000`
- MongoDB can be local or remote (MongoDB Atlas)
- Uses `nodemon` for live-reload in dev

---

## Important Notes

- CORS is currently open to all origins (for development)
- No advanced input validation implemented
- No centralized error handler yet — add for production use
- PWA support is handled from the frontend

---

## Author

**Torkuma Jonathan Yuwa**  
 - 3MTT Fellow — Cohort 3  
 - Fellow ID: `FE/24/1478283066`  
 - GitHub: [@bridgeyuwa](https://github.com/bridgeyuwa)
