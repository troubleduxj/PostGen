import React from 'react';

interface CanvasBackgroundProps {
  type?: 'dots' | 'grid' | 'lines' | 'clean';
  color?: string;
  size?: number;
  opacity?: number;
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  type = 'clean',
  color = '#f0f0f0',
  size = 20,
  opacity = 0.5
}) => {
  const getBackgroundStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 1,
    };

    switch (type) {
      case 'dots':
        return {
          ...baseStyle,
          backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
          opacity,
        };
      
      case 'grid':
        return {
          ...baseStyle,
          backgroundImage: `
            linear-gradient(${color} 1px, transparent 1px),
            linear-gradient(90deg, ${color} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
          opacity,
        };
      
      case 'lines':
        return {
          ...baseStyle,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent ${size - 1}px,
            ${color} ${size}px
          )`,
          opacity,
        };
      
      case 'clean':
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0),
            radial-gradient(circle at 75px 75px, rgba(255,255,255,0.1) 1px, transparent 0)
          `,
          backgroundSize: '100px 100px',
        };
    }
  };

  return <div style={getBackgroundStyle()} />;
};

export default CanvasBackground;