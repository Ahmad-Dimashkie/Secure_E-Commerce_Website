import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { TextField, Button, Box, Typography } from '@mui/material';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState({
    name: '',
    description: '',
    price: '',
  });

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setUpdatedProduct({
          name: response.data.name,
          description: response.data.description,
          price: response.data.price,
        });
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
    fetchProduct();
  }, [id]);

  // Handle input changes for editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle update product
  const handleUpdate = async () => {
    try {
      const response = await api.put(`/products/${id}`, updatedProduct);
      setProduct(response.data); // Update the state with new product details
      setEditMode(false); // Exit edit mode
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Handle delete product
  const handleDelete = async () => {
    try {
      await api.delete(`/products/${id}`);
      navigate('/'); // Redirect to product list after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <Box sx={{ padding: '20px' }}>
      {editMode ? (
        <Box sx={{ maxWidth: '600px', margin: '0 auto' }}>
          <Typography variant="h4" gutterBottom>
            Edit Product
          </Typography>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={updatedProduct.name}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={updatedProduct.description}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={updatedProduct.price}
            onChange={handleInputChange}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            sx={{ marginRight: 2 }}
          >
            Save Changes
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setEditMode(false)}>
            Cancel
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {product.description}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Price: ${product.price.toFixed(2)}
          </Typography>
          <Box sx={{ marginTop: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEditMode(true)}
              sx={{ marginRight: 2 }}
            >
              Edit Product
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
            >
              Delete Product
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProductDetails;
