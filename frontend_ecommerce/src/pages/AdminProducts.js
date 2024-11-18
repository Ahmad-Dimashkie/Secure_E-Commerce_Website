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
  const [open, setOpen] = useState(false); // State for product dialog
  const [promotionOpen, setPromotionOpen] = useState(false); // State for promotion dialog
  const [selectedProduct, setSelectedProduct] = useState(null); // Product selected for editing/viewing
  const [promotionDetails, setPromotionDetails] = useState({
    discount: '',
    startDate: '',
    endDate: '',
  });
  const [csvFile, setCsvFile] = useState(null); // State for the CSV file to be uploaded

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
      product
        ? { ...product }
        : {
            name: '',
            description: '',
            price: '',
            category_id: '',
            inventory_id: '',
            stock_level: '',
            image_url: '',
            image: null,
          }
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
      let response;

      if (selectedProduct.image) {
        // If an image is provided, use FormData for the request
        const formData = new FormData();
        formData.append('name', selectedProduct.name);
        formData.append('description', selectedProduct.description);
        formData.append('price', parseFloat(selectedProduct.price));
        formData.append('category_id', parseInt(selectedProduct.category_id));
        formData.append('inventory_id', parseInt(selectedProduct.inventory_id));
        formData.append('stock_level', parseInt(selectedProduct.stock_level));
        formData.append('image', selectedProduct.image);

        if (selectedProduct.id) {
          // Update existing product
          response = await api.put(`/products/${selectedProduct.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          // Create new product
          response = await api.post('/products', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      } else {
        // If no image, send JSON data
        const productData = {
          name: selectedProduct.name,
          description: selectedProduct.description,
          price: parseFloat(selectedProduct.price),
          category_id: parseInt(selectedProduct.category_id),
          inventory_id: parseInt(selectedProduct.inventory_id),
          stock_level: parseInt(selectedProduct.stock_level),
          image_url: selectedProduct.image_url || '', // Optional field, can be empty
        };

        if (selectedProduct.id) {
          // Update existing product
          response = await api.put(`/products/${selectedProduct.id}`, productData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } else {
          // Create new product
          response = await api.post('/products', productData, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }

      // Update state with new or updated product
      if (selectedProduct.id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) => (product.id === selectedProduct.id ? response.data : product))
        );
      } else {
        setProducts([...products, response.data]);
      }

      enqueueSnackbar('Product saved successfully', { variant: 'success' });
      handleClose();
    } catch (error) {
      enqueueSnackbar('Failed to save product', { variant: 'error' });
      console.error('Error saving product:', error);
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

  // Handle CSV file drop
  const handleOnDrop = (data) => {
    console.log('CSV Data Preview:', data); // Display CSV data in console
    enqueueSnackbar('CSV loaded for preview. Upload to process.', { variant: 'info' });
  };

  // Handle actual CSV upload to the backend
  const handleCsvUpload = async () => {
    if (!csvFile) {
      enqueueSnackbar('Please select a CSV file to upload.', { variant: 'warning' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      await api.post('/upload-products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      enqueueSnackbar('CSV file uploaded and processed successfully', { variant: 'success' });

      // Refresh the product list
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to upload CSV file', { variant: 'error' });
      console.error('Error uploading CSV:', error.response || error);
    }
  };

  // Handle CSV file selection
  const handleCsvFileSelect = (event) => {
    setCsvFile(event.target.files[0]);
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
  const handleSavePromotion = async () => {
    try {
      const promotionData = {
        product_id: selectedProduct.id,
        discount_percentage: parseFloat(promotionDetails.discount),
        start_date: promotionDetails.startDate,
        end_date: promotionDetails.endDate,
      };

      // Apply promotion to the product via API call
      await api.post('/promotions', promotionData);

      // Update the product in the local state to reflect the new price and promotion details
      const discountedPrice = selectedProduct.price * (1 - promotionDetails.discount / 100);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === selectedProduct.id
            ? {
                ...product,
                discountedPrice,
                promotionDetails: {
                  discount: promotionDetails.discount,
                  startDate: promotionDetails.startDate,
                  endDate: promotionDetails.endDate,
                },
              }
            : product
        )
      );

      enqueueSnackbar('Promotion added successfully', { variant: 'success' });
      handlePromotionClose();
    } catch (error) {
      enqueueSnackbar('Failed to save promotion', { variant: 'error' });
      console.error('Error saving promotion:', error.response || error);
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

        {/* CSV Upload Section */}
        <Box sx={{ marginBottom: '20px' }}>
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvFileSelect}
            style={{ marginBottom: '10px' }}
          />
          <Button variant="contained" color="primary" onClick={handleCsvUpload}>
            Upload CSV
          </Button>
        </Box>

        {/* CSV Preview Section */}
        <CSVReader onUploadAccepted={(results) => handleOnDrop(results.data)} onError={(err) => console.error('Error reading CSV:', err)}>
          {({ getRootProps, acceptedFile, getRemoveFileProps }) => (
            <Box {...getRootProps()} sx={{ border: '1px dashed grey', padding: '10px', marginBottom: '20px' }}>
              <Typography>
                {acceptedFile ? acceptedFile.name : 'Drop CSV file here or click to preview.'}
              </Typography>
              {acceptedFile && <Button {...getRemoveFileProps()}>Remove File</Button>}
            </Box>
          )}
        </CSVReader>

        <Grid container spacing={3} sx={{ marginTop: '20px' }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={6} key={product.id}>
              <Card sx={{ display: 'flex', height: '250px' }}>
                <CardMedia
                  component="img"
                  sx={{ width: 230 }}
                  image={product.image_url ? product.image_url : 'placeholder-image.jpg'}
                  alt={product.name}
                />
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Box sx={{ marginTop: '10px' }}>
                    {product.discountedPrice ? (
                      <>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ textDecoration: 'line-through', marginRight: '10px' }}
                        >
                          ${product.price.toFixed(2)}
                        </Typography>
                        <Typography variant="body1" color="error" sx={{ fontWeight: 'bold' }}>
                          ${product.discountedPrice.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ marginTop: '5px' }}>
                          Promotion: {product.promotionDetails?.startDate} - {product.promotionDetails?.endDate}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body1" color="text.primary">
                        ${product.price.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
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
            {/* Product form fields */}
            <TextField
              margin="dense"
              label="Product Name"
              fullWidth
              value={selectedProduct?.name || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              value={selectedProduct?.description || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={selectedProduct?.price || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Category ID"
              type="number"
              fullWidth
              value={selectedProduct?.category_id || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, category_id: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Inventory ID"
              type="number"
              fullWidth
              value={selectedProduct?.inventory_id || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, inventory_id: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Stock Level"
              type="number"
              fullWidth
              value={selectedProduct?.stock_level || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, stock_level: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Image URL"
              fullWidth
              value={selectedProduct?.image_url || ''}
              onChange={(e) => setSelectedProduct({ ...selectedProduct, image_url: e.target.value })}
            />
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
              onChange={(e) => setPromotionDetails({ ...promotionDetails, discount: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Start Date"
              type="date"
              fullWidth
              value={promotionDetails.startDate}
              onChange={(e) => setPromotionDetails({ ...promotionDetails, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              margin="dense"
              label="End Date"
              type="date"
              fullWidth
              value={promotionDetails.endDate}
              onChange={(e) => setPromotionDetails({ ...promotionDetails, endDate: e.target.value })}
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
