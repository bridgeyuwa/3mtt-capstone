import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Header({ token, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-gray-100 px-6 py-4 flex items-center justify-between relative font-bold">
      <Link to="/" className="text-2xl font-bold hover:text-indigo-400 transition">
        3MTT MRA
      </Link>

      {/* Hamburger button - mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="sm:hidden text-gray-300 hover:text-indigo-400 focus:outline-none"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Menu */}
      <div
        className={`flex-col sm:flex-row sm:flex sm:items-center sm:space-x-6 bg-gray-900 sm:bg-transparent absolute sm:static top-full left-0 w-full sm:w-auto transition-transform duration-300 ease-in-out ${
          open ? 'flex' : 'hidden'
        }`}
      >
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="block px-4 py-2 hover:text-indigo-400 border-b border-gray-700 sm:border-none"
        >
          Home
        </Link>
        <Link
          to="/recommendations"
          onClick={() => setOpen(false)}
          className="block px-4 py-2 hover:text-indigo-400 border-b border-gray-700 sm:border-none"
        >
          Recommendations
        </Link>

        {token && (
          <>
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:text-indigo-400 border-b border-gray-700 sm:border-none"
            >
              Profile
            </Link>
            <Link
              to="/watchlists"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:text-indigo-400 border-b border-gray-700 sm:border-none"
            >
              My Watchlists
            </Link>
            <Link
              to="/users"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 hover:text-indigo-400 border-b border-gray-700 sm:border-none"
            >
              Users
            </Link>
          </>
        )}

        {!token && (
          <div className="flex flex-col sm:flex-row sm:space-x-4 items-center justify-center w-full md:w-2/5 mx-auto">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block text-center sm:text-left px-4 py-2 mb-2 sm:mb-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition w-full sm:w-auto"
              role="button"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="block text-center sm:text-left px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition w-full sm:w-auto"
              role="button"
            >
              Register
            </Link>
          </div>
        )}

        {token && (
          <div className="md:flex md:justify-end md:ml-auto">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md w-full sm:w-auto text-center sm:text-left transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
