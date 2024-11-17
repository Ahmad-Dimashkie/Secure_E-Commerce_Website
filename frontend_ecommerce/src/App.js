import { React } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import AdminInventory from "./pages/AdminInventory";

function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      {/* ProductDetails restricted to Admin and Product Manager */}
      <Route
        path="/admin/products/:id"
        element={<ProtectedRoute allowedRoles={[1, 2]} />}
      >
        <Route index element={<ProductDetails />} />
      </Route>
      <Route path="/cart" element={<Cart />} />

      {/* Admin Dashboard accessible by all roles */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={[1, 2, 3, 4]} />}
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Admin Orders accessible by Admin and OrderManager */}
      <Route
        path="/admin/orders"
        element={<ProtectedRoute allowedRoles={[1, 3]} />}
      >
        <Route index element={<AdminOrders />} />
      </Route>

      {/* Admin Products accessible by Admin and ProductManager */}
      <Route
        path="/admin/products"
        element={<ProtectedRoute allowedRoles={[1, 2]} />}
      >
        <Route index element={<AdminProducts />} />
      </Route>

      {/* Admin Users accessible only by Admin */}
      <Route
        path="/admin/users"
        element={<ProtectedRoute allowedRoles={[1]} />}
      >
        <Route index element={<AdminUsers />} />
      </Route>

      {/* Admin Inventory accessible by Admin and InventoryManager */}
      <Route
        path="/admin/inventory"
        element={<ProtectedRoute allowedRoles={[1, 4]} />}
      >
        <Route index element={<AdminInventory />} />
      </Route>
    </Routes>
  );
}

export default App;
