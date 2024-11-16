// src/pages/ProductList.js
import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, CardMedia, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

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
          boxShadow: 3
        }}
      >
        <Typography variant="h3" gutterBottom>
          Discover Our Collection
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Browse the latest additions to our store and find your next favorite item.
        </Typography>
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
                }
              }}
            >
              <CardMedia
                component="img"
                alt={product.name}
                height="200"
                image={product.imageUrl || '/images/placeholder.png'} // Fallback if no image URL is provided
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${product.price.toFixed(2)} {/* Ensure price has two decimal places */}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button 
                  component={Link} 
                  to={`/products/${product.id}`} 
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: '20px', textTransform: 'none' }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProductList;
