import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';

interface CanvasTheme {
  id: string;
  name: string;
  background: string;
  gridColor: string;
  rulerColor: string;
  shadowColor: string;
}

const themes: CanvasTheme[] = [
  {
    id: 'default',
    name: '默认',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    gridColor: '#e0e0e0',
    rulerColor: '#ffffff',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
  },
  {
    id: 'dark',
    name: '深色',
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    gridColor: '#4a5568',
    rulerColor: '#2d3748',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
  },
  {
    id: 'warm',
    name: '暖色',
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    gridColor: '#e2b08a',
    rulerColor: '#fff8f0',
    shadowColor: 'rgba(139, 69, 19, 0.2)',
  },
  {
    id: 'cool',
    name: '冷色',
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    gridColor: '#b8d4d1',
    rulerColor: '#f0fffe',
    shadowColor: 'rgba(0, 128, 128, 0.2)',
  },
  {
    id: 'minimal',
    name: '极简',
    background: '#ffffff',
    gridColor: '#f0f0f0',
    rulerColor: '#fafafa',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
  },
];

interface CanvasThemeSelectorProps {
  currentTheme?: string;
  onThemeChange?: (theme: CanvasTheme) => void;
  className?: string;
}

export const CanvasThemeSelector: React.FC<CanvasThemeSelectorProps> = ({
  currentTheme = 'default',
  onThemeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const handleThemeSelect = (theme: CanvasTheme) => {
    setSelectedTheme(theme.id);
    onThemeChange?.(theme);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === selectedTheme) || themes[0];

  return (
    <div className={`theme-selector ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-trigger"
        title="选择画布主题"
      >
        <Palette size={16} />
        <span className="theme-name">{currentThemeData.name}</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown">
          <div className="theme-header">
            <span>画布主题</span>
          </div>
          
          <div className="theme-list">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className={`theme-option ${selectedTheme === theme.id ? 'active' : ''}`}
              >
                <div 
                  className="theme-preview"
                  style={{ background: theme.background }}
                />
                <span className="theme-label">{theme.name}</span>
                {selectedTheme === theme.id && (
                  <Check size={14} className="theme-check" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasThemeSelector;