# Community Dabba Manager - Frontend

This is the client-side single-page application (SPA) for the **Community Dabba Manager**. It provides responsive and user-friendly interfaces tailored to four user roles: Customers, Kitchen Staff, Delivery Partners, and Admins.

## Tech Stack
- **Framework**: React.js (built with Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v7)
- **State Management**: React Context API (`AuthContext`)
- **API Client**: Axios (configured with global base URL and authorization interceptors)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (for admin dashboard metrics)

## Features & Project Flow

1. **Authentication & Authorization**:
   - Integrated signup/login views with validation.
   - Global `AuthContext` tracks the user session and token in `localStorage`.
   - `ProtectedRoute` component restricts routes to authorized users and handles role-based routing.

2. **Customer View**:
   - View the active menu categorized by type and day of the week.
   - Subscribe to recurring weekly/monthly meal packages.
   - Place one-off orders and make secure card payments via Stripe.
   - Submit feedback/reviews for meals.
   - View in-app notifications.

3. **Kitchen View**:
   - Manage the digital menu (Add new dishes, Edit existing ones, and Delete items).
   - Upload dish images directly using drag-and-drop / file selector input, which streams images directly to Cloudinary.
   - Toggle meal availability in real-time.

4. **Delivery View**:
   - Access lists of pending and in-transit orders.
   - Interactive updates to change statuses from preparing, dispatched, to delivered.

5. **Admin View**:
   - High-level metric cards showing revenue, orders, subscriptions, and active users.
   - Interactive charts built with `recharts` showing subscription distributions and sales trends.
   - Manage users, subscriptions, orders, and review feedback.

## Setup Instructions

### Prerequisites
- Node.js installed

### Steps
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Backend Base URL:
   - Ensure the server URL in `src/context/AuthContext.jsx` (specifically `axios.defaults.baseURL`) matches your running backend instance (e.g. `http://localhost:5000/api` or production URL).
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Build for production (optional):
   ```bash
   npm run build
   ```
