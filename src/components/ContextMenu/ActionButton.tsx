import { useState } from "react";

interface ActionButtonProps {
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    onClick?: () => void;
    tooltip: string;
  }
  
const ActionButton: React.FC<ActionButtonProps> = ({
    icon,
    activeIcon,
    onClick,
    tooltip
  }) => {
    const [isActive, setIsActive] = useState(false);
  
    const handleClick = () => {
      if (onClick) {
        setIsActive(true);
        onClick();
        setTimeout(() => setIsActive(false), 1000);
      }
    };
  
    return (
      <button
        onClick={handleClick}
        style={{
          padding: '8px',
          background: 'transparent',
          border: 'none',
          borderRadius: '6px',
          color: '#22c55e',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
        }}
        title={tooltip}
      >
        <div style={{
          width: '14px',
          height: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          transform: isActive ? 'scale(0.8)' : 'scale(1)',
        }}>
          {isActive ? activeIcon : icon}
        </div>
      </button>
    );
  };


  export default ActionButton;