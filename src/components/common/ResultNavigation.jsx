import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultNavigation.css';

const ResultNavigation = ({ primaryAction, secondaryAction }) => {
  const navigate = useNavigate();

  return (
    <div className="result-navigation">
      <button onClick={() => navigate(primaryAction.path)}>
        {primaryAction.label}
      </button>
      <button onClick={() => navigate(secondaryAction.path)} className="secondary">
        {secondaryAction.label}
      </button>
    </div>
  );
};

export default ResultNavigation;