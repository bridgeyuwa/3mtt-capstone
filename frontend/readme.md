# 🎬 3MTT Movie Recommendation App - Frontend

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-teal)
![Axios](https://img.shields.io/badge/Axios-1.3.4-purple)
![React Router](https://img.shields.io/badge/React--Router--DOM-6.15.0-orange)

Frontend for the 3MTT Capstone Movie Recommendation App, built with React and Tailwind CSS.

---

## 🧰 Tech Stack

- **React** v18.2.0 (via Create React App)
- **Tailwind CSS** v3.3 (with `@tailwindcss/forms` plugin)
- **React Router DOM** v6.15.0 (for routing)
- **Axios** v1.3.4 (for HTTP requests)
- **PostCSS** and **Autoprefixer** for styling utilities

---

## 🚀 Features

### 🎥 Movie Discovery
- Search movies by title, genre, or year
- Filter by rating, release date, and popularity
- View detailed movie information (trailers, overview, cast)
- Get personalized movie recommendations

### 👤 User Features
- Register and log in with JWT auth
- Save favorite movies
- Create and manage custom watchlists
- Rate and review movies
- Profile dashboard for reviews and watchlists

### 🌐 Social Features
- Follow and unfollow other users
- View and share public watchlists

### 🛠 Technical
- React + TailwindCSS responsive UI
- React Router navigation system
- Axios integration with Express backend
- PWA support (progressive web app)

---

## 📁 Pages (Located in `src/pages/`)

| Page                 | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `Home.js`            | Displays trending movies and general discovery.                             |
| `Login.js`           | User login form.                                                            |
| `Register.js`        | New user registration form.                                                 |
| `MovieDetails.js`    | Shows movie details, trailers, reviews, and interaction buttons.            |
| `Profile.js`         | User's profile page with bio, reviews, watchlists, and social connections.  |
| `Recommendations.js` | Personalized movie suggestions for the logged-in user.                      |
| `Users.js`           | List of all users to explore and follow.                                    |
| `Watchlists.js`      | User’s personal and public watchlists overview.                             |
| `WatchlistDetails.js`| Detailed view of a specific watchlist and its movies.                       |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_TMDB_API_KEY=your_tmdb_api_key
```

---

## 🖥️ Local Development

```bash
npm install
npm run start   # or npm run dev
```

---

## 🚢 Deployment

To deploy the frontend app:

1. **Build the app for production:**
   ```bash
   npm run build
   ```
   This creates an optimized `build/` directory.

2. **Choose a deployment method:**
   - **Static Hosts:** Upload the `build/` folder to platforms like:
     - [Netlify](https://www.netlify.com/)
     - [Vercel](https://vercel.com/)
     - [GitHub Pages](https://pages.github.com/)
   - **Custom Servers:** Serve using NGINX or Express static middleware.

3. **Environment Variables:**
   On platforms like Netlify or Vercel, define the `.env` values in the dashboard under project settings → environment variables.

---

## 🧑 Author

**Torkuma Jonathan Yuwa**  
3MTT Fellow ID: **FE/24/1478283066**  
Cohort: **Cohort 3**  
GitHub: [bridgeyuwa](https://github.com/bridgeyuwa)