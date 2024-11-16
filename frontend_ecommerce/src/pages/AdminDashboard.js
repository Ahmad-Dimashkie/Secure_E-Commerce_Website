// AdminDashboard.js
import React from 'react';

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <section>
        <h2>Inventory Status</h2>
        {/* Example of an inventory status card */}
        <div>
          <p>Total Products: 100</p>
          <p>Low Stock Items: 5</p>
        </div>
      </section>

      <section>
        <h2>Order Management</h2>
        {/* Order table */}
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Populate with real orders data */}
            <tr>
              <td>123</td>
              <td>John Doe</td>
              <td>Pending</td>
              <td><button>Update</button></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Returns Management</h2>
        <p>Handle returns here.</p>
      </section>

      <section>
        <h2>Product Batch Upload</h2>
        <button>Upload Product Batch</button>
      </section>
    </div>
  );
};

export default AdminDashboard;
