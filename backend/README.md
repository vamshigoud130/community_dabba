# Community Dabba Manager - Backend

This is the backend server for the **Community Dabba Manager**, a subscription-based meal/tiffin management service. It handles authentication, menu management, ordering, subscription tracking, feedback, stripe payments, and notifications.

## Tech Stack
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **File Upload Service**: Cloudinary (integrated with Multer for streaming image buffers)
- **Payment Gateway**: Stripe
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs (for password hashing)

## Project Flow & Architecture

1. **Authentication**: Users register/login, and passwords are encrypted using `bcryptjs`. A JWT token is generated and returned to the client to authorize subsequent requests.
2. **Role-Based Access Control**: Middleware protects routes and enforces user roles:
   - `customer`: Can subscribe to tiffin plans, order single meals, view menus, submit feedback, and view notifications.
   - `kitchen`: Manage menu items (create, update, delete, toggle availability, upload dish images).
   - `delivery`: View active deliveries, update delivery statuses, and mark orders as delivered.
   - `admin`: Full analytics dashboard view, manage all users, oversee all orders/subscriptions, and manage payments.
3. **Database Models**:
   - `User`: Handles registration, login credentials, and user roles (`customer`, `kitchen`, `delivery`, `admin`).
   - `Menu`: Stores details of meals, day-wise availability (Monday-Sunday), pricing, categories, and image URLs.
   - `Order`: Tracks individual meal orders, payments, delivery statuses, and customer details.
   - `Subscription`: Manages recurring tiffin plans (weekly/monthly), active status, and remaining meals.
   - `Feedback`: Reviews and ratings submitted by customers for menus and services.
   - `Notification`: In-app announcements and alerts for users.
4. **Cloudinary Integration**: Multer intercepts multipart/form-data images in memory and streams them directly to Cloudinary. The generated secure URLs are stored in the database.

## API Endpoints

- `/api/auth` - Register, login, and get profile details.
- `/api/menu` - Fetch, create, update, or delete menu items. Supports Cloudinary image uploads.
- `/api/orders` - Place individual orders, update delivery status, and view history.
- `/api/subscriptions` - Create, view, and manage recurring subscription plans.
- `/api/feedback` - Submit and read customer reviews/feedback.
- `/api/admin` - Fetch metrics and overview data for the admin dashboard.
- `/api/notification` - Retrieve user notifications.
- `/api/payment` - Handles Stripe checkout and payment intent processes.

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB connection string (local or MongoDB Atlas)
- Cloudinary Account (for image uploads)
- Stripe Account (for payments)

### Steps
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Seed the database with initial sample data (optional):
   ```bash
   node seed.js
   ```
5. Start the server:
   ```bash
   npm start
   ```
