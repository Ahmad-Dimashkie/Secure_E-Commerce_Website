import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/AdminSales.css'; // Ensure you have this file for additional styling

const AdminSales = () => {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <Box className="admin-content" sx={{ padding: '20px', flexGrow: 1 }}>
        <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
          Sales
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Id</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Sold Quantity</TableCell>
                <TableCell>Revenue Generated (in INR)</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>10</TableCell>
                <TableCell>gwg</TableCell>
                <TableCell>hytryuterh</TableCell>
                <TableCell>0</TableCell>
                <TableCell>₹ 0</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small" sx={{ marginRight: '5px' }}>View Orders</Button>
                  <Button variant="contained" color="success" size="small">Update Product</Button>
                </TableCell>
              </TableRow>
              {/* Add more rows as needed */}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
};

export default AdminSales;
