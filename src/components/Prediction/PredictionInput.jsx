import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictSafety } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import './Prediction.css';

const PredictionInput = () => {
  const [stateUt, setStateUt] = useState('');
  const [district, setDistrict] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stateUt || !district) {
      setError("Please enter both State/UT and District.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await predictSafety(stateUt.toUpperCase(), district.toUpperCase());
      navigate('/predict/result', { state: { result } });
    } catch (err) {
      console.error("Prediction failed:", err);
      setError(err.message || "Failed to get prediction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="prediction-page">
      <div className="container">
        <h1 className="section-title">District Safety Prediction</h1>
        <p className="section-subtitle">
          Enter a State/UT and District to predict if it's relatively safe or unsafe based on historical crime averages.
        </p>
        
        <div className="prediction-card">
          {isLoading && <LoadingSpinner />}
          
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="form-group">
              <label htmlFor="stateUt">State / Union Territory</label>
              <input
                type="text"
                id="stateUt"
                value={stateUt}
                onChange={(e) => setStateUt(e.target.value)}
                placeholder="e.g., MAHARASHTRA"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                type="text"
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g., MUMBAI"
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Predict Safety'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PredictionInput;