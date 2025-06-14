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
    <div className="p-6 bg-black min-h-screen text-gray-300">
      <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-2 text-gray-200">
        Your Recommendations
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.length === 0 ? (
          <div className="text-gray-600 italic col-span-full text-center py-10">
            No recommendations available.
          </div>
        ) : (
          movies.map(movie => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="bg-gray-900 rounded overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col"
            >
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}
              <div className="p-2 text-center text-gray-200 font-medium truncate">{movie.title}</div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
