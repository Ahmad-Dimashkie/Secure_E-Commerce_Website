import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/AdminOrders.css';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

const ordersData = [
  { id: 1, customerName: 'John Doe', date: '2024-11-10', total: '$120.00', status: 'Delivered' },
  { id: 2, customerName: 'Jane Smith', date: '2024-11-08', total: '$75.00', status: 'Pending' },
  { id: 3, customerName: 'Robert Brown', date: '2024-11-06', total: '$50.00', status: 'Shipped' },
];

const AdminOrders = () => {
  return (
    <div className="app-container">
      <AdminSidebar />
      <div className="main-content">
      <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
          Orders
        </Typography>
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordersData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" size="small">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default AdminOrders;
