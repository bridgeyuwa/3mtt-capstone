import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/movies";
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function WatchlistDetails() {
  const { id } = useParams();
  const [watchlist, setWatchlist] = useState(null);
  const [movieDetails, setMovieDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWatchlistAndMovies = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/watchlists/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setWatchlist(res.data);

        if (Array.isArray(res.data.movies) && res.data.movies.length > 0) {
          const details = await Promise.all(
            res.data.movies.map(async (movieId) => {
              try {
                const tmdbRes = await axios.get(
                  `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
                );
                return tmdbRes.data;
              } catch {
                return { id: movieId, title: "Unknown Movie" };
              }
            })
          );
          setMovieDetails(details);
        } else {
          setMovieDetails([]);
        }
      } catch {
        setError("Failed to load watchlist details.");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistAndMovies();
  }, [id]);

  const handleCopyLink = () => {
    const shareLink = `${window.location.origin}/watchlists/${id}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-200">
        Loading watchlist details...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500 font-semibold">
        {error}
      </div>
    );
  if (!watchlist)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-200">
        Watchlist not found.
      </div>
    );

  return (
    <div className="mx-auto p-6 bg-gray-900 text-gray-200 min-h-screen">
      <Link
        to="/watchlists"
        className="inline-block mb-4 text-blue-400 hover:underline"
      >
        &larr; Back to Watchlists
      </Link>
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold flex items-center">
        {watchlist.name}
        <button
          onClick={handleCopyLink}
          title="Copy shareable link"
          className={`ml-4 px-3 py-1 rounded border transition ${
            copied
              ? "bg-green-600 border-green-600"
              : "bg-gray-800 border-gray-700 hover:bg-gray-700"
          } text-sm`}
        >
          {copied ? "Copied!" : "Copy & Share watchlist"}
        </button>
      </h2>

      <h4 className="mt-6 mb-3 text-xl font-medium">Movies in this watchlist:</h4>

      {movieDetails.length === 0 ? (
        <p className="text-gray-400">No movies in this watchlist.</p>
      ) : (
        <ul className="space-y-4">
          {movieDetails.map((movie) => (
            <li key={movie.id}>
              <Link
                to={`/movie/${movie.id}`}
                className="flex items-center space-x-4 hover:bg-gray-800 p-3 rounded transition"
              >
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    className="rounded shadow-sm"
                    loading="lazy"
                  />
                )}
                <span className="font-medium">{movie.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}

export default WatchlistDetails;
