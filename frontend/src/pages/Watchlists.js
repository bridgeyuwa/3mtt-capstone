import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/movies";
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

function WatchlistPage() {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [editWatchlistId, setEditWatchlistId] = useState(null);
  const [editWatchlistName, setEditWatchlistName] = useState("");

  // Fetch all watchlists for the logged-in user
  const fetchWatchlists = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/watchlists`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // For each watchlist, fetch movie details for each movieId in the list
      const watchlistsWithMovies = await Promise.all(
        res.data.map(async (watchlist) => {
          const movieDetails = await Promise.all(
            (Array.isArray(watchlist.movies) ? watchlist.movies : []).map(async (movieId) => {
              try {
                const response = await axios.get(
                  `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
                );
                return response.data;
              } catch {
                return { id: movieId, title: "Unknown Movie" };
              }
            })
          );
          return { ...watchlist, movieDetails };
        })
      );
      setWatchlists(watchlistsWithMovies);
    } catch (err) {
      setError("Failed to load watchlists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
    // eslint-disable-next-line
  }, []);

  // Create a new watchlist
  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;
    try {
      await axios.post(
        `${API_URL}/watchlists`,
        { name: newWatchlistName },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setNewWatchlistName("");
      fetchWatchlists();
    } catch (err) {
      setError("Failed to create watchlist.");
    }
  };

  // Delete a watchlist
  const handleDeleteWatchlist = async (id) => {
    if (!window.confirm("Are you sure you want to delete this watchlist?")) return;
    try {
      await axios.delete(`${API_URL}/watchlists/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchWatchlists();
    } catch (err) {
      setError("Failed to delete watchlist.");
    }
  };

  // Start editing a watchlist name
  const startEditWatchlist = (id, name) => {
    setEditWatchlistId(id);
    setEditWatchlistName(name);
  };

  // Save renamed watchlist
  const handleRenameWatchlist = async (id) => {
    if (!editWatchlistName.trim()) return;
    try {
      await axios.put(
        `${API_URL}/watchlists/${id}`,
        { name: editWatchlistName },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setEditWatchlistId(null);
      setEditWatchlistName("");
      fetchWatchlists();
    } catch (err) {
      setError("Failed to rename watchlist.");
    }
  };

  // Cancel editing watchlist name
  const cancelEditWatchlist = () => {
    setEditWatchlistId(null);
    setEditWatchlistName("");
  };

  if (loading) return <div>Loading watchlists...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>Your Watchlists</h2>

      {/* Create Watchlist Form */}
      <form onSubmit={handleCreateWatchlist} style={{ marginBottom: 20 }}>
        <input
          value={newWatchlistName}
          onChange={e => setNewWatchlistName(e.target.value)}
          placeholder="New Watchlist Name"
          required
          style={{ padding: "6px 10px", fontSize: 16 }}
        />{" "}
        <button type="submit" style={{ padding: "6px 14px", fontSize: 16 }}>Create</button>
      </form>

      {watchlists.length === 0 ? (
        <p>No watchlists found.</p>
      ) : (
        <ul>
          {watchlists.map((watchlist) => (
            <li key={watchlist._id} style={{ marginBottom: 18 }}>
              {/* Editable name or plain text with clickable link */}
              {editWatchlistId === watchlist._id ? (
                <>
                  <input
                    value={editWatchlistName}
                    onChange={e => setEditWatchlistName(e.target.value)}
                    style={{ fontSize: 16, padding: "4px 8px" }}
                  />{" "}
                  <button onClick={() => handleRenameWatchlist(watchlist._id)}>Save</button>{" "}
                  <button onClick={cancelEditWatchlist}>Cancel</button>
                </>
              ) : (
                <>
                  <Link to={`/watchlists/${watchlist._id}`} style={{ textDecoration: "none" }}>
                    <strong style={{ fontSize: 18 }}>{watchlist.name}</strong>
                  </Link>{" "}
                  <button onClick={() => startEditWatchlist(watchlist._id, watchlist.name)}>Rename</button>{" "}
                  <button onClick={() => handleDeleteWatchlist(watchlist._id)} style={{ color: "red" }}>Delete</button>
                </>
              )}
              {/* Movie previews */}
              <ul style={{ marginTop: 8 }}>
                {(watchlist.movieDetails && watchlist.movieDetails.length === 0) ? (
                  <li>No movies in this watchlist.</li>
                ) : (
                  (watchlist.movieDetails || []).map((movie) => (
                    <li key={movie.id} style={{ marginBottom: 6 }}>
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
                  ))
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WatchlistPage;