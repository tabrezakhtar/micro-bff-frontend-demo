import React, { useState, useEffect } from 'react';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/menu');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.container}><p>Loading menu...</p></div>;
  }

  if (error) {
    return <div style={styles.container}><p style={styles.error}>Error: {error}</p></div>;
  }

  if (items.length === 0) {
    return <div style={styles.container}><p>No menu items available</p></div>;
  }

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Menu</h2>
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} style={styles.categorySection}>
          <h3 style={styles.categoryTitle}>{category}</h3>
          <div style={styles.itemsGrid}>
            {categoryItems.map(item => (
              <div key={item.id} style={styles.menuItem}>
                <h4 style={styles.itemName}>{item.name}</h4>
                <p style={styles.itemDescription}>{item.description}</p>
                <div style={styles.itemFooter}>
                  <span style={styles.itemPrice}>{item.price}</span>
                  <span style={{
                    ...styles.itemStatus,
                    color: item.isAvailable ? '#22c55e' : '#ef4444'
                  }}>
                    {item.isAvailable ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  heading: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1f2937'
  },
  categorySection: {
    marginBottom: '30px'
  },
  categoryTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '10px'
  },
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px'
  },
  menuItem: {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#f9fafb',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    transition: 'box-shadow 0.2s'
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#1f2937'
  },
  itemDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 10px 0',
    lineHeight: '1.4'
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    borderTop: '1px solid #e5e7eb'
  },
  itemPrice: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#059669'
  },
  itemStatus: {
    fontSize: '12px',
    fontWeight: '600'
  },
  error: {
    color: '#dc2626',
    fontWeight: 'bold'
  }
};
