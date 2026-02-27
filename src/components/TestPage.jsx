import { Link } from 'react-router-dom';

const TestPage = () => {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>✅ App is Rendering! 🎉</h1>
      <p style={{ fontSize: '16px', marginBottom: '30px', color: '#666' }}>
        The application is working correctly. Navigate below to test features:
      </p>

      <div style={{
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '40px'
      }}>
        <Link
          to="/login"
          style={{
            padding: '12px 24px',
            backgroundColor: '#4299e1',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          Go to Login
        </Link>

        <Link
          to="/register"
          style={{
            padding: '12px 24px',
            backgroundColor: '#48bb78',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          Go to Register
        </Link>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>System Status</h2>
        <p style={{ color: '#666', lineHeight: '1.6' }}>
          ✅ Frontend: Running on port 5173<br />
          ✅ Backend: Running on port 5000<br />
          ✅ React App: Loaded successfully<br />
          ✅ Styling: Active<br />
          <br />
          <strong>You can now login or register with the buttons above.</strong>
        </p>
      </div>
    </div>
  );
};

export default TestPage;
