import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Modal,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdminSidebar from "../components/AdminSidebar";
import { useSnackbar } from "notistack";
import api from "../services/api";

const AdminInventory = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]); // State for products
  const [categories, setCategories] = useState([]); // State for categories
  const [reports, setReports] = useState([]); // State for inventory reports
  const [newInventory, setNewInventory] = useState({
    category_id: "",
    capacity: 0,
    threshold: 50,
  });
  const [editInventory, setEditInventory] = useState(null); // For editing inventory

  // Fetch Inventory and Categories from Backend
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get("/inventory"); // Fetch inventory data from backend
        console.log("Fetched inventory:", response.data);
        setProducts(response.data); // Update products state
        enqueueSnackbar("Inventory data loaded successfully.", {
          variant: "success",
        });
      } catch (error) {
        console.error("Error fetching inventory:", error);
        enqueueSnackbar("Failed to load inventory data.", { variant: "error" });
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories"); // Fetch categories data from backend
        console.log("Fetched categories:", response.data);
        setCategories(response.data); // Update categories state
        enqueueSnackbar("Categories loaded successfully.", {
          variant: "success",
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
        enqueueSnackbar("Failed to load categories.", { variant: "error" });
      }
    };

    fetchInventory();
    fetchCategories();
  }, []);

  const handleCreateInventory = async () => {
    try {
      const response = await api.post("/inventory", {
        ...newInventory,
        category_id: parseInt(newInventory.category_id),
        capacity: parseInt(newInventory.capacity),
        threshold: parseInt(newInventory.threshold),
      });
      setProducts([...products, response.data]); // Add new inventory item to the state
      enqueueSnackbar("Inventory created successfully.", {
        variant: "success",
      });
      setNewInventory({ category_id: "", capacity: 0, threshold: 50 }); // Reset form
    } catch (error) {
      enqueueSnackbar("Failed to create inventory.", { variant: "error" });
    }
  };

  // Example for Delete Inventory
  const handleDeleteInventory = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setProducts(products.filter((product) => product.id !== id)); // Remove from state
      enqueueSnackbar("Inventory deleted successfully.", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Failed to delete inventory.", { variant: "error" });
    }
  };

  // Example for Update Inventory
  const handleUpdateInventory = async () => {
    if (!editInventory) return;

    try {
      // Send the PUT request
      const response = await api.put(`/inventory/${editInventory.id}`, {
        capacity: parseInt(editInventory.capacity), // Ensure the capacity is an integer
      });

      // Update products state with the new data
      setProducts(
        products.map((product) =>
          product.id === editInventory.id ? response.data : product
        )
      );

      enqueueSnackbar("Inventory updated successfully.", {
        variant: "success",
      });
      setEditInventory(null); // Close modal or form
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.error || "Failed to update inventory.",
        { variant: "error" }
      );
    }
  };

  // Handle generating inventory reports
  const handleGenerateReport = () => {
    const report = {
      date: new Date().toLocaleDateString(),
      totalProducts: products.length,
      lowStock: products.filter(
        (product) => product.capacity < product.threshold
      ).length,
      popularProducts: products.slice(0, 3),
    };
    setReports([...reports, report]);
    enqueueSnackbar("Inventory report generated successfully.", {
      variant: "success",
    });
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <Box className="admin-content" sx={{ padding: "20px", flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h2" sx={{ marginBottom: "20px" }}>
            Inventory Management
          </Typography>
        </Box>

        {/* Create Inventory Form */}
        <Box sx={{ marginBottom: "20px" }}>
          <Typography variant="h6">Create Inventory</Typography>
          <TextField
            label="Category ID"
            value={newInventory.category_id}
            onChange={(e) =>
              setNewInventory({ ...newInventory, category_id: e.target.value })
            }
            sx={{ marginRight: "10px", width: "150px" }}
          />
          <TextField
            label="Capacity"
            type="number"
            value={newInventory.capacity}
            onChange={(e) =>
              setNewInventory({ ...newInventory, capacity: e.target.value })
            }
            sx={{ marginRight: "10px", width: "150px" }}
          />
          <TextField
            label="Threshold"
            type="number"
            value={newInventory.threshold}
            onChange={(e) =>
              setNewInventory({ ...newInventory, threshold: e.target.value })
            }
            sx={{ marginRight: "10px", width: "150px" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateInventory}
          >
            Create
          </Button>
        </Box>

        {reports.map((report, index) => (
          <Box
            key={index}
            sx={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid grey",
            }}
          >
            <Typography variant="h6">
              Inventory Report - {report.date}
            </Typography>
            <Typography>Total Products: {report.totalProducts}</Typography>
            <Typography>Low Stock Products: {report.lowStock}</Typography>
          </Box>
        ))}

        {/* Categories Section */}
        <Accordion sx={{ marginBottom: "20px" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Product Categories
          </AccordionSummary>
          <AccordionDetails>
            {categories.map((category) => (
              <Box key={category.id} sx={{ marginBottom: "10px" }}>
                <Typography variant="h6">
                  ID: {category.id} - Category: {category.name}
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Inventory List */}
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ padding: "15px" }}>
                <CardContent>
                  <Typography variant="h6">
                    Inventory ID: {product.id}
                  </Typography>
                  <Typography>Category ID: {product.category_id}</Typography>
                  <Typography>Capacity: {product.capacity}</Typography>
                  <Typography>Threshold: {product.threshold}</Typography>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteInventory(product.id)}
                    sx={{ marginTop: "10px" }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => setEditInventory(product)}
                    sx={{ marginLeft: "10px", marginTop: "10px" }}
                  >
                    Edit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Edit Inventory Modal */}
        {editInventory && (
          <Modal
            open={!!editInventory}
            onClose={() => setEditInventory(null)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{ padding: "20px", background: "#fff", borderRadius: "8px" }}
            >
              <Typography variant="h6">
                Decrease Inventory Capacity By:
              </Typography>
              <TextField
                label="Capacity"
                type="number"
                value={editInventory.capacity}
                onChange={(e) =>
                  setEditInventory({
                    ...editInventory,
                    capacity: e.target.value,
                  })
                }
                sx={{ marginTop: "10px", width: "100%" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdateInventory}
                sx={{ marginTop: "20px" }}
              >
                Update
              </Button>
            </Box>
          </Modal>
        )}
      </Box>
    </div>
  );
};

export default AdminInventory;
