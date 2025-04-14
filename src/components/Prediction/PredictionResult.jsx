import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import ResultNavigation from '../common/ResultNavigation';
import './PredictionResult.css';

const PredictionResult = () => {
  const location = useLocation();
  const resultData = location.state?.result;

  if (!resultData) {
    return <Navigate to="/predict" replace />;
  }

  const { prediction, stats, region } = resultData;
  const isSafe = prediction.toLowerCase() === 'safe';

  // Format crime stats for better display
  const formattedStats = Object.entries(stats).map(([crime, value]) => ({
    crime: crime.replace(/_/g, ' '),
    value: Math.round(value)
  }));

  return (
    <div className="prediction-result-page">
      <div className="container">
        <h1 className="section-title">Safety Prediction Result</h1>
        
        <div className="result-card">
          <div className={`prediction-summary ${isSafe ? 'safe' : 'unsafe'}`}>
            <div className="region-info">
              <span className="location-icon">📍</span>
              {region.district}, {region.stateUt}
            </div>
            <div className="prediction-value">
              {prediction}
              <span className="prediction-label">
                {isSafe ? 'Safe' : 'Caution'}
              </span>
            </div>
            <div className="prediction-icon">
              {isSafe ? '✅' : '⚠️'}
            </div>
          </div>

          <div className="stats-section">
            <h3>Crime Statistics (Annual Averages)</h3>
            <p className="stats-subtitle">Based on historical data analysis</p>
            
            <div className="stats-grid">
              {formattedStats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-crime">{stat.crime}</div>
                  <div className="stat-value">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <ResultNavigation
            primaryAction={{ label: 'Predict Another Region', path: '/predict' }}
            secondaryAction={{ label: 'Get Recommendations', path: '/recommend' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;