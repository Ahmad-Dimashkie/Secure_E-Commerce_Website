// src/pages/Home.js
import React from 'react';
import { Box, Typography, Button, Grid, Card, CardMedia, CardContent, CardActions, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container>
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundImage: 'url(/images/hero-background.jpg)', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          padding: '80px 0', 
          textAlign: 'center', 
          color: 'white'
        }}
      >
        <Typography variant="h2" gutterBottom>Incredible Prices on All Your Favorite Electronics</Typography>
        <Typography variant="h6" gutterBottom>Shop more for less on selected brands</Typography>
        <Button component={Link} to="/products" variant="contained" color="primary" sx={{ marginTop: '20px' }}>
          Shop Now
        </Button>
      </Box>

      {/* Promotions Section */}
      <Box sx={{ marginTop: '40px' }}>
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
      <Box sx={{ marginTop: '40px' }}>
        <Typography variant="h4" gutterBottom>Featured Products</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: '8px', boxShadow: 3 }}>
              <CardMedia
                component="img"
                alt="Smartwatch Pro"
                height="200"
                image="/images/product1.jpg"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>Smartwatch Pro</Typography>
                <Typography variant="body2" color="text.secondary">$199.99</Typography>
              </CardContent>
              <CardActions>
                <Button component={Link} to="/product/1" size="small" color="primary">View Details</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: '8px', boxShadow: 3 }}>
              <CardMedia
                component="img"
                alt="Wireless Earbuds X"
                height="200"
                image="/images/product2.jpg"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>Wireless Earbuds X</Typography>
                <Typography variant="body2" color="text.secondary">$49.99</Typography>
              </CardContent>
              <CardActions>
                <Button component={Link} to="/product/2" size="small" color="primary">View Details</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: '8px', boxShadow: 3 }}>
              <CardMedia
                component="img"
                alt="Next-Gen Gaming Console"
                height="200"
                image="/images/product3.jpg"
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>Next-Gen Gaming Console</Typography>
                <Typography variant="body2" color="text.secondary">$399.99</Typography>
              </CardContent>
              <CardActions>
                <Button component={Link} to="/product/3" size="small" color="primary">View Details</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Categories Section */}
      <Box sx={{ marginTop: '40px' }}>
        <Typography variant="h4" gutterBottom>Shop by Category</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Box 
              component={Link} 
              to="/category/laptops" 
              sx={{ 
                backgroundImage: 'url(/images/laptops.jpg)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                height: '200px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '8px', 
                boxShadow: 3
              }}
            >
              <Typography variant="h6">Laptops</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box 
              component={Link} 
              to="/category/phones" 
              sx={{ 
                backgroundImage: 'url(/images/phones.jpg)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                height: '200px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '8px', 
                boxShadow: 3
              }}
            >
              <Typography variant="h6">Phones</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box 
              component={Link} 
              to="/category/smart-home" 
              sx={{ 
                backgroundImage: 'url(/images/smart-home.jpg)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                height: '200px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '8px', 
                boxShadow: 3
              }}
            >
              <Typography variant="h6">Smart Home</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
