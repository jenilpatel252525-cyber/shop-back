// src/pages/Login.js

import { useState, useContext } from 'react';
import api from '../api/api';
import { useNavigate , Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import Register from './Register.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('login/', {
        username,
        password,
      });

      login(res.data);
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div
      className="container-fluid bg-light d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <div
        className="card shadow-lg border-0 p-3 p-md-4"
      >
        <div className="card-body">
          <h2 className="text-center mb-4">Login</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
            >
              Login
            </button>
          </form>
          <div>
            haven't registered yet?
            <br></br>
            <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}