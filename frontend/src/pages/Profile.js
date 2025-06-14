import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/api';
import { useParams, Link } from 'react-router-dom';

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
  const [watchlists, setWatchlists] = useState([]);

  const myId = me?._id;
  const isOwnProfile = !userId || (myId && String(userId) === String(myId));

  const isFollowing = () => {
    if (!me || !me.following) return false;
    return me.following.some(f => String(f._id) === String(user?._id));
  };

  const refreshUser = async () => {
    setAuthToken(token);
    setError('');
    try {
      const res = await API.get(userId ? `/users/${userId}` : '/users/me');
      setUser(res.data);
      setForm({ bio: res.data.bio || '', avatar: res.data.avatar || '' });
      setFollowers(res.data.followers || []);
      setFollowing(res.data.following || []);
      if (!userId || (me && String(userId) === String(me._id))) {
        setWatchlists(res.data.watchlists || []);
      } else {
        try {
          const wlRes = await API.get(`/movies/users/${userId}/watchlists`);
          setWatchlists(wlRes.data || []);
        } catch {
          setWatchlists([]);
        }
      }
      if (res.data.favorites && res.data.favorites.length > 0) {
        setLoadingFavorites(true);
        try {
          const movies = await Promise.all(
            res.data.favorites.map(id =>
              fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}`)
                .then(r => (r.ok ? r.json() : null))
                .catch(() => null)
            )
          );
          setFavoriteMovies(movies.filter(Boolean));
        } catch {
          setFavoriteMovies([]);
        } finally {
          setLoadingFavorites(false);
        }
      } else {
        setFavoriteMovies([]);
        setLoadingFavorites(false);
      }
    } catch {
      setError('Failed to load user profile.');
      setUser(null);
      setWatchlists([]);
    }
  };

  useEffect(() => {
    refreshUser();
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

  const handleFollow = async () => {
    setLoadingFollow(true);
    setError('');
    try {
      await API.post(`/users/${user._id}/follow`);
      await refreshUser();
      if (refreshMe) await refreshMe();
    } catch {
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
      if (refreshMe) await refreshMe();
    } catch {
      setError('Could not unfollow user.');
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center h-64 text-red-500 bg-black">
        {error ? <div>{error}</div> : 'Loading...'}
      </div>
    );

  return (
    <div className=" mx-auto p-6 space-y-8 bg-black text-gray-300 rounded-md shadow-lg">
      <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold border-b border-gray-700 pb-2 text-gray-200">
        {user.username}&apos;s Profile
      </h2>

      <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8">
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=121212&color=6b7280`}
          alt={`${user.username}'s avatar`}
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-700"
          loading="lazy"
        />
        <div className="flex-1 w-full space-y-1">
          <div>
            <span className="font-semibold text-gray-400">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold text-gray-400">Bio:</span>{' '}
            {user.bio || <span className="italic text-gray-600">No bio provided.</span>}
          </div>
          {isOwnProfile && (
            <div className="space-x-4 mt-4">
              <button
                onClick={onLogout}
                className="px-5 py-2 bg-red-800 hover:bg-red-900 rounded text-gray-200 transition"
              >
                Logout
              </button>
              <button
                onClick={() => setEditing(!editing)}
                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 rounded text-gray-200 transition"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          )}
          {!isOwnProfile && me && (
            <button
              onClick={isFollowing() ? handleUnfollow : handleFollow}
              disabled={loadingFollow}
              className="mt-5 px-6 py-2 rounded bg-blue-900 hover:bg-blue-800 disabled:bg-gray-800 text-gray-200 transition"
            >
              {loadingFollow ? '...' : isFollowing() ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form onSubmit={handleUpdate} className="max-w-md space-y-5 bg-gray-900 p-5 rounded">
          <label className="block">
            <span className="text-gray-400 font-semibold">Edit Bio</span>
            <input
              type="text"
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="Bio"
              className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </label>
          <label className="block">
            <span className="text-gray-400 font-semibold">Edit Avatar URL</span>
            <input
              type="text"
              value={form.avatar}
              onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
              placeholder="Avatar URL"
              className="mt-1 block w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </label>
          <button
            type="submit"
            className="px-5 py-2 bg-green-800 hover:bg-green-900 rounded text-gray-200 transition"
          >
            Save
          </button>
        </form>
      )}

      {message && (
        <div className="text-green-500 font-semibold text-center mt-3">{message}</div>
      )}
      {error && (
        <div className="text-red-600 font-semibold text-center mt-3">{error}</div>
      )}

      <section>
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 text-gray-300">
          Favorites
        </h3>
        <ul className="space-y-3">
          {loadingFavorites ? (
            <li className="italic text-gray-500">Loading favorites...</li>
          ) : favoriteMovies.length > 0 ? (
            favoriteMovies.map(m => (
              <li
                key={m.id}
                className="flex items-center space-x-4 hover:bg-gray-800 p-3 rounded transition"
              >
                <Link
                  to={`/movie/${m.id}`}
                  className="flex items-center space-x-4 text-blue-500 hover:underline"
                >
                  {m.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                      alt={m.title || m.name}
                      className="h-16 rounded"
                      loading="lazy"
                    />
                  )}
                  <span className="font-medium">{m.title || m.name || 'Untitled'}</span>
                </Link>
              </li>
            ))
          ) : user.favorites && user.favorites.length > 0 ? (
            user.favorites.map(f => (
              <li key={f} className="italic text-gray-600">
                {f}
              </li>
            ))
          ) : (
            <li className="italic text-gray-600">No favorites yet.</li>
          )}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2 text-gray-300">
          Watchlists
        </h3>
        <ul className="space-y-3">
          {watchlists && watchlists.length > 0 ? (
            watchlists.map(wl => (
              <li key={wl._id || wl.name}>
                <Link to={`/watchlists/${wl._id}`} className="text-blue-500 hover:underline">
                  {wl.name}
                </Link>
              </li>
            ))
          ) : (
            <li className="italic text-gray-600">
              No watchlists
              {isOwnProfile && (
                <>
                  {' '}
                  —{' '}
                  <Link
                    to="/watchlists"
                    className="ml-2 inline-block px-4 py-2 bg-blue-900 hover:bg-blue-800 rounded text-gray-200 font-semibold transition"
                  >
                    Create Watchlist
                  </Link>
                </>
              )}
            </li>
          )}
        </ul>

        {isOwnProfile && watchlists && watchlists.length > 0 && (
          <Link
            to="/watchlists"
            className="inline-block mt-5 px-6 py-2 bg-blue-900 hover:bg-blue-800 rounded text-gray-200 font-semibold transition"
          >
            Manage Watchlists
          </Link>
        )}
      </section>

      <section>
        <h3 className="text-xl font-semibold mt-8 mb-3 border-b border-gray-700 pb-2 text-gray-300">
          Followers: {followers.length} | Following: {following.length}
        </h3>
        <div className="mb-3">
          <span className="font-semibold text-gray-400">Followers:</span>{' '}
          {followers.length === 0 ? (
            <span className="italic text-gray-600">None</span>
          ) : (
            followers.map((f, i) => (
              <span key={f._id || f.username}>
                <Link to={`/users/${f._id}`} className="text-blue-500 hover:underline">
                  {f.username}
                </Link>
                {i < followers.length - 1 && ', '}
              </span>
            ))
          )}
        </div>
        <div>
          <span className="font-semibold text-gray-400">Following:</span>{' '}
          {following.length === 0 ? (
            <span className="italic text-gray-600">None</span>
          ) : (
            following.map((f, i) => (
              <span key={f._id || f.username}>
                <Link to={`/users/${f._id}`} className="text-blue-500 hover:underline">
                  {f.username}
                </Link>
                {i < following.length - 1 && ', '}
              </span>
            ))
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
