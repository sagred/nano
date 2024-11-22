import { useEffect, useState } from 'react';

export const useKeyboardShortcut = () => {
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        
        const selection = window.getSelection();
        const text = selection?.toString().trim();
        
        if (text) {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const menuWidth = 300;
          const menuHeight = 400;
          
          setSelectedText(text);
          setMenuPosition({
            x: (viewportWidth - menuWidth) / 2,
            y: (viewportHeight - menuHeight) / 2
          });
          setShowMenu(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { selectedText, menuPosition, showMenu, setShowMenu };
}; 