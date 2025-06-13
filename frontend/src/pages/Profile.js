import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';
import { useParams, Link } from 'react-router-dom';
import '../styles/profile.css';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

export default function Profile({ token, onLogout, me, refreshMe }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', avatar: '' });
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [message, setMessage] = useState('');
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [error, setError] = useState('');
  const [watchlists, setWatchlists] = useState([]); // <-- NEW STATE

  // Determine if this is my own profile
  const myId = me?._id;
  const isOwnProfile = !userId || (myId && String(userId) === String(myId));

  // Checks if viewing user is following this profile
  const isFollowing = () => {
    if (!me || !me.following) return false;
    return me.following.some(f => String(f._id) === String(user?._id));
  };

  // Refresh both profile user and me (for up-to-date follow state)
  const refreshUser = async () => {
    setAuthToken(token);
    setError('');
    try {
      const res = await API.get(userId ? `/users/${userId}` : '/users/me');
      setUser(res.data);
      setForm({ bio: res.data.bio || '', avatar: res.data.avatar || '' });
      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);
      // --- WATCHLISTS FIX ---
      if (!userId || (me && String(userId) === String(me._id))) {
        // Own profile: use included watchlists
        setWatchlists(res.data.watchlists || []);
      } else {
        // Other user's profile: fetch via endpoint
        try {
          const wlRes = await API.get(`/movies/users/${userId}/watchlists`);
          setWatchlists(wlRes.data || []);
        } catch {
          setWatchlists([]);
        }
      }
      // Fetch favorite movie details
      if (res.data.favorites && res.data.favorites.length > 0) {
        setLoadingFavorites(true);
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
        } finally {
          setLoadingFavorites(false);
        }
      } else {
        setFavoriteMovies([]);
        setLoadingFavorites(false);
      }
    } catch (err) {
      setError('Failed to load user profile.');
      setUser(null);
      setWatchlists([]); // clear on error
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, [token, userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setAuthToken(token);
    setError('');
    try {
      await API.put('/users/me', form);
      setEditing(false);
      setMessage('Profile updated!');
      refreshUser();
      setTimeout(() => setMessage(''), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed!');
    }
  };

  // Follow/unfollow logic
  const handleFollow = async () => {
    setLoadingFollow(true);
    setError('');
    try {
      await API.post(`/users/${user._id}/follow`);
      await refreshUser();
      if (refreshMe) await refreshMe(); // Refresh "me" after follow
    } catch (err) {
      setError('Could not follow user.');
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleUnfollow = async () => {
    setLoadingFollow(true);
    setError('');
    try {
      await API.post(`/users/${user._id}/unfollow`);
      await refreshUser();
      if (refreshMe) await refreshMe(); // Refresh "me" after unfollow
    } catch (err) {
      setError('Could not unfollow user.');
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!user) return <div className="profile-container">{error ? <div className="error">{error}</div> : "Loading..."}</div>;

  return (
    <div className="profile-container">
      <h2>{user.username}'s Profile</h2>
      <img
        src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
        alt={`${user.username}'s avatar`}
        className="avatar"
      />
      <div><b>Email:</b> {user.email}</div>
      <div><b>Bio:</b> {user.bio}</div>

      {/* Show logout and edit only on own profile */}
      {isOwnProfile && (
        <>
          <button onClick={onLogout}>Logout</button>
          <button onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit Profile"}</button>
        </>
      )}

      {/* Show follow/unfollow if not own profile and logged in */}
      {!isOwnProfile && me && user && (
        isFollowing() ? (
          <button
            onClick={handleUnfollow}
            disabled={loadingFollow}
            style={{ minWidth: 90 }}
          >
            {loadingFollow ? "..." : "Unfollow"}
          </button>
        ) : (
          <button
            onClick={handleFollow}
            disabled={loadingFollow}
            style={{ minWidth: 90 }}
          >
            {loadingFollow ? "..." : "Follow"}
          </button>
        )
      )}

      {editing && (
        <form onSubmit={handleUpdate} className="profile-form">
          <div>
            Edit Bio:
            <input
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Bio"
            />
          </div>
          <div>
            Edit Avatar URL:
            <input
              value={form.avatar}
              onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
              placeholder="Avatar URL"
            />
          </div>
          <button type="submit">Save</button>
        </form>
      )}

      {message && <div className="info">{message}</div>}
      {error && <div className="error">{error}</div>}

      <h3>Favorites</h3>
      <ul>
        {loadingFavorites ? (
          <li>Loading favorites...</li>
        ) : favoriteMovies.length > 0 ? (
          favoriteMovies.map(m => (
            <li key={m.id}>
              <Link to={`/movie/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {m.title || m.name || m.original_title || 'Unknown Title'}
                {m.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                    alt={m.title || m.name}
                    style={{ verticalAlign: 'middle', marginLeft: 8, height: 50 }}
                  />
                )}
              </Link>
            </li>
          ))
        ) : user.favorites && user.favorites.length > 0 ? (
          user.favorites.map(f => <li key={f}>{f}</li>)
        ) : (
          <li>No favorites yet.</li>
        )}
      </ul>

      <h3>Watchlists</h3>
      <ul>
        {watchlists && watchlists.length > 0
          ? watchlists.map(wl => (
            <li key={wl._id || wl.name}>
              <Link to={`/watchlists/${wl._id}`}>{wl.name}</Link>
            </li>
          ))
          : <li>No watchlists yet.</li>
        }
      </ul>

      <h3>Followers: {followers.length} | Following: {following.length}</h3>
      <div>
        <b>Followers:</b>{" "}
        {followers.length === 0
          ? "None"
          : followers.map((f, i) => (
              <span key={f._id || f.username}>
                <Link to={`/users/${f._id}`}>{f.username}</Link>
                {i < followers.length - 1 && ', '}
              </span>
            ))}
      </div>
      <div>
        <b>Following:</b>{" "}
        {following.length === 0
          ? "None"
          : following.map((f, i) => (
              <span key={f._id || f.username}>
                <Link to={`/users/${f._id}`}>{f.username}</Link>
                {i < following.length - 1 && ', '}
              </span>
            ))}
      </div>
    </div>
  );
}