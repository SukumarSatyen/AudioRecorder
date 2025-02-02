import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

const CodeFlow: React.FC = () => {
  const characteristics = [
    { title: 'Data flow overview', image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Execution sequence', image: 'https://images.unsplash.com/photo-1476357471311-43c0db9fb2b4?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Log data processing', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Error handling strategy', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Performance metrics', image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Data integrity checks', image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Resource utilization', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Security protocols', image: 'https://images.unsplash.com/photo-1542744095-291d1f67b221?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Unit testing strategies', image: 'https://images.unsplash.com/photo-1602080858428-57174f9431cf?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Integration testing methods', image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=1350&q=80' },
    { title: 'Deployment strategies', image: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?auto=format&fit=crop&w=1350&q=80' },
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
        <h1 style={{ color: '#FF9800' }}>Code Flow</h1>
        <h2 style={{ color: '#F57C00' }}>Focus</h2>
        <p>Overview of data flow and execution sequence</p>
        <h2 style={{ color: '#F57C00' }}>Characteristics:</h2>
        <Typography variant="h6" component="h2" style={{ textAlign: 'center', color: 'white', fontSize: '24px' }}>
          {characteristics[currentIndex].title}
        </Typography>
      </div>
    </div>
  );
};

export default CodeFlow;