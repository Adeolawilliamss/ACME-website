'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import './darkmode.css';

const DarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.body.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className='dark_mode flex flex-row mx-auto'>
      <input
        className='dark_mode_input'
        type='checkbox'
        id='darkmode-toggle'
        checked={isDarkMode}
        onChange={toggleDarkMode}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} 
      />
      <label className='dark_mode_label' htmlFor='darkmode-toggle'>
        <Sun className='sun w-5 h-5' />
        <Moon className='moon w-5 h-5' />
      </label>
    </div>
  );
};

export default DarkMode;
