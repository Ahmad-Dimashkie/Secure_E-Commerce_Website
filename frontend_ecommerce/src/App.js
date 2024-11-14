// src/App.js
import { React, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./services/ProtectedRoute";
import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts";
import AdminUsers from "./pages/AdminUsers";
import AdminSales from "./pages/AdminSales";
function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/admin" element={<ProtectedRoute requiredRole={1} />}>
        <Route index element={<AdminDashboard />} />
      </Route>
      <Route path="/admin/orders" element={<ProtectedRoute requiredRole={1} />}>
        <Route index element={<AdminOrders />} />
      </Route>
      <Route
        path="/admin/products"
        element={<ProtectedRoute requiredRole={1} />}
      >
        <Route index element={<AdminProducts />} />
      </Route>
      <Route path="/admin/users" element={<ProtectedRoute requiredRole={1} />}>
        <Route index element={<AdminUsers />} />
      </Route>
      <Route path="/admin/sales" element={<ProtectedRoute requiredRole={1} />}>
        <Route index element={<AdminSales />} />
      </Route>
    </Routes>
  );
}
export default App;
