import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
} from '@mui/material';
import AdminSidebar from '../components/AdminSidebar';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const AdminOrders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    // Fetch all orders when the component mounts
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        enqueueSnackbar('Failed to fetch orders', { variant: 'error' });
        console.error('Error fetching orders:', error);
      }
    };
    
    fetchOrders();
  }, []);

  // Handle updating order status
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.patch(
        `/order/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? response.data : order
        )
      );
      enqueueSnackbar('Order status updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update order status', { variant: 'error' });
      console.error('Error updating order status:', error);
    }
  };

  // Handle updating return status
  const handleUpdateReturnStatus = async (returnId, status) => {
    try {
      const response = await axios.put(
        `/return/${returnId}/status`,
        { action: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setReturns((prevReturns) =>
        prevReturns.map((returnReq) =>
          returnReq.id === returnId ? response.data : returnReq
        )
      );
      enqueueSnackbar('Return status updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update return status', { variant: 'error' });
      console.error('Error updating return status:', error);
    }
  };

  // Handle generating invoice
  const handleGenerateInvoice = async (orderId) => {
    try {
      const response = await axios.post(
        `/order/${orderId}/invoice`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      // Logic to download invoice from response
      const invoiceData = JSON.stringify(response.data, null, 2);
      const blob = new Blob([invoiceData], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_order_${orderId}.json`;
      link.click();
      enqueueSnackbar('Invoice generated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to generate invoice', { variant: 'error' });
      console.error('Error generating invoice:', error);
    }
  };

  // Handle issuing a refund
  const handleIssueRefund = async (returnId) => {
    try {
      await handleUpdateReturnStatus(returnId, 'approve');
      enqueueSnackbar('Refund processed successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to process refund', { variant: 'error' });
      console.error('Error processing refund:', error);
    }
  };

  // Handle processing a replacement
  const handleProcessReplacement = async (returnId) => {
    try {
      await handleUpdateReturnStatus(returnId, 'approve');
      enqueueSnackbar('Replacement processed successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to process replacement', { variant: 'error' });
      console.error('Error processing replacement:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSidebar />
      <Box sx={{ padding: '20px', flexGrow: 1, marginLeft: '260px' }}>
        {/* Orders Management Section */}
        <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
          Orders Management
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button variant="contained" onClick={() => handleGenerateInvoice(order.id)}>
                    Generate Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Returns Management Section */}
        <Typography variant="h4" component="h2" sx={{ marginTop: '40px', marginBottom: '20px' }}>
          Returns Management
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Return ID</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested Action</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {returns.map((returnReq) => (
              <TableRow key={returnReq.id}>
                <TableCell>{returnReq.id}</TableCell>
                <TableCell>{returnReq.orderId}</TableCell>
                <TableCell>{returnReq.productName}</TableCell>
                <TableCell>
                  <Select
                    value={returnReq.status}
                    onChange={(e) => handleUpdateReturnStatus(returnReq.id, e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{returnReq.requestedAction}</TableCell>
                <TableCell>
                  {returnReq.status === 'approved' && returnReq.requestedAction === 'refund' && (
                    <Button variant="contained" onClick={() => handleIssueRefund(returnReq.id)}>
                      Issue Refund
                    </Button>
                  )}
                  {returnReq.status === 'approved' && returnReq.requestedAction === 'replacement' && (
                    <Button variant="contained" onClick={() => handleProcessReplacement(returnReq.id)}>
                      Process Replacement
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default AdminOrders;
