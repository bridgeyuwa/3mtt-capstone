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

  const fetchWatchlists = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/watchlists`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

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
    } catch {
      setError("Failed to load watchlists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
    // eslint-disable-next-line
  }, []);

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
    } catch {
      setError("Failed to create watchlist.");
    }
  };

  const handleDeleteWatchlist = async (id) => {
    if (!window.confirm("Are you sure you want to delete this watchlist?")) return;
    try {
      await axios.delete(`${API_URL}/watchlists/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      fetchWatchlists();
    } catch {
      setError("Failed to delete watchlist.");
    }
  };

  const startEditWatchlist = (id, name) => {
    setEditWatchlistId(id);
    setEditWatchlistName(name);
  };

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
    } catch {
      setError("Failed to rename watchlist.");
    }
  };

  const cancelEditWatchlist = () => {
    setEditWatchlistId(null);
    setEditWatchlistName("");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-200">
        Loading watchlists...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div className=" mx-auto p-6 bg-gray-900 text-gray-200 min-h-screen">
      <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl mb-6 font-semibold">Your Watchlists</h2>

      <form onSubmit={handleCreateWatchlist} className="mb-6 flex space-x-3">
        <input
          value={newWatchlistName}
          onChange={e => setNewWatchlistName(e.target.value)}
          placeholder="New Watchlist Name"
          required
          className="flex-grow p-2 text-gray-900 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Create
        </button>
      </form>

      {watchlists.length === 0 ? (
        <p className="text-gray-400">No watchlists found.</p>
      ) : (
        <ul className="space-y-6">
          {watchlists.map((watchlist) => (
            <li key={watchlist._id} className="border border-gray-700 rounded p-4">
              {editWatchlistId === watchlist._id ? (
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    value={editWatchlistName}
                    onChange={e => setEditWatchlistName(e.target.value)}
                    className="flex-grow p-2 text-gray-900 rounded"
                  />
                  <button
                    onClick={() => handleRenameWatchlist(watchlist._id)}
                    className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditWatchlist}
                    className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-4">
                  <Link
                    to={`/watchlists/${watchlist._id}`}
                    className="text-xl font-semibold hover:underline"
                  >
                    {watchlist.name}
                  </Link>
                  <div className="space-x-2">
                    <button
                      onClick={() => startEditWatchlist(watchlist._id, watchlist.name)}
                      className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 transition"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDeleteWatchlist(watchlist._id)}
                      className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {watchlist.movieDetails && watchlist.movieDetails.length === 0 ? (
                <p className="text-gray-400">No movies in this watchlist.</p>
              ) : (
                <ul className="grid grid-cols-3 gap-4">
                  {(watchlist.movieDetails || []).map((movie) => (
                    <li key={movie.id} className="flex items-center space-x-3">
                      {movie.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="rounded shadow"
                          loading="lazy"
                        />
                      )}
                      <Link
                        to={`/movie/${movie.id}`}
                        className="font-medium hover:underline"
                      >
                        {movie.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
    </div>
  );
}

export default WatchlistPage;
