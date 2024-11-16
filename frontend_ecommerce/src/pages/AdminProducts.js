import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/AdminProducts.css'; // Ensure proper styling

const AdminProducts = () => {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <Box className="admin-content" sx={{ padding: '20px', flexGrow: 1 }}>
        <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
          Products Management
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Id</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Price (in INR)</TableCell>
                <TableCell>Product Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>10</TableCell>
                <TableCell>gwg</TableCell>
                <TableCell>hytryuterh</TableCell>
                <TableCell>
                  <img src="path/to/image.jpg" alt="Product" style={{ width: '50px' }} />
                </TableCell>
                <TableCell>₹ 575</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small" sx={{ marginRight: '5px' }}>View</Button>
                  <Button variant="contained" color="success" size="small" sx={{ marginRight: '5px' }}>Edit</Button>
                  <Button variant="contained" color="error" size="small">Delete</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Button variant="contained" color="primary" sx={{ marginTop: '20px' }}>Add Product</Button>
      </Box>
    </div>
  );
};

export default AdminProducts;