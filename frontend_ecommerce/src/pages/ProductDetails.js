// src/pages/ProductDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Grid, Card, CardMedia } from '@mui/material';
import api from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    navigate('/cart');
  };

  const getPriceDisplay = (price, discountedPrice) => {
    if (discountedPrice != null) {
      return (
        <div>
          <span style={{ textDecoration: 'line-through', color: 'red', marginRight: '8px' }}>
            ${price.toFixed(2)}
          </span>
          <span>${discountedPrice.toFixed(2)}</span>
        </div>
      );
    } else {
      return <span>${price.toFixed(2)}</span>;
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <Container maxWidth="md" sx={{ padding: '20px' }}>
      <Grid container spacing={4} alignItems="center">
        {/* Product Image */}
        <Grid item xs={12} md={5}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardMedia
              component="img"
              alt={product.name}
              image={product.imageUrl || '/images/placeholder.png'}
              title={product.name}
              sx={{ objectFit: 'cover', height: 400 }}
            />
          </Card>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>

            {/* Description */}
            {product.description && (
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {product.description}
              </Typography>
            )}

            {/* Specifications */}
            {product.specifications && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>Specifications</Typography>
                <Typography variant="body2" color="textSecondary">
                  {product.specifications}
                </Typography>
              </Box>
            )}

            {/* Price Display */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              {getPriceDisplay()}
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              size="large" 
              sx={{ borderRadius: '20px', mt: 4, width: 'fit-content' }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;
