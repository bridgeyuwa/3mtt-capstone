# 3MTT Movie Recommendation App (Capstone Project)

A full-stack movie recommendation platform built as a capstone project for the 3MTT Fellowship (Cohort 3). It allows users to discover, review, and manage movies while interacting with others socially.

## Author

- **Torkuma Jonathan Yuwa**  
- 3MTT Fellow — Cohort 3  
- Fellow ID: `FE/24/1478283066`  
- GitHub: [@bridgeyuwa](https://github.com/bridgeyuwa)
- Demo: https://3mtt-capstone-kappa.vercel.app/
---

## Key Features

- JWT-based user authentication
- Search movies by title, genre, year
- View detailed info, trailers, ratings
- Personalized movie recommendations
- Save favorites and manage watchlists
- Leave reviews and ratings
- Follow/unfollow other users
- Share and explore public watchlists


## Project Structure

```
3mtt-capstone/
├── backend/     # Express.js + MongoDB REST API
└── frontend/    # React + Tailwind CSS PWA
```

## Individual Project Docs

### To see detailed features and documentation for each

- **Backend Service** (Node.js + Express + MongoDB)  
  See [`backend/readme.md`](./backend/readme.md)

- **Frontend Client** (React + TailwindCSS)  
  See [`frontend/readme.md`](./frontend/readme.md)

---

## Deployment Overview

Both parts of the app can be deployed independently.

**Frontend options:**
- Local
- Netlify
- Vercel

**Backend options:**
- Local
- Render
- Railway
- Any Node.js-compatible server

**Make sure to:**
- Set up environment variables correctly for each.
- Point the frontend API base URL to the deployed backend (`REACT_APP_API_URL`).

---

## Author

- **Torkuma Jonathan Yuwa**  
- 3MTT Fellow — Cohort 3  
- Fellow ID: `FE/24/1478283066`  
- GitHub: [@bridgeyuwa](https://github.com/bridgeyuwa)
