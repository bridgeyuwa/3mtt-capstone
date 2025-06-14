import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API, { setAuthToken } from '../api/api';

function MovieDetails({ token }) {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [fav, setFav] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState('');
  const [myReview, setMyReview] = useState('');
  const [watchlists, setWatchlists] = useState([]);
  const [message, setMessage] = useState('');
  const [newWatchlistName, setNewWatchlistName] = useState('');

  useEffect(() => {
    API.get(`/movies/${id}`).then(res => setMovie(res.data));
    API.get(`/reviews/movie/${id}`).then(res => setReviews(res.data));
    if (token) {
      setAuthToken(token);
      API.get('/movies/favorites').then(res => setFav(res.data.includes(id)));
      API.get('/movies/watchlists').then(res => setWatchlists(res.data));
    }
  }, [id, token]);

  const handleFavorite = async () => {
    setAuthToken(token);
    if (!fav) {
      await API.post(`/movies/favorite/${id}`);
      setFav(true);
      setMessage('Added to favorites!');
    } else {
      await API.delete(`/movies/favorite/${id}`);
      setFav(false);
      setMessage('Removed from favorites!');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setAuthToken(token);
    await API.post('/reviews', { movieId: id, rating: myRating, review: myReview });
    setMessage('Review submitted!');
    API.get(`/reviews/movie/${id}`).then(res => setReviews(res.data));
  };

  const isMovieInWatchlist = (wl) => Array.isArray(wl.movies) && wl.movies.includes(id);

  const handleToggleWatchlist = async (watchlistId, alreadyInList) => {
    setAuthToken(token);
    try {
      if (!alreadyInList) {
        await API.put('/movies/watchlists/add', { watchlistId, movieId: id });
        setMessage(`Added to watchlist`);
      } else {
        await API.put('/movies/watchlists/remove', { watchlistId, movieId: id });
        setMessage(`Removed from watchlist`);
      }
      const res = await API.get('/movies/watchlists');
      setWatchlists(res.data);
    } catch {
      setMessage('Failed to update watchlist.');
    }
  };

  const handleDeleteWatchlist = async (watchlistId) => {
    setAuthToken(token);
    try {
      await API.delete(`/movies/watchlists/${watchlistId}`);
      setMessage(`Watchlist deleted!`);
      const res = await API.get('/movies/watchlists');
      setWatchlists(res.data);
    } catch {
      setMessage('Failed to delete watchlist.');
    }
  };

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    setAuthToken(token);
    try {
      await API.post('/movies/watchlists', { name: newWatchlistName });
      setMessage(`Watchlist "${newWatchlistName}" created!`);
      setNewWatchlistName('');
      const res = await API.get('/movies/watchlists');
      setWatchlists(res.data);
    } catch {
      setMessage('Failed to create watchlist.');
    }
  };

  if (!movie) return <div className="text-center mt-10 text-gray-300">Loading...</div>;

  const trailer = movie.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  return (
    <div className="mx-auto p-4 flex flex-col md:flex-row gap-8 text-gray-300 bg-gray-900 min-h-screen max-w-7xl">
      {/* Left: Poster and Trailer */}
      <div className="flex flex-col items-center md:items-start w-full md:w-1/3 gap-6">
        <img
          className="w-full max-w-xs rounded shadow-lg object-contain"
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
          alt={movie.title}
          style={{ maxHeight: '450px' }}
        />
        {trailer && (
          <div className="w-full max-w-xs">
            <h4 className="font-semibold text-lg mb-2 text-white">Trailer</h4>
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Trailer"
              frameBorder="0"
              allowFullScreen
              className="rounded shadow-lg"
            />
          </div>
        )}
      </div>

      {/* Right: Details and interactions */}
      <div className="flex-1 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-white">{movie.title}</h2>
        <p className="text-gray-400 leading-relaxed">{movie.overview}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div>Release: {movie.release_date}</div>
          <div>Rating: {movie.vote_average}/10</div>
          <div>Genres: {movie.genres?.map(g => g.name).join(', ')}</div>
        </div>

        <button
          onClick={handleFavorite}
          className={`px-4 py-2 rounded ${
            fav ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } font-semibold transition w-max`}
        >
          {fav ? "★ Remove Favorite" : "☆ Add Favorite"}
        </button>

        {token && (
          <>
            {/* Review form */}
            <form onSubmit={handleReview} className="flex flex-col gap-3 border border-gray-700 p-4 rounded shadow-sm max-w-xl">
              <h4 className="font-semibold text-lg text-white">Rate & Review</h4>
              <input
                type="number"
                min="0"
                max="10"
                value={myRating}
                onChange={e => setMyRating(e.target.value)}
                placeholder="Rating"
                required
                className="border border-gray-600 bg-gray-800 text-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                value={myReview}
                onChange={e => setMyReview(e.target.value)}
                placeholder="Your review..."
                className="border border-gray-600 bg-gray-800 text-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                rows={3}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition w-max"
              >
                Submit
              </button>
            </form>

            {/* Watchlists */}
            <div className="max-w-xl">
              <form onSubmit={handleCreateWatchlist} className="flex flex-col gap-2 mb-6 border border-gray-700 p-4 rounded shadow-sm">
                <h4 className="font-semibold text-lg text-white">Create New Watchlist</h4>
                <input
                  type="text"
                  value={newWatchlistName}
                  onChange={e => setNewWatchlistName(e.target.value)}
                  placeholder="Watchlist name"
                  required
                  className="border border-gray-600 bg-gray-800 text-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition w-fit"
                >
                  Create
                </button>
              </form>

              <h4 className="font-semibold text-xl mb-2 text-white">Watchlists</h4>
              {watchlists.length === 0 ? (
                <span className="text-gray-500">No watchlists found. Create one first!</span>
              ) : (
                watchlists.map(wl => {
                  const inList = isMovieInWatchlist(wl);
                  return (
                    <div key={wl._id} className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => handleToggleWatchlist(wl._id, inList)}
                        className={`px-3 py-1 rounded transition font-semibold ${
                          inList
                            ? 'bg-yellow-300 border-2 border-yellow-500 font-bold text-black'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {inList ? '✓ ' : ''}
                        {wl.name}
                      </button>
                      <button
                        onClick={() => handleDeleteWatchlist(wl._id)}
                        className="text-red-600 hover:underline ml-2"
                        type="button"
                        title="Delete this watchlist"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {message && (
          <div className="mt-4 p-2 bg-blue-900 text-blue-300 rounded max-w-xl">{message}</div>
        )}

        {/* Reviews */}
        <div className="max-w-xl">
          <h4 className="font-semibold text-xl mb-2 text-white">Reviews</h4>
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto bg-gray-800 p-4 rounded shadow-inner">
            {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
            {reviews.map(r => (
              <div key={r._id} className="border-b border-gray-700 pb-2 last:border-none">
                <b className="text-white">{r.user.username}</b>: {r.rating}/10
                <br />
                <span className="text-gray-400">{r.review}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
