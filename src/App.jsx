// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import PrivateRoute from './utils/PrivateRoute.jsx';
import ShippingAddressForm from './components/ShippingAddressForm';
import { AuthProvider } from './context/AuthContext.jsx';

function AppContent() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === '/' ||
    location.pathname === '/register';

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/products" element={
            <PrivateRoute>
              <ProductList />
            </PrivateRoute>} />

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />

        <Route path="/address" element={
            <PrivateRoute>
              <ShippingAddressForm />
            </PrivateRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;