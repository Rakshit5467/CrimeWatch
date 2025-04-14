import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import ResultNavigation from '../common/ResultNavigation';
import './Recommendation.css';

const RecommendationResult = () => {
  const location = useLocation();
  const recommendations = location.state?.results;

  if (!recommendations) {
    return <Navigate to="/recommend" replace />;
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendation-result-page">
        <div className="container">
          <h1 className="section-title">Safety Recommendations</h1>
          
          <div className="result-card no-results">
            <div className="no-results-content">
              <div className="no-results-icon">🔍</div>
              <h3>No recommendations found</h3>
              <p>Try adjusting your criteria or weights to get results</p>
            </div>
            
            <ResultNavigation
              primaryAction={{ label: 'Try Different Criteria', path: '/recommend' }}
              secondaryAction={{ label: 'Predict Specific Region', path: '/predict' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-result-page">
      <div className="container">
        <h1 className="section-title">Top Safety Recommendations</h1>
        <p className="section-subtitle">
          Based on your selected criteria and crime weightings
        </p>
        
        <div className="result-card">
          <div className="recommendations-list">
            {recommendations.map((rec) => (
              <div key={`${rec.State}-${rec.District}`} className="recommendation-item">
                <div className="rank-badge">
                  {rec.Rank}
                </div>
                
                <div className="recommendation-content">
                  <div className="location-info">
                    <span className="location-icon">📍</span>
                    {rec.District}, {rec.State}
                  </div>
                  
                  <div className="safety-score">
                    <div className="score-value">
                      {rec.Safety_Score.toFixed(1)}
                      <span className="score-max">/100</span>
                    </div>
                    <div className="score-label">Safety Score</div>
                  </div>
                  
                  <div className="crime-stats">
                    <div className="crime-stat">
                      <div className="crime-label">Murder</div>
                      <div className="crime-value">{rec.Avg_Murder.toFixed(1)}</div>
                    </div>
                    <div className="crime-stat">
                      <div className="crime-label">Rape</div>
                      <div className="crime-value">{rec.Avg_Rape.toFixed(1)}</div>
                    </div>
                    <div className="crime-stat">
                      <div className="crime-label">Theft</div>
                      <div className="crime-value">{rec.Avg_Theft.toFixed(1)}</div>
                    </div>
                    <div className="crime-stat">
                      <div className="crime-label">Riots</div>
                      <div className="crime-value">{rec.Avg_Riots.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <ResultNavigation
            primaryAction={{ label: 'Refine Recommendations', path: '/recommend' }}
            secondaryAction={{ label: 'Predict Specific Region', path: '/predict' }}
          />
        </div>
      </div>
    </div>
  );
};

export default RecommendationResult;