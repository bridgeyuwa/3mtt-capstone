import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API, { setAuthToken } from '../api/api';
import '../styles/details.css';

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

  // Check if movie is already in a watchlist
  const isMovieInWatchlist = (wl) => Array.isArray(wl.movies) && wl.movies.includes(id);

  // Add/remove movie from a watchlist (toggle) -- NOW BY _id!
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
      // Refresh watchlists
      const res = await API.get('/movies/watchlists');
      setWatchlists(res.data);
    } catch (err) {
      setMessage('Failed to update watchlist.');
    }
  };

  // Delete an entire watchlist -- NOW BY _id!
  const handleDeleteWatchlist = async (watchlistId) => {
    setAuthToken(token);
    try {
      await API.delete(`/movies/watchlists/${watchlistId}`);
      setMessage(`Watchlist deleted!`);
      // Refresh watchlists
      const res = await API.get('/movies/watchlists');
      setWatchlists(res.data);
    } catch (err) {
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
      // Refresh the watchlists
      const res = await API.get('/movies/watchlists');
      setWatchlists(res.data);
    } catch (err) {
      setMessage('Failed to create watchlist.');
    }
  };

  if (!movie) return <div>Loading...</div>;

  const trailer = movie.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  return (
    <div className="details-container">
      <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} />
      <div className="details-content">
        <h2>{movie.title}</h2>
        <p>{movie.overview}</p>
        <div>Release: {movie.release_date}</div>
        <div>Rating: {movie.vote_average}/10</div>
        <div>Genres: {movie.genres?.map(g => g.name).join(', ')}</div>
        <button onClick={handleFavorite} className="fav-btn">{fav ? "★ Remove Favorite" : "☆ Add Favorite"}</button>

        {token && (
          <>
            <form onSubmit={handleReview} className="review-form">
              <h4>Rate & Review</h4>
              <input
                type="number"
                min="0"
                max="10"
                value={myRating}
                onChange={e => setMyRating(e.target.value)}
                placeholder="Rating"
                required
              />
              <textarea
                value={myReview}
                onChange={e => setMyReview(e.target.value)}
                placeholder="Your review..."
              />
              <button type="submit">Submit</button>
            </form>
            <div>
              <form onSubmit={handleCreateWatchlist} className="create-watchlist-form">
                <h4>Create New Watchlist</h4>
                <input
                  type="text"
                  value={newWatchlistName}
                  onChange={e => setNewWatchlistName(e.target.value)}
                  placeholder="Watchlist name"
                  required
                />
                <button type="submit">Create</button>
              </form>
              <h4>Watchlists</h4>
              {watchlists.length === 0
                ? <span>No watchlists found. Create one first!</span>
                : watchlists.map(wl => {
                  const inList = isMovieInWatchlist(wl);
                  return (
                    <div key={wl._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleToggleWatchlist(wl._id, inList)}
                        className={inList ? 'in-watchlist' : ''}
                        style={{
                          fontWeight: inList ? 'bold' : 'normal',
                          background: inList ? '#ffeeba' : undefined,
                          border: inList ? '2px solid #ffc107' : undefined,
                        }}
                      >
                        {inList ? '✓ ' : ''}{wl.name}
                      </button>
                      <button
                        onClick={() => handleDeleteWatchlist(wl._id)}
                        style={{ color: 'red', marginLeft: 4 }}
                        type="button"
                        title="Delete this watchlist"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })
              }
            </div>
          </>
        )}

        {trailer && (
          <div>
            <h4>Trailer</h4>
            <iframe
              width="340"
              height="200"
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title="Trailer"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}
        {message && <div className="info">{message}</div>}
        <h4>Reviews</h4>
        <div className="reviews-list">
          {reviews.map(r => (
            <div key={r._id} className="review">
              <b>{r.user.username}</b>: {r.rating}/10<br />
              <span>{r.review}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;