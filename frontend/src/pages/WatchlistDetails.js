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
        // 1. Fetch the watchlist
        const res = await axios.get(`${API_URL}/watchlists/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setWatchlist(res.data);

        // 2. Fetch all movie details for this watchlist
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
      } catch (err) {
        setError("Failed to load watchlist details.");
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlistAndMovies();
  }, [id]);

  // Share (Copy Link) functionality
  const handleCopyLink = () => {
    const shareLink = `${window.location.origin}/watchlists/${id}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000); //set copied back to false after 3 seconds
    });
  };

  if (loading) return <div>Loading watchlist details...</div>;
  if (error) return <div>{error}</div>;
  if (!watchlist) return <div>Watchlist not found.</div>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link to="/watchlists">&larr; Back to Watchlists</Link>
      <h2>
        {watchlist.name}{" "}
        <button
          onClick={handleCopyLink}
          style={{
            marginLeft: 10,
            padding: "4px 10px",
            borderRadius: 4,
            border: "1px solid #ddd",
            background: "#f9f9f9",
            cursor: "pointer",
            fontSize: 14,
          }}
          title="Copy shareable link"
        >
          {copied ? "Copied!" : "Copy and Share"}
        </button>
      </h2>
      <h4>Movies in this watchlist:</h4>
      {movieDetails.length === 0 ? (
        <p>No movies in this watchlist.</p>
      ) : (
        <ul>
          {movieDetails.map((movie) => (
            <li key={movie.id} style={{ marginBottom: 12 }}>
              <Link to={`/movie/${movie.id}`} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", color: "inherit", fontWeight: 500 }}>
                {movie.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    style={{ verticalAlign: "middle", marginRight: 8, borderRadius: 4, boxShadow: "0 1px 2px #aaa" }}
                  />
                )}
                {movie.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WatchlistDetails;