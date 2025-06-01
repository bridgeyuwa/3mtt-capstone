import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';
import { Link } from 'react-router-dom';

export default function Recommendations({ token }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    setAuthToken(token);
    API.get('/movies/recommendations').then(res => setMovies(res.data));
  }, [token]);

  return (
    <div className="home-container">
      <h2>Your Recommendations</h2>
      <div className="movies-list">
        {movies.map(movie => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="movie-card">
            <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
            <div>{movie.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}