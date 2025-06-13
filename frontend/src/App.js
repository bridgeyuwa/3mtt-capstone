import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import MovieDetails from './pages/MovieDetails';
import Recommendations from './pages/Recommendations';
import Header from './components/Header';
import Watchlists from './pages/Watchlists';
import WatchlistDetails from './pages/WatchlistDetails';
import Users from './pages/Users';
import API, { setAuthToken } from './api/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [me, setMe] = useState(null);

  // Function to refresh the current user
  const refreshMe = async () => {
    if (token) {
      setAuthToken(token);
      try {
        const res = await API.get('/users/me');
        setMe(res.data);
      } catch {
        setMe(null);
      }
    } else {
      setMe(null);
    }
  };

  // Fetch the current user whenever token changes
  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line
  }, [token]);

  const handleLogin = (jwt) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    setMe(null);
  };

  return (
    <Router>
      <Header token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route
          path="/profile"
          element={token ? <Profile token={token} onLogout={handleLogout} me={me} refreshMe={refreshMe} /> : <Navigate to="/login" />}
        />
        <Route
          path="/users/:userId"
          element={token ? <Profile token={token} onLogout={handleLogout} me={me} refreshMe={refreshMe} /> : <Navigate to="/login" />}
        />
        <Route
          path="/recommendations"
          element={token ? <Recommendations token={token} /> : <Navigate to="/login" />}
        />
        <Route path="/movie/:id" element={<MovieDetails token={token} />} />
        <Route path="/" element={<Home token={token} />} />
        <Route path="/watchlists" element={<Watchlists />} />
        <Route path="/watchlists/:id" element={<WatchlistDetails />} />
        <Route
          path="/users"
          element={token ? <Users token={token} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;