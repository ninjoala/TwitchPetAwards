'use client';

import { useEffect } from 'react';

export default function BackgroundLoader() {

  useEffect(() => {
    // Load placeholder first
    const placeholder = new Image();
    placeholder.src = '/images/backgrounds/PETS-BG-placeholder.jpg'; // You'll need to create this
    placeholder.onload = () => {
      document.body.classList.add('placeholder-loaded');
    };

    // Then load full image
    const img = new Image();
    img.src = '/images/backgrounds/PETS-BG.jpg';
    img.onload = () => {
      document.body.classList.add('loaded');
    };
  }, []);

  return null;
} 