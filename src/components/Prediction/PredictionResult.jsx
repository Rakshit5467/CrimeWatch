import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ResultNavigation from '../common/ResultNavigation';
import './PredictionResult.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const customIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PredictionResult = () => {
  const location = useLocation();
  const resultData = location.state?.result;
  const [coordinates, setCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Format crime stats for better display
  const formattedStats = resultData ? Object.entries(resultData.stats).map(([crime, value]) => ({
    crime: crime.replace(/_/g, ' '),
    value: Math.round(value)
  })) : [];

  useEffect(() => {
    if (!resultData) return;

    const fetchCoordinates = async () => {
      // If coordinates are already provided in resultData, use them
      if (resultData.coordinates) {
        setCoordinates(resultData.coordinates);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(resultData.region.district)},${encodeURIComponent(resultData.region.stateUt)},India&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setCoordinates(coords);
        } else {
          setCoordinates([20.5937, 78.9629]);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        setCoordinates([20.5937, 78.9629]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoordinates();
  }, [resultData]);

  if (!resultData) {
    return <Navigate to="/predict" replace />;
  }

  const { prediction, region } = resultData;
  const isSafe = prediction.toLowerCase() === 'safe';

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

          {/* Map Section */}
          <div className="map-section">
            <h3>Location Map</h3>
            <p className="map-subtitle">Showing {region.district} district</p>
            
            {isLoading ? (
              <div className="map-loading">Loading map...</div>
            ) : coordinates ? (
              <div className="map-container">
                <MapContainer 
                  center={coordinates} 
                  zoom={12} 
                  scrollWheelZoom={true}
                  style={{ height: '400px', width: '100%', borderRadius: 'var(--border-radius)' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={coordinates} icon={customIcon}>
                    <Popup>
                      <strong>{region.district}, {region.stateUt}</strong><br />
                      <div className="popup-content">
                        <span className={`prediction-badge ${isSafe ? 'safe' : 'unsafe'}`}>
                          {prediction}
                        </span>
                        <div className="popup-coords">
                          Coordinates: {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="map-error">Could not load map coordinates</div>
            )}
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