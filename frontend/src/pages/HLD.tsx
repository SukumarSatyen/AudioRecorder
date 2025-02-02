import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

const HLD: React.FC = () => {
  const characteristics = [
    { title: 'Macro-level perspective', image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Defines major system components and interactions', image: 'https://images.unsplash.com/photo-1476357471311-43c0db9fb2b4?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Created by solution architects', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Provides a conceptual blueprint', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Involves design team, review team, and client team', image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1350&q=80' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % characteristics.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundImage: `url(${characteristics[currentIndex].image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        fontSize: '24px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#FF9800' }}>High Level Design (HLD)</h1>
        <h2 style={{ color: '#F57C00' }}>Focus</h2>
        <p>Overall system architecture and structure</p>
        <h2 style={{ color: '#F57C00' }}>Characteristics:</h2>
        <Typography variant="h6" component="h2" style={{ textAlign: 'center', color: 'white', fontSize: '24px' }}>
          {characteristics[currentIndex].title}
        </Typography>
      </div>
    </div>
  );
};

export default HLD;
