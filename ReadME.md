# Electronics & Gadgets Ecommerce Platform

## Project Overview

This project is an ecommerce web application for an electronics and gadgets shop. The platform offers a wide variety of products, including smartphones, laptops, gaming consoles, and accessories, with user-friendly browsing and purchase options. Developed using Flask for the backend and React for the frontend, the application provides both guest and registered users with a seamless shopping experience, with unique features and benefits based on user membership tiers (Normal, Premium, and Gold).

## Key Features

### Customer-Facing Features

1. **Dynamic Homepage**

   - Features personalized product recommendations, best-sellers, and seasonal promotions for registered users.
   - Displays sections such as Top Sold Products, Top Sold by Category, and Featured Promotions.

2. **Product Catalog and Navigation**

   - Users can browse and search for products by categories, such as "Smartphones," "Laptops," and "Gaming Consoles," with subcategories for easier navigation.
   - Advanced search and smart filters allow users to refine searches based on brand, price, customer ratings, technical specifications, and more.

3. **Product Pages**

   - Detailed product information, high-quality images, user manuals, dimensions, energy efficiency labels, and videos where available.
   - Customer reviews and ratings to help users make informed purchase decisions.

4. **Checkout and Payment Integration**

   - Simple and streamlined checkout process with a cart page for easy order review.
   - Guest checkout option for non-registered users.

5. **Membership Tiers for Registered Users**

   - **Normal Members**: Personalized experience, saved searches, and purchase accumulation to qualify for higher tiers.
   - **Premium Members**: Discounts on selected products, free delivery on most orders, early access to sales, and exclusive gifts.
   - **Gold Members**: Highest discounts, free delivery on all orders, priority customer support, and frequent rewards.

6. **Delivery Options and Tracking**

   - Standard and express delivery with flexible time slot selection.
   - In-store pickup option available for local purchases.

7. **After-Sales Services**
   - Hassle-free returns and repair services, with options for extended warranties on certain products.

### Admin and Backend Features

1. **Inventory Management**

   - Real-time inventory tracking across multiple warehouses, with alerts for low stock levels.
   - Inventory reporting to analyze turnover, popular products, and demand forecasting.

2. **Order Management**

   - Tools for tracking order statuses (pending, processing, shipped, delivered), generating invoices, and managing returns.

3. **Product Management**

   - Add, update, and remove products, with bulk upload support via CSV or supplier API integration.
   - Price and promotion management, with discount codes and coupons for different membership tiers.

4. **Customer Management**

   - Access customer profiles, including order history, saved preferences, and wishlists.
   - Segment customers based on behavior for targeted marketing.

5. **Customer Support Tools**

   - Email support integrated into the platform to handle customer inquiries and feedback.

6. **User and Role Management**
   - Role-based access control (RBAC) with different access levels for admins, as well as activity logs to track all actions.

## Technology Stack and Architecture

- **Frontend**: React
  - Provides a responsive and interactive user experience with a dynamic, modular structure.
- **Backend**: Flask
  - Built with multiple services to ensure scalability and separation of concerns. Separate modules include:
    - **Customer Service**: Manages user profiles, purchase history, and tier benefits.
    - **Admin Service**: Includes inventory and order management functionalities.
    - **RBAC Service**: Manages role-based access control and admin privileges.
- **Database**: Hosted independently, accessible via Flask backend for secure data handling and user information storage.

## Membership Tier Benefits

### Guest Users (Non-Sign-Up)

- Browse the catalog and purchase items via guest checkout.
- Limited access without tracking, promotions, or saved information.

### Normal Members

- Personalized experience and saved searches.
- Purchases contribute toward tier progression.

### Premium Members

- Discounts on select products, free delivery above a certain value, exclusive gifts, and early access to sales.

### Gold Members

- Access to the highest discounts, free delivery on all orders, priority customer support, and special rewards during promotions.

## Conclusion

The Electronics & Gadgets Ecommerce Platform provides a full-featured online shopping experience tailored to different user levels, from guest checkout to tiered membership benefits. This ecommerce site offers a secure, streamlined purchasing process with valuable after-sales support, making it an ideal choice for tech enthusiasts and casual shoppers alike.
