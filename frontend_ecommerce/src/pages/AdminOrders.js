import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import AdminSidebar from "../components/AdminSidebar";
import { useSnackbar } from "notistack";
import api from "../services/api"; // Use the centralized API instance

const AdminOrders = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);

  // Fetch orders and returns
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch (error) {
        enqueueSnackbar("Failed to fetch orders", { variant: "error" });
        console.error("Error fetching orders:", error.response || error);
      }
    };

    const fetchReturns = async () => {
      try {
        const response = await api.get("/returns");
        setReturns(response.data);
      } catch (error) {
        enqueueSnackbar("Failed to fetch returns", { variant: "error" });
        console.error("Error fetching return requests:", error.response || error);
      }
    };

    fetchOrders();
    fetchReturns();
  }, [enqueueSnackbar]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      if (["pending", "processing", "shipped", "delivered"].includes(status)) {
        const response = await api.patch(`/order/${orderId}`, { status });
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.id === orderId ? response.data : order))
        );
        enqueueSnackbar("Order status updated successfully", { variant: "success" });
      } else {
        throw new Error("Invalid status value");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        enqueueSnackbar("Unauthorized. Please log in again.", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to update order status", { variant: "error" });
      }
      console.error("Error updating order status:", error.response || error);
    }
  };
  

  // Handle updating return status
  const handleUpdateReturnStatus = async (returnId, action) => {
    try {
      if (["approve", "deny"].includes(action)) {
        const response = await api.put(`/return/${returnId}/status`, { action });
        setReturns((prevReturns) =>
          prevReturns.map((returnReq) =>
            returnReq.id === returnId ? response.data : returnReq
          )
        );
        enqueueSnackbar("Return status updated successfully", { variant: "success" });
      } else {
        throw new Error("Invalid action value");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        enqueueSnackbar("Unauthorized. Please log in again.", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to update return status", { variant: "error" });
      }
      console.error("Error updating return status:", error.response || error);
    }
  };

  // Handle generating visually appealing invoice
  const handleGenerateInvoice = async (orderId) => {
    try {
      const response = await api.post(`/order/${orderId}/invoice`);
      const invoice = response.data;

      // Generate an HTML file with invoice details for visual appeal
      const invoiceHTML = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .invoice-container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                border: 1px solid #eee;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
              }
              .invoice-header {
                text-align: center;
                margin-bottom: 20px;
              }
              .invoice-details {
                margin-bottom: 20px;
              }
              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              .invoice-table th, .invoice-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              .invoice-total {
                text-align: right;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              <div class="invoice-header">
                <h2>Invoice #${invoice.id}</h2>
                <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
              </div>
              <div class="invoice-details">
                <p><strong>Customer Email:</strong> ${invoice.customer_email}</p>
                <p><strong>Order ID:</strong> ${invoice.order_id}</p>
              </div>
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Order Total</td>
                    <td>$${invoice.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div class="invoice-total">
                <p>Total Amount: $${invoice.amount.toFixed(2)}</p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Create a Blob with the HTML data and download it
      const blob = new Blob([invoiceHTML], { type: "text/html" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `invoice_order_${orderId}.html`;
      link.click();

      enqueueSnackbar("Invoice generated successfully", { variant: "success" });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        enqueueSnackbar("Unauthorized. Please log in again.", { variant: "error" });
      } else {
        enqueueSnackbar("Failed to generate invoice", { variant: "error" });
      }
      console.error("Error generating invoice:", error.response || error);
    }
  };

  // Handle issuing a refund
  const handleIssueRefund = async (returnId) => {
    try {
      await handleUpdateReturnStatus(returnId, "approve");
      enqueueSnackbar("Refund processed successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to process refund", { variant: "error" });
      console.error("Error processing refund:", error.response || error);
    }
  };

  // Handle processing a replacement
  const handleProcessReplacement = async (returnId) => {
    try {
      await handleUpdateReturnStatus(returnId, "approve");
      enqueueSnackbar("Replacement processed successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to process replacement", { variant: "error" });
      console.error("Error processing replacement:", error.response || error);
    }
  };

  // Render orders and returns tables
  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar />
      <Box sx={{ padding: "20px", flexGrow: 1, marginLeft: "260px" }}>
        <Typography variant="h4" component="h2" sx={{ marginBottom: "20px" }}>
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
                    onChange={(e) =>
                      handleUpdateOrderStatus(order.id, e.target.value)
                    }
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => handleGenerateInvoice(order.id)}
                  >
                    Generate Invoice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Returns Management Section */}
        <Typography variant="h4" component="h2" sx={{ marginTop: "40px", marginBottom: "20px" }}>
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
                    onChange={(e) =>
                      handleUpdateReturnStatus(returnReq.id, e.target.value)
                    }
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>{returnReq.requested_action}</TableCell>
                <TableCell>
                  {returnReq.status === "approved" &&
                    returnReq.requested_action === "refund" && (
                      <Button
                        variant="contained"
                        onClick={() => handleIssueRefund(returnReq.id)}
                      >
                        Issue Refund
                      </Button>
                    )}
                  {returnReq.status === "approved" &&
                    returnReq.requested_action === "replacement" && (
                      <Button
                        variant="contained"
                        onClick={() => handleProcessReplacement(returnReq.id)}
                      >
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
