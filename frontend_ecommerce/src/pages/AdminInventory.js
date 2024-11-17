import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdminSidebar from '../components/AdminSidebar';
import { useSnackbar } from 'notistack';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminInventory = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]); // State for products
  const [categories, setCategories] = useState({}); // Product categories with subcategories
  const [reports, setReports] = useState([]); // State for inventory reports

  useEffect(() => {
    // Initialize dummy products and categories
    const initialCategories = {
      'Electronics': ['Phones', 'Laptops', 'Accessories'],
      'Home Appliances': ['Refrigerators', 'Washing Machines', 'Microwaves'],
      'Books': ['Fiction', 'Non-Fiction', 'Educational'],
      'Furniture': ['Chairs', 'Tables', 'Sofas'],
      'Toys': ['Outdoor', 'Educational', 'Indoor'],
      'Clothing': ['Men', 'Women', 'Children'],
      'Groceries': ['Fruits', 'Vegetables', 'Beverages'],
      'Sports': ['Equipment', 'Apparel', 'Accessories'],
      'Beauty': ['Cosmetics', 'Skincare', 'Fragrance'],
      'Automotive': ['Car Accessories', 'Motorcycles', 'Bicycles'],
    };
    setCategories(initialCategories);

    // Dummy products for initial load
    const initialProducts = [
      { id: 1, name: 'iPhone 13', category: 'Electronics', subcategory: 'Phones', stock: 5, price: 999 },
      { id: 2, name: 'Samsung Galaxy S21', category: 'Electronics', subcategory: 'Phones', stock: 15, price: 899 },
      { id: 3, name: 'MacBook Pro', category: 'Electronics', subcategory: 'Laptops', stock: 8, price: 1999 },
      { id: 4, name: 'Dining Table', category: 'Furniture', subcategory: 'Tables', stock: 2, price: 500 },
      { id: 5, name: 'Office Chair', category: 'Furniture', subcategory: 'Chairs', stock: 20, price: 150 },
      { id: 6, name: 'Refrigerator', category: 'Home Appliances', subcategory: 'Refrigerators', stock: 3, price: 1200 },
      { id: 7, name: 'Teddy Bear', category: 'Toys', subcategory: 'Indoor', stock: 50, price: 25 },
      { id: 8, name: 'Running Shoes', category: 'Sports', subcategory: 'Apparel', stock: 30, price: 100 },
      { id: 9, name: 'Skincare Set', category: 'Beauty', subcategory: 'Skincare', stock: 5, price: 60 },
      { id: 10, name: 'Motorcycle Helmet', category: 'Automotive', subcategory: 'Motorcycles', stock: 7, price: 200 },
    ];
    setProducts(initialProducts);
  }, []);

  // Handle generating inventory reports
  const handleGenerateReport = () => {
    // Generate dummy inventory report
    const report = {
      date: new Date().toLocaleDateString(),
      totalProducts: products.length,
      lowStock: products.filter((product) => product.stock < 10).length,
      popularProducts: products.slice(0, 3),
    };
    setReports([...reports, report]);
    enqueueSnackbar('Inventory report generated successfully.', { variant: 'success' });
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <Box className="admin-content" sx={{ padding: '20px', flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
            Inventory Management
          </Typography>
        </Box>

        <Box sx={{ marginBottom: '20px' }}>
          <Button variant="contained" color="info" onClick={handleGenerateReport}>
            Generate Inventory Report
          </Button>
        </Box>

        {reports.map((report, index) => (
          <Box key={index} sx={{ marginBottom: '20px', padding: '10px', border: '1px solid grey' }}>
            <Typography variant="h6">Inventory Report - {report.date}</Typography>
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

        <Accordion sx={{ marginBottom: '20px' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>Product Categories</AccordionSummary>
          <AccordionDetails>
            {Object.keys(categories).map((category) => (
              <Box key={category} sx={{ marginBottom: '10px' }}>
                <Typography variant="h6">{category}</Typography>
                <ul>
                  {categories[category].map((subcategory) => (
                    <li key={subcategory}>{subcategory}</li>
                  ))}
                </ul>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        <Grid container spacing={3} sx={{ marginTop: '20px' }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={6} key={product.id}>
              <Card
                sx={{
                  display: 'flex',
                  height: '250px',
                  border: product.stock < 10 ? '2px solid red' : '1px solid grey',
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ width: 230 }}
                  image={product.image ? URL.createObjectURL(product.image) : 'placeholder-image.jpg'}
                  alt={product.name}
                />
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {product.category || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subcategory: {product.subcategory || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock: {product.stock}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    ${product.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Professional Inventory Report Section */}
        <Box sx={{ marginTop: '40px' }}>
          <Typography variant="h5" sx={{ marginBottom: '20px' }}>Detailed Inventory Report</Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={products} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="stock" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
          <Typography variant="body1" sx={{ marginTop: '20px' }}>
            The above chart shows the stock levels of each product. Products with low stock levels are critical and should be replenished soon. 
            Inventory turnover can be monitored to predict future demand and manage procurement efficiently.
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default AdminInventory;
