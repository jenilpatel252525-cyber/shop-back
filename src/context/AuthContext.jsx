import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api.jsx';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : null;
  });

  const [user, setUser] = useState(() => {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? jwtDecode(JSON.parse(tokens).access) : null;
  });

  const navigate = useNavigate()

  const login = (data) => {
    setAuthTokens(data);
    setUser(jwtDecode(data.access));
    localStorage.setItem('authTokens', JSON.stringify(data));
  };

  const logout = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate("/");
  };

  // 🔄 Automatically refresh token
  const refreshToken = async () => {
    try {
      const response = await api.post('refresh/', {
        refresh: authTokens?.refresh,
      });
      const newTokens = {
        access: response.data.access,
        refresh: authTokens.refresh,
      };
      setAuthTokens(newTokens);
      setUser(jwtDecode(response.data.access));
      localStorage.setItem('authTokens', JSON.stringify(newTokens));
    } catch (err) {
      console.error('Token refresh failed', err);
      logout(); // Invalid refresh token
    }
  };

  useEffect(() => {
    // Auto-refresh token every 4.5 minutes
    const interval = setInterval(() => {
      if (authTokens) {
        refreshToken();
      }
    }, 1000 * 60 * 2); // 4.5 minutes

    return () => clearInterval(interval);
  }, [authTokens]);

  return (
    <AuthContext.Provider value={{ user, authTokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;