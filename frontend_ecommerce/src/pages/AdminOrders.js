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

const AdminOrders = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      customerName: 'John Doe',
      status: 'pending',
      totalAmount: 150.0,
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      status: 'processing',
      totalAmount: 200.0,
    },
  ]); // Dummy data for orders

  const [returns, setReturns] = useState([
    {
      id: 1,
      orderId: 1,
      productName: 'Product A',
      status: 'pending',
      requestedAction: 'refund',
    },
    {
      id: 2,
      orderId: 2,
      productName: 'Product B',
      status: 'approved',
      requestedAction: 'replacement',
    },
  ]); // Dummy data for return requests

  // Handle updating order status
  const handleUpdateOrderStatus = (orderId, status) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  // Handle generating invoice
  const handleGenerateInvoice = (orderId) => {
    const order = orders.find((order) => order.id === orderId);
    if (order) {
      const invoiceData = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .invoice-box {
                max-width: 800px;
                margin: auto;
                padding: 30px;
                border: 1px solid #eee;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                font-size: 16px;
                line-height: 24px;
                color: #555;
              }
              .invoice-box table {
                width: 100%;
                line-height: inherit;
                text-align: left;
              }
              .invoice-box table td {
                padding: 5px;
                vertical-align: top;
              }
              .invoice-box table tr td:nth-child(2) {
                text-align: right;
              }
              .invoice-box table tr.top table td {
                padding-bottom: 20px;
              }
              .invoice-box table tr.information table td {
                padding-bottom: 40px;
              }
              .invoice-box table tr.heading td {
                background: #eee;
                border-bottom: 1px solid #ddd;
                font-weight: bold;
              }
              .invoice-box table tr.item td {
                border-bottom: 1px solid #eee;
              }
              .invoice-box table tr.total td:nth-child(2) {
                border-top: 2px solid #eee;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <table cellpadding="0" cellspacing="0">
                <tr class="top">
                  <td colspan="2">
                    <table>
                      <tr>
                        <td class="title">
                          <h2>Invoice</h2>
                        </td>

                        <td>
                          Invoice #: ${order.id}<br />
                          Created: ${new Date().toLocaleDateString()}<br />
                          Status: ${order.status}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr class="information">
                  <td colspan="2">
                    <table>
                      <tr>
                        <td>
                          Customer Name:<br />
                          ${order.customerName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr class="heading">
                  <td>Description</td>
                  <td>Amount</td>
                </tr>

                <tr class="item">
                  <td>Order Total</td>
                  <td>$${order.totalAmount.toFixed(2)}</td>
                </tr>

                <tr class="total">
                  <td></td>
                  <td>Total: $${order.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `;
      const blob = new Blob([invoiceData], { type: 'application/html' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice_order_${order.id}.html`;
      link.click();
    }
  };

  // Handle updating return status
  const handleUpdateReturnStatus = (returnId, status) => {
    setReturns((prevReturns) =>
      prevReturns.map((returnReq) =>
        returnReq.id === returnId ? { ...returnReq, status } : returnReq
      )
    );
  };

  // Handle issuing a refund
  const handleIssueRefund = (returnId) => {
    const returnReq = returns.find((returnReq) => returnReq.id === returnId);
    if (returnReq) {
      const updatedReturns = returns.map((req) =>
        req.id === returnId ? { ...req, status: 'refunded' } : req
      );
      setReturns(updatedReturns);
      const refundDetails = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .refund-box {
                max-width: 800px;
                margin: auto;
                padding: 30px;
                border: 1px solid #eee;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                font-size: 16px;
                line-height: 24px;
                color: #555;
              }
              .refund-box h2 { text-align: center; }
              .refund-box p { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="refund-box">
              <h2>Refund Processed</h2>
              <p>Return ID: ${returnReq.id}</p>
              <p>Order ID: ${returnReq.orderId}</p>
              <p>Product Name: ${returnReq.productName}</p>
              <p>Status: Refunded</p>
              <p>Refund has been successfully processed. Thank you for your patience.</p>
            </div>
          </body>
        </html>
      `;
      const blob = new Blob([refundDetails], { type: 'application/html' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `refund_return_${returnReq.id}.html`;
      link.click();
    }
  };

  // Handle processing a replacement
  const handleProcessReplacement = (returnId) => {
    const returnReq = returns.find((returnReq) => returnReq.id === returnId);
    if (returnReq) {
      const updatedReturns = returns.map((req) =>
        req.id === returnId ? { ...req, status: 'replaced' } : req
      );
      setReturns(updatedReturns);

      const replacementDetails = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .replacement-box {
                max-width: 800px;
                margin: auto;
                padding: 30px;
                border: 1px solid #eee;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
                font-size: 16px;
                line-height: 24px;
                color: #555;
              }
              .replacement-box h2 { text-align: center; }
              .replacement-box p { margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="replacement-box">
              <h2>Replacement Processed</h2>
              <p>Return ID: ${returnReq.id}</p>
              <p>Order ID: ${returnReq.orderId}</p>
              <p>Product Name: ${returnReq.productName}</p>
              <p>Status: Replaced</p>
              <p>Your replacement request has been successfully processed. We appreciate your patience.</p>
            </div>
          </body>
        </html>
      `;
      const blob = new Blob([replacementDetails], { type: 'application/html' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `replacement_return_${returnReq.id}.html`;
      link.click();
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
