import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictSafety } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { getAllStates, getDistrictsForState } from '../../data/location';
import './Prediction.css';

const PredictionInput = () => {
  const [stateUt, setStateUt] = useState('');
  const [district, setDistrict] = useState('');
  const [availableStates, setAvailableStates] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load states on component mount
  useEffect(() => {
    setAvailableStates(getAllStates());
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (stateUt) {
      setAvailableDistricts(getDistrictsForState(stateUt));
      setDistrict(''); // Reset district when state changes
    } else {
      setAvailableDistricts([]);
    }
  }, [stateUt]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stateUt || !district) {
      setError("Please select both State and District.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await predictSafety(stateUt, district);
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
          Select a State and District to predict safety based on historical data.
        </p>
        
        <div className="prediction-card">
          {isLoading && <LoadingSpinner />}
          
          <form onSubmit={handleSubmit} className="prediction-form">
            <div className="form-group">
              <label htmlFor="stateUt">State</label>
              <select
                id="stateUt"
                value={stateUt}
                onChange={(e) => setStateUt(e.target.value)}
                required
              >
                <option value="">Select State</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="district">District</label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!stateUt}
                required
              >
                <option value="">Select District</option>
                {availableDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
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