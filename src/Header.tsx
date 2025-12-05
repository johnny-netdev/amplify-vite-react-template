import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

// Define the component's props if needed (optional for now)
interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  // Use the Authenticator hook to show/hide the correct button
  const { authStatus, signOut, toSignIn } = useAuthenticator((context) => [
    context.authStatus,
    context.signOut,
    context.toSignIn,
  ]);

  const renderAuthButton = () => {
    if (authStatus === 'authenticated') {
      return (
        <button onClick={signOut} style={styles.navButton}>
          Sign Out
        </button>
      );
    } 
    return (
      <button onClick={toSignIn} style={styles.navButton}>
        Sign In
      </button>
    );
  };

  return (
    <header style={styles.header}>
      {/* ⭐️ 1. Logo Area */}
      <div style={styles.logo}>
        ⚛️ **My Amplify App**
      </div>

      {/* ⭐️ 2. Navigation Area */}
      <nav style={styles.nav}>
        {/* Example Navigation Buttons */}
        <button style={styles.navButton}>Home</button>
        <button style={styles.navButton}>About</button>
        
        {/* ⭐️ 3. Authentication Button (from your previous App.tsx logic) */}
        {renderAuthButton()}
      </nav>
    </header>
  );
};

// Basic CSS Styling (You should move this to a separate CSS file later)
const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between', // Puts space between logo and nav
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333', // Dark background
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '1.5em',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    gap: '10px', // Space between buttons
  },
  navButton: {
    padding: '8px 15px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Header;