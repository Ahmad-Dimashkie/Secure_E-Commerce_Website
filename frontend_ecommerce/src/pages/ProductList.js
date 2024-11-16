// src/pages/ProductList.js
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Modal,
  TextField,
} from '@mui/material';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageFile: null,
  });

  // Handle modal open/close
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  // Handle form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewProduct((prev) => ({ ...prev, imageFile: file }));
  };

  // Handle product creation
  const handleCreateProduct = () => {
    const reader = new FileReader();

    // Read the uploaded image as a Data URL
    reader.onload = () => {
      const product = {
        id: Date.now(), // Unique ID for each product
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price) || 0, // Ensure price is a number
        imageUrl: reader.result, // Use the base64 Data URL for the image
      };
      setProducts((prev) => [...prev, product]);
      setNewProduct({ name: '', description: '', price: '', imageFile: null }); // Reset form
      handleClose();
    };

    if (newProduct.imageFile) {
      reader.readAsDataURL(newProduct.imageFile);
    } else {
      alert('Please upload an image.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ padding: '20px' }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          my: 4,
          py: 4,
          backgroundColor: '#e0f7fa',
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h3" gutterBottom>
          Manage Your Products
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Add, edit, or view products in your store.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          sx={{ mt: 2, borderRadius: '20px', textTransform: 'none' }}
        >
          Add New Product
        </Button>
      </Box>

      {/* Product Cards */}
      <Grid container spacing={4}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                alt={product.name}
                height="200"
                image={product.imageUrl}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${product.price.toFixed(2)}
                </Typography>
              </CardContent>
              <Button
                variant="contained"
                sx={{
                  borderRadius: '20px',
                  margin: '8px',
                  textTransform: 'none',
                  backgroundColor: '#6a1b9a', // Purple background
                  '&:hover': {
                    backgroundColor: '#4a148c', // Darker purple on hover
                  },
                }}
              >
                View Details
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Product Modal */}
      <Modal open={openModal} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add New Product
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Product Name"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Price"
            name="price"
            type="number"
            value={newProduct.price}
            onChange={handleInputChange}
          />
          <Button
            variant="contained"
            component="label"
            color="primary"
            sx={{ mt: 2, borderRadius: '20px', textTransform: 'none' }}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          {newProduct.imageFile && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Selected file: {newProduct.imageFile.name}
            </Typography>
          )}
          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateProduct}
              sx={{ borderRadius: '20px', textTransform: 'none' }}
            >
              Create Product
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default ProductList;
