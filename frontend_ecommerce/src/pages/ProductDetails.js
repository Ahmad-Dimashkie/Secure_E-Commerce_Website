import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, Button, TextField, Grid } from '@mui/material';

const ProductDetails = ({ products, setProducts }) => {
  const { id } = useParams(); // Get product ID from URL
  const navigate = useNavigate();

  const [productDetails, setProductDetails] = useState(null);

  // Fetch product if it is not passed through state
  useEffect(() => {
    if (products && products.length > 0) {
      const productFromList = products.find((prod) => prod.id === parseInt(id, 10));
      if (productFromList) {
        setProductDetails(productFromList);
      } else {
        console.error("Product not found");
        navigate('/admin/products');
      }
    }
  }, [products, id, navigate]);

  const handleUpdateProduct = () => {
    if (products && setProducts && productDetails) {
      const updatedProducts = products.map((prod) =>
        prod.id === productDetails.id ? productDetails : prod
      );
      setProducts(updatedProducts);
      navigate('/admin/products');
    }
  };

  const handleDeleteProduct = () => {
    if (products && setProducts && productDetails) {
      const filteredProducts = products.filter((prod) => prod.id !== productDetails.id);
      setProducts(filteredProducts);
      navigate('/admin/products');
    }
  };

  if (!products || products.length === 0) {
    return <Typography>Loading product list...</Typography>;
  }

  if (!productDetails) {
    return <Typography>Loading product details...</Typography>;
  }

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
        Product Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <img
            src={productDetails.image ? URL.createObjectURL(productDetails.image) : 'placeholder-image.jpg'}
            alt={productDetails.name}
            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              fullWidth
              margin="normal"
              label="Product Name"
              value={productDetails.name}
              onChange={(e) => setProductDetails({ ...productDetails, name: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={productDetails.description}
              onChange={(e) => setProductDetails({ ...productDetails, description: e.target.value })}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Price"
              type="number"
              value={productDetails.price}
              onChange={(e) => setProductDetails({ ...productDetails, price: e.target.value })}
            />
            <Box sx={{ marginTop: '20px' }}>
              <Button variant="contained" color="primary" onClick={handleUpdateProduct}>
                Save Changes
              </Button>
              <Button variant="contained" color="error" sx={{ marginLeft: '10px' }} onClick={handleDeleteProduct}>
                Delete
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetails;
