// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardMedia, CardContent, CardActions, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Featured Product Card Component
const ProductCard = ({ product }) => (
  <Card sx={{ borderRadius: '8px', boxShadow: 3 }}>
    <CardMedia
      component="img"
      alt={product.name}
      height="200"
      image={product.imageUrl}
      sx={{ objectFit: 'cover' }}
    />
    <CardContent>
      <Typography variant="h6" gutterBottom>{product.name}</Typography>
      <Typography variant="body2" color="text.secondary">${product.price}</Typography>
    </CardContent>
    <CardActions>
      <Button component={Link} to={`/product/${product.id}`} size="small" color="primary">View Details</Button>
    </CardActions>
  </Card>
);


// Category Card Component
// Category Card Component
const CategoryCard = ({ category }) => (
  <Box 
    component={Link} 
    to={`/category/${category.id}`} 
    sx={{ 
      position: 'relative',
      width: '100%', 
      paddingTop: '100%',  // Makes the card square
      backgroundImage: `url(${category.image_url})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      borderRadius: '8px', 
      boxShadow: 3,
      overflow: 'hidden',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textDecoration: 'none',
      color: 'white',
      '&:hover': {
        transform: 'scale(1.05)',
        transition: 'transform 0.3s ease-in-out',
      }
    }}
  >
    {/* Overlay for better text readability */}
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    }} />
    <Typography 
      variant="h6" 
      sx={{ 
        position: 'absolute', 
        fontWeight: 'bold', 
        color: 'white' 
      }}
    >
      {category.name}
    </Typography>
  </Box>
);


const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch products from the backend and limit to top 3
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/products`)
      .then(response => {
        // Limit to top 3 products
        setProducts(response.data.slice(0, 3));
      })
      .catch(error => {
        console.error("Error fetching products:", error);
      });
  }, []);


  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/categories`)
      .then(response => {
        setCategories(response.data.slice(0, 3)); // Limit to top 3 categories
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
      });
  }, []);
  return (
    <Container maxWidth="xl" disableGutters sx={{ padding: '20px' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundImage: 'url(/images/hero-background.jpg)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          padding: { xs: '60px 20px', md: '100px 0' }, 
          textAlign: 'center', 
          color: 'white',
          width: '100%',
        }}
      >
        <Typography variant="h2" gutterBottom>Incredible Prices on All Your Favorite Electronics</Typography>
        <Typography variant="h6" gutterBottom>Shop more for less on selected brands</Typography>
        <Button component={Link} to="/products" variant="contained" color="primary" sx={{ marginTop: '20px' }}>
          Shop Now
        </Button>
      </Box>

      {/* Promotions Section */}
      <Box sx={{ marginTop: '40px', padding: '0 20px' }}>
        <Typography variant="h4" gutterBottom>Special Promotions</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
              <CardMedia
                component="div"
                sx={{ 
                  backgroundImage: 'url(/images/promo1.jpg)', 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center', 
                  height: '200px' 
                }}
              />
              <CardContent sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                <Typography variant="h5">Holiday Deals</Typography>
                <Typography variant="body1">Up to 30% off on selected smartphones</Typography>
                <Button component={Link} to="/category/smartphones" color="secondary" sx={{ textTransform: 'none', marginTop: '8px' }}>
                  Explore Deals
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
              <CardMedia
                component="div"
                sx={{ 
                  backgroundImage: 'url(/images/promo2.jpg)', 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center', 
                  height: '200px' 
                }}
              />
              <CardContent sx={{ color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                <Typography variant="h5">Take Your Sound Anywhere</Typography>
                <Typography variant="body1">Top deals on headphones and speakers</Typography>
                <Button component={Link} to="/category/audio" color="secondary" sx={{ textTransform: 'none', marginTop: '8px' }}>
                  Shop Audio
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ marginTop: '40px', padding: '0 20px' }}>
        <Typography variant="h4" gutterBottom>Featured Products</Typography>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>

      
      {/* Categories Section */}
      <Box sx={{ marginTop: '40px', padding: '0 20px' }}>
        <Typography variant="h4" gutterBottom>Shop by Category</Typography>
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={4} key={category.id}>
              <CategoryCard category={category} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
