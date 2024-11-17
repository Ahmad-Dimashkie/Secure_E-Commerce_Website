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
import { useSnackbar } from 'notistack';
import api from '../services/api'; // Use the centralized API instance

const AdminOrders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    // Fetch all orders when the component mounts
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        enqueueSnackbar('Failed to fetch orders', { variant: 'error' });
        console.error('Error fetching orders:', error);
      }
    };

    // Fetch all return requests when the component mounts
    const fetchReturns = async () => {
      try {
        const response = await api.get('/returns');
        setReturns(response.data);
      } catch (error) {
        enqueueSnackbar('Failed to fetch returns', { variant: 'error' });
        console.error('Error fetching return requests:', error);
      }
    };

    fetchOrders();
    fetchReturns();
  }, [enqueueSnackbar]);

  // Handle updating order status
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/order/${orderId}`, { status });
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
  const handleUpdateReturnStatus = async (returnId, action) => {
    try {
      const response = await api.put(`/return/${returnId}/status`, { action });
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
      const response = await api.post(`/order/${orderId}/invoice`);
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
              <TableCell>Customer Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer_email}</TableCell>
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
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
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
                <TableCell>{returnReq.order_id}</TableCell>
                <TableCell>{returnReq.product_name}</TableCell>
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
                <TableCell>{returnReq.requested_action}</TableCell>
                <TableCell>
                  {returnReq.status === 'approved' && returnReq.requested_action === 'refund' && (
                    <Button variant="contained" onClick={() => handleIssueRefund(returnReq.id)}>
                      Issue Refund
                    </Button>
                  )}
                  {returnReq.status === 'approved' && returnReq.requested_action === 'replacement' && (
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
