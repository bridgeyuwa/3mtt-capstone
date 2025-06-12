import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import MovieDetails from './pages/MovieDetails';
import Recommendations from './pages/Recommendations';
import Social from './pages/Social';
import Header from './components/Header';
import Watchlists from './pages/Watchlists';
import WatchlistDetails from './pages/WatchlistDetails';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogin = (jwt) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Header token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/profile" element={token ? <Profile token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/users/:userId" element={token ? <Profile token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/recommendations" element={token ? <Recommendations token={token} /> : <Navigate to="/login" />} />
        <Route path="/movie/:id" element={<MovieDetails token={token} />} />
        <Route path="/social" element={token ? <Social token={token} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Home token={token} />} />
        <Route path="/watchlists" element={<Watchlists />} />
        <Route path="/watchlists/:id" element={<WatchlistDetails />} />
      </Routes>
    </Router>
  );
}

export default App;