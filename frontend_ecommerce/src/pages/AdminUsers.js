import React from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/AdminUsers.css'; // Make sure you have this file for additional styling

const AdminUsers = () => {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <Box className="admin-content" sx={{ padding: '20px', flexGrow: 1 }}>
      <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
          Users
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Id</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Account Details</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>hariom123</TableCell>
                <TableCell>
                  Phone No: 1234567890<br />
                  Email: hariom@gmail.com
                </TableCell>
                <TableCell>a-230, jagatpura, jaipur</TableCell>
                <TableCell>
                  Account No: 123456789012345<br />
                  IFSC Code: SBIN12345<br />
                  Bank Name: SBI<br />
                  Branch Name: JAIPUR
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" size="small">View</Button>
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

export default AdminUsers;
