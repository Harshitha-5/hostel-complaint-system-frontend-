# Frontend - Hostel Complaint System

React application for the hostel complaint management system.

## Quick Start

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx               - Login page
│   │   ├── Register.jsx            - Registration page
│   │   ├── StudentDashboard.jsx    - Student interface
│   │   ├── AdminDashboard.jsx      - Admin interface
│   │   └── ProtectedRoute.jsx      - Route protection
│   ├── context/
│   │   └── AuthContext.jsx         - Auth state management
│   ├── styles/
│   │   ├── Auth.css                - Login/Register styles
│   │   ├── Dashboard.css           - Student dashboard styles
│   │   └── AdminDashboard.css      - Admin dashboard styles
│   ├── App.jsx                     - Main app component
│   ├── main.jsx                    - Entry point
│   └── index.css                   - Global styles
├── public/                         - Static assets
├── index.html
├── vite.config.js
├── package.json
└── .env (if needed)
```

## Dependencies

- **react** - UI library
- **react-dom** - React DOM rendering
- **react-router-dom** - Navigation
- **recharts** - Data visualization

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview build
npm run lint     # Run ESLint
```

## Features by Page

### Login Page
- Email and password input
- Role-based automatic redirect
- Error message display
- Link to registration

### Registration Page
- Name, email, password input
- Role selection (Student/Admin)
- Form validation
- Link to login

### Student Dashboard
- File new complaint form
- Complaint title, description, category, priority
- Image upload (up to 5 images)
- Complaint list with status badges
- Filter by status (all, pending, in progress, resolved)
- Search complaints by title/description
- View admin notes on complaints
- Notification panel with unread count
- Logout functionality

### Admin Dashboard
- Statistics cards (total, pending, in progress, resolved)
- Category distribution pie chart
- Priority distribution pie chart
- 7-day complaint trend bar chart
- Average resolution time display
- Complaint list with student details
- Update complaint status dropdown
- Add admin notes
- Filter and search complaints
- Logout functionality

## API Integration

All API calls use the following base URL: `http://localhost:5000`

Requests include JWT token in Authorization header:
```javascript
Authorization: Bearer <JWT_TOKEN>
```

## State Management

- **AuthContext**: Manages user authentication state
  - user (current logged-in user)
  - token (JWT token)
  - login/register/logout functions
  - isAuthenticated flag

- **Component State**: Local state for forms, lists, filters

## Styling

- **Color Scheme**:
  - Primary: #667eea
  - Secondary: #764ba2
  - Success: #4caf50
  - Warning: #ff9800
  - Error: #f44336
  - Info: #2196f3

- **Responsive Design**: Mobile-first approach with grid layouts
- **Cards & Shadows**: Clean, modern UI components
- **Transitions**: Smooth hover effects and animations

## Key Components

### AuthContext Provider
Wraps entire app to provide authentication context globally.

### ProtectedRoute
Ensures only authenticated users with correct role can access routes.

### StudentDashboard
Main interface for students to manage complaints.

### AdminDashboard
Admin panel for managing all complaints and viewing analytics.

## Environment Setup

No .env file needed for frontend in development. 
Backend URL is hardcoded to `http://localhost:5000`.

For production, update API URLs in components or create an env config.

## Features

✅ User authentication (login/register)
✅ Role-based access control
✅ Create complaints with file uploads
✅ Filter and search complaints
✅ View complaint status updates
✅ Admin complaint management
✅ Real-time notifications
✅ Analytics dashboard with charts
✅ Responsive design
✅ Error handling

## Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Module not found errors
```bash
npm install
rm -rf node_modules
npm install
```

### API connection refused
- Ensure backend server is running on port 5000
- Check CORS configuration in backend
- Verify API endpoints match between frontend & backend

### Charts not rendering
- Verify Recharts is installed: `npm list recharts`
- Check browser console for errors

---

For full documentation, see [../README.md](../README.md)

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
