import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendations } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import './Recommendation.css';

const crimeFeatures = ['MURDER', 'RAPE', 'THEFT', 'RIOTS'];

const RecommendationInput = () => {
  const [stateFilter, setStateFilter] = useState('');
  const [topN, setTopN] = useState(5);
  const [weights, setWeights] = useState(
    crimeFeatures.reduce((acc, feature) => {
      acc[feature] = 0;
      return acc;
    }, {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleWeightChange = (feature, value) => {
    const numericValue = parseFloat(value);
    setWeights({
      ...weights,
      [feature]: isNaN(numericValue) || numericValue < 0 ? 0 : numericValue,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const options = {
        state: stateFilter.toUpperCase() || null,
        topN: parseInt(topN, 10) || 5,
        weights: weights,
      };
      const results = await getRecommendations(options);
      if (results.length === 0 && !error) {
        setError("No recommendations found matching your criteria.");
      } else {
        navigate('/recommend/result', { state: { results } });
      }
    } catch (err) {
      console.error("Recommendation failed:", err);
      setError(err.message || "Failed to get recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recommendation-page">
      <div className="container">
        <h1 className="section-title">Safest Districts Recommendation</h1>
        <p className="section-subtitle">
          Get personalized safety recommendations based on your preferences and crime weightings
        </p>
        
        <div className="recommendation-card">
          {isLoading && <LoadingSpinner />}
          
          <form onSubmit={handleSubmit} className="recommendation-form">
            <div className="form-group">
              <label htmlFor="stateFilter">State / Union Territory (Optional)</label>
              <input
                type="text"
                id="stateFilter"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                placeholder="e.g., MAHARASHTRA (Leave blank for all India)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="topN">Number of Recommendations</label>
              <input
                type="number"
                id="topN"
                value={topN}
                onChange={(e) => setTopN(e.target.value)}
                min="1"
                max="20"
                required
              />
            </div>

            <div className="weights-section">
              <h3>Custom Crime Weights</h3>
              <p className="weights-description">
                Higher values will penalize districts with more of that crime type
              </p>
              
              <div className="weights-grid">
                {crimeFeatures.map((feature) => (
                  <div key={feature} className="weight-item">
                    <label htmlFor={`weight-${feature}`}>
                      {feature.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="number"
                      id={`weight-${feature}`}
                      value={weights[feature]}
                      onChange={(e) => handleWeightChange(feature, e.target.value)}
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Get Recommendations'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecommendationInput;