import React, { useState, useEffect } from 'react';
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
import AdminSidebar from '../components/AdminSidebar';
import { useCSVReader } from 'react-papaparse'; // Updated import for CSV uploads
import { useSnackbar } from 'notistack';
import api from '../services/api'; // Use the centralized API instance

const AdminProducts = () => {
  const { CSVReader } = useCSVReader();
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]); // State for products
  const [open, setOpen] = useState(false); // State for dialog
  const [promotionOpen, setPromotionOpen] = useState(false); // State for promotion dialog
  const [selectedProduct, setSelectedProduct] = useState(null); // Product selected for editing or viewing
  const [promotionDetails, setPromotionDetails] = useState({
    discount: '',
    startDate: '',
    endDate: '',
  });
  const [csvProducts, setCsvProducts] = useState([]); // State for products from CSV

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        enqueueSnackbar('Failed to fetch products', { variant: 'error' });
        console.error('Error fetching products:', error.response || error);
      }
    };

    fetchProducts();
  }, [enqueueSnackbar]);

  // Handle dialog open for adding or editing a product
  const handleOpen = (product = null) => {
    setSelectedProduct(
      product ? { ...product } : { name: '', description: '', price: '', image: null }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  // Handle saving product (either add or update)
  const handleSaveProduct = async () => {
    try {
      if (selectedProduct.id) {
        // Update existing product
        const response = await api.put(`/products/${selectedProduct.id}`, selectedProduct);
        setProducts((prevProducts) =>
          prevProducts.map((product) => (product.id === selectedProduct.id ? response.data : product))
        );
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        // Add new product
        const formData = new FormData();
        formData.append('name', selectedProduct.name);
        formData.append('description', selectedProduct.description);
        formData.append('price', selectedProduct.price);
        if (selectedProduct.image) {
          formData.append('image', selectedProduct.image);
        }
        const response = await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setProducts([...products, response.data]);
        enqueueSnackbar('Product added successfully', { variant: 'success' });
      }
      handleClose();
    } catch (error) {
      enqueueSnackbar('Failed to save product', { variant: 'error' });
      console.error('Error saving product:', error.response || error);
    }
  };

  // Handle deleting a product
  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
      enqueueSnackbar('Product deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete product', { variant: 'error' });
      console.error('Error deleting product:', error.response || error);
    }
  };

  const handleOnDrop = (data) => {
    try {
      // Print the data for debugging
      console.log("CSV Data:", data);
  
      // Validate CSV data structure
      const newProducts = data
        .slice(1) // Skip the header row
        .map((row, index) => {
          // Check if row is valid
          if (!row.data || row.data.length < 3) {
            throw new Error('Invalid CSV format: Each row must have at least three columns (Name, Description, Price)');
          }
  
          return {
            id: products.length + 1 + index,
            name: row.data[0]?.trim() || "Untitled Product",
            description: row.data[1]?.trim() || "No description available",
            price: parseFloat(row.data[2]) || 0,
            image: null,
          };
        });
  
      // Filter out rows that are empty or undefined
      const filteredProducts = newProducts.filter(
        (product) => product.name && product.description && !isNaN(product.price)
      );
  
      if (filteredProducts.length === 0) {
        enqueueSnackbar('No valid products found in the CSV.', { variant: 'warning' });
        return;
      }
  
      setCsvProducts(filteredProducts);
      enqueueSnackbar('CSV uploaded successfully.', { variant: 'success' });
    } catch (err) {
      console.error('Error processing CSV:', err);
      enqueueSnackbar('Invalid CSV format. Each row must have a Name, Description, and Price.', { variant: 'error' });
    }
  };
  
  // Handle CSV parsing error
  const handleOnError = (err) => {
    console.error('Error reading CSV:', err);
    enqueueSnackbar('Error reading CSV file. Please try again.', { variant: 'error' });
  };
  
  // Handle promotions dialog open
  const handlePromotionOpen = (product) => {
    setSelectedProduct(product);
    setPromotionOpen(true);
  };

  const handlePromotionClose = () => {
    setPromotionOpen(false);
    setPromotionDetails({ discount: '', startDate: '', endDate: '' });
  };

  // Handle saving promotion
  const handleSavePromotion = () => {
    console.log('Promotion Details:', promotionDetails);
    handlePromotionClose();
  };

  // Handle adding all products from CSV
  const handleAddAllCsvProducts = () => {
    if (csvProducts.length > 0) {
      setProducts([...products, ...csvProducts]);
      setCsvProducts([]); // Clear CSV products after adding
      enqueueSnackbar('All products added successfully.', { variant: 'success' });
    } else {
      enqueueSnackbar('No products available to add.', { variant: 'warning' });
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <Box className="admin-content" sx={{ padding: '20px', flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h2" sx={{ marginBottom: '20px' }}>
            Products Management
          </Typography>
          <Button variant="contained" color="primary" onClick={() => handleOpen()}>
            Add Product
          </Button>
        </Box>

        <CSVReader
          onUploadAccepted={(results) => handleOnDrop(results.data)}
          onError={handleOnError}
        >
          {({ getRootProps, acceptedFile, getRemoveFileProps }) => (
            <Box
              {...getRootProps()}
              sx={{ border: '1px dashed grey', padding: '10px', marginBottom: '20px' }}
            >
              <Typography>
                {acceptedFile ? acceptedFile.name : 'Drop CSV file here or click to upload.'}
              </Typography>
              {acceptedFile && <Button {...getRemoveFileProps()}>Remove File</Button>}
            </Box>
          )}
        </CSVReader>
     
        {csvProducts.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            sx={{ marginBottom: '20px' }}
            onClick={handleAddAllCsvProducts}
          >
            Add All CSV Products
          </Button>
        )}

        <Grid container spacing={3} sx={{ marginTop: '20px' }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={6} key={product.id}>
              <Card sx={{ display: 'flex', height: '200px' }}>
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
                    {product.description}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    ${product.price}
                  </Typography>
                  <Box sx={{ marginTop: '10px' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ marginRight: '10px' }}
                      onClick={() => handleOpen(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{ marginLeft: '10px' }}
                      onClick={() => handlePromotionOpen(product)}
                    >
                      Manage Promotion
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog for Adding/Editing Products */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{selectedProduct?.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Product Name"
              fullWidth
              value={selectedProduct?.name || ''}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, name: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              value={selectedProduct?.description || ''}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, description: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={selectedProduct?.price || ''}
              onChange={(e) =>
                setSelectedProduct({ ...selectedProduct, price: e.target.value })
              }
            />
            <Button variant="contained" component="label" sx={{ marginTop: '10px' }}>
              Upload Image
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setSelectedProduct({ ...selectedProduct, image: e.target.files[0] || null })
                }
              />
            </Button>
            {selectedProduct?.image && (
              <Typography variant="body2" sx={{ marginTop: '10px' }}>
                Selected File: {selectedProduct.image.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSaveProduct}>
              {selectedProduct?.id ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for Managing Promotions */}
        <Dialog open={promotionOpen} onClose={handlePromotionClose}>
          <DialogTitle>Manage Promotion</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Discount (%)"
              type="number"
              fullWidth
              value={promotionDetails.discount}
              onChange={(e) =>
                setPromotionDetails({ ...promotionDetails, discount: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              fullWidth
              value={promotionDetails.startDate}
              onChange={(e) =>
                setPromotionDetails({ ...promotionDetails, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense"
              label="End Date"
              type="date"
              fullWidth
              value={promotionDetails.endDate}
              onChange={(e) =>
                setPromotionDetails({ ...promotionDetails, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handlePromotionClose} color="secondary">
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSavePromotion}>
              Save Promotion
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default AdminProducts;
