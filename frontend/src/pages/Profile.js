import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';
import { useParams } from 'react-router-dom';
import '../styles/profile.css';
import { Link } from "react-router-dom";

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

export default function Profile({ token, onLogout }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', avatar: '' });
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [message, setMessage] = useState('');
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  useEffect(() => {
    setAuthToken(token);
    API.get(userId ? `/users/${userId}` : '/users/me').then(async res => {
      setUser(res.data);
      setForm({ bio: res.data.bio, avatar: res.data.avatar });

      // Use populated followers/following directly from user object
      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);

      // Fetch favorite movie details from TMDB
      if (res.data.favorites && res.data.favorites.length > 0) {
        try {
          const movies = await Promise.all(
            res.data.favorites.map(id =>
              fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null)
            )
          );
          setFavoriteMovies(movies.filter(Boolean));
        } catch (err) {
          setFavoriteMovies([]);
        }
      } else {
        setFavoriteMovies([]);
      }
    });

    // REMOVE these lines:
    // if (userId) {
    //   API.get(`/social/followers/${userId}`).then(res => setFollowers(res.data));
    //   API.get(`/social/following/${userId}`).then(res => setFollowing(res.data));
    // }
  }, [token, userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setAuthToken(token);
    await API.put('/users/me', form);
    setEditing(false);
    setMessage('Profile updated!');
    API.get('/users/me').then(res => setUser(res.data));
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>{user.username}'s Profile</h2>
      <img src={user.avatar || "https://ui-avatars.com/api/?name=" + user.username} alt="avatar" className="avatar" />
      <div><b>Email:</b> {user.email}</div>
      <div><b>Bio:</b> {user.bio}</div>
      <button onClick={onLogout}>Logout</button>
      <button onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit Profile"}</button>
      {editing && (
        <form onSubmit={handleUpdate} className="profile-form">
          Edit Bio: <input value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Bio" />
          Edit Avatar URL: <input value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} placeholder="Avatar URL" />
          <button type="submit">Save</button>
        </form>
      )}
      {message && <div className="info">{message}</div>}
      <h3>Favorites</h3>
      <ul>
        {(favoriteMovies.length > 0)
          ? favoriteMovies.map(m => (
            <li key={m.id}>
              <a href={`/movie/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {m.title || m.name || m.original_title || 'Unknown Title'}
                {m.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                    alt={m.title || m.name}
                    style={{ verticalAlign: 'middle', marginLeft: 8, height: 50 }}
                  />
                )}
              </a>
            </li>
          ))
          // fallback: show IDs if fetch fails
          : (user.favorites && user.favorites.length > 0
            ? user.favorites.map(f => <li key={f}>{f}</li>)
            : <li>No favorites yet.</li>
          )
        }
      </ul>
      <h3>Watchlists</h3>
      <ul>
        {user.watchlists && user.watchlists.length > 0
          ? user.watchlists.map(wl => (
            <li key={wl._id || wl.name}>
              <Link to={`/watchlists/${wl._id}`}>{wl.name}</Link>
            </li>
          ))
          : <li>No watchlists yet.</li>
        }
      </ul>
      <h3>Followers: {followers.length} | Following: {following.length}</h3>
      <div>
        <b>Followers:</b> {followers.map(f => f.username).join(', ')}
      </div>
      <div>
        <b>Following:</b> {following.map(f => f.username).join(', ')}
      </div>
    </div>
  );
}