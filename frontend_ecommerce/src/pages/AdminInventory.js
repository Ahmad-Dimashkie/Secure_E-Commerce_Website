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

        <Box sx={{ marginBottom: "20px" }}>
          <Button
            variant="contained"
            color="info"
            onClick={handleGenerateReport}
          >
            Generate Inventory Report
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
            <Typography>Popular Products:</Typography>
            {report.popularProducts.map((product) => (
              <Typography key={product.id}>
                - {product.name}: ${product.price}
              </Typography>
            ))}
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
                <Typography variant="h6">{category.name}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Products Section */}
        <Grid container spacing={3} sx={{ marginTop: "20px" }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={6} key={product.id}>
              <Card
                sx={{
                  display: "flex",
                  height: "250px",
                  border:
                    product.capacity < product.threshold
                      ? "2px solid red"
                      : "1px solid grey",
                }}
              >
                <CardContent sx={{ flex: "1 0 auto" }}>
                  <Typography gutterBottom variant="h5" component="div">
                    Inventory ID: {product.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category ID: {product.category_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {product.capacity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Threshold: {product.threshold}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
};

export default AdminInventory;
