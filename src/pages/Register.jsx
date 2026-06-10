// src/pages/Register.js

import { useState } from 'react';
import api from '../api/api.jsx';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('register/', formData);
      navigate('/login');
    } catch {
      alert('Registration failed');
    }
  };

  return (
    <div
      className="container-fluid bg-light d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="card shadow-lg border-0 p-3 p-md-4">
        <div className="card-body">
          <h2 className="text-center mb-4">Register</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value,
                  })
                }
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100"
            >
              Register
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="mb-1">
              Already have an account?
            </p>
            <Link to="/login">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}