import React, { useState, useEffect } from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ onComplete }) => {
  const [text, setText] = useState("");
  const fullText = "CrimeWatch";
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (charIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setText(prev => prev + fullText[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 150);
      
      return () => clearTimeout(timeout);
    } else {
      const completionDelay = setTimeout(() => {
        if (onComplete) onComplete();
      }, 800);
      
      return () => clearTimeout(completionDelay);
    }
  }, [charIndex, fullText.length, onComplete]);

  return (
    <div className="spinner-overlay">
      <div className="spinner"></div>
      <p className="typing-text">
        {text}
        <span className="cursor" style={{ opacity: charIndex >= fullText.length ? 0 : 1 }}>|</span>
      </p>
      <p className="loading-subtext">Analyzing crime data patterns...</p>
    </div>
  );
};

export default LoadingSpinner;