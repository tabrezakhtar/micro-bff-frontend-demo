import React, { Suspense } from 'react';

const Menu = React.lazy(() => import('menu-mfe/Menu'));

export default function App() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Food Ordering</h1>
        <p style={styles.subtitle}>This is the host consumer app</p>
      </header>

      <main style={styles.main}>
        <Suspense fallback={<div style={styles.loading}>Loading menu component...</div>}>
          <Menu />
        </Suspense>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          This is the Host App. The Menu component is loaded from the Menu MFE (localhost:5174) at runtime.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center',
    borderBottom: '4px solid #f59e0b'
  },
  heading: {
    margin: 0,
    fontSize: '40px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#d1d5db'
  },
  main: {
    flex: 1,
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#6b7280'
  },
  footer: {
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
    padding: '20px',
    textAlign: 'center',
    color: '#6b7280'
  },
  footerText: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.6'
  }
};
