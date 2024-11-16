import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material';
import AdminSidebar from '../components/AdminSidebar'; // Ensure this import is correct

const AdminProducts = () => {
  const [products, setProducts] = useState([]); // State for products
  const [open, setOpen] = useState(false); // State for dialog
  const [selectedProduct, setSelectedProduct] = useState(null); // Product selected for editing or viewing
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock_level: 0,
    image_url: '',
  }); // State for new product

  // Fetch products from backend
  useEffect(() => {
    axios
      .get('http://localhost:5000/products')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  // Handle dialog open/close
  const handleOpen = (product = null) => {
    setSelectedProduct(product);
    setNewProduct(
      product || { name: '', description: '', price: '', stock_level: 0, image_url: '' }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  // Handle adding a new product
  const handleSaveProduct = () => {
    if (selectedProduct) {
      // Update product
      axios
        .put(`http://localhost:5000/products/${selectedProduct.id}`, newProduct)
        .then((response) => {
          const updatedProducts = products.map((product) =>
            product.id === response.data.id ? response.data : product
          );
          setProducts(updatedProducts);
          handleClose();
        })
        .catch((error) => console.error('Error updating product:', error));
    } else {
      // Add new product
      axios
        .post('http://localhost:5000/products', newProduct)
        .then((response) => {
          setProducts([...products, response.data]);
          handleClose();
        })
        .catch((error) => console.error('Error adding product:', error));
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = (productId) => {
    axios
      .delete(`http://localhost:5000/products/${productId}`)
      .then(() => {
        const filteredProducts = products.filter((product) => product.id !== productId);
        setProducts(filteredProducts);
      })
      .catch((error) => console.error('Error deleting product:', error));
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <Box className="admin-content" sx={{ padding: '20px', flexGrow: 1 }}>
        <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
          Products Management
        </Typography>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.image_url || 'placeholder-image.jpg'}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    ₹{product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: '10px', marginRight: '5px' }}
                    onClick={() => handleOpen(product)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    sx={{ marginTop: '10px' }}
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: '20px' }}
          onClick={() => handleOpen()}
        >
          Add Product
        </Button>

        {/* Dialog for Viewing/Editing/Adding Products */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>
            {selectedProduct ? `Edit Product: ${selectedProduct.name}` : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Product Name"
              fullWidth
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Stock Level"
              type="number"
              fullWidth
              value={newProduct.stock_level}
              onChange={(e) => setNewProduct({ ...newProduct, stock_level: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Image URL"
              fullWidth
              value={newProduct.image_url}
              onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSaveProduct}>
              {selectedProduct ? 'Save Changes' : 'Create Product'}
            </Button>
            {selectedProduct && (
              <Button
                color="error"
                onClick={() => {
                  handleDeleteProduct(selectedProduct.id);
                  handleClose();
                }}
              >
                Delete
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default AdminProducts;
