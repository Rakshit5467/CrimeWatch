import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ResultNavigation from '../common/ResultNavigation';
import './Recommendation.css';

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


const RecommendationResult = () => {
  const location = useLocation();
  const recommendations = location.state?.results;
  const [coordinatesList, setCoordinatesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!recommendations || recommendations.length === 0) return;

    const fetchAllCoordinates = async () => {
      setIsLoading(true);
      console.log("Fetching coordinates for:", recommendations);
      try {
        const coordsPromises = recommendations.map(async (rec) => {
          // --- Ensure Safety_Score is a number before proceeding ---
          const safetyScoreValue = parseFloat(rec.Safety_Score);
          if (isNaN(safetyScoreValue)) {
            console.warn(`Invalid Safety_Score for ${rec.District}, ${rec.State}: ${rec.Safety_Score}. Using 0.`);
          }
          // --- Use the parsed number (or 0 if invalid) ---
          const numericSafetyScore = isNaN(safetyScoreValue) ? 0 : safetyScoreValue; 

          const query = `${rec.District}, ${rec.State}, India`;
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
          
          try {
            const response = await fetch(url, {
              headers: {
                'User-Agent': 'CrimeAnalysisApp/1.0 (your.email@example.com)' // Replace with your app/contact
              }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.length > 0) {
              console.log(`Coordinates found for ${rec.District}:`, [data[0].lat, data[0].lon]);
              return {
                district: rec.District,
                state: rec.State,
                coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
                // --- FIX 1: Store the numeric value ---
                safetyScore: numericSafetyScore, 
                rank: rec.Rank
              };
            } else {
              console.warn(`No coordinates found for ${rec.District}, ${rec.State}. Using default.`);
              return {
                district: rec.District,
                state: rec.State,
                coords: [20.5937, 78.9629], // Default India coordinates
                 // --- FIX 1 (cont.): Store the numeric value ---
                safetyScore: numericSafetyScore,
                rank: rec.Rank,
                isDefault: true 
              };
            }
          } catch (error) {
            console.error(`Error fetching coordinates for ${rec.District}, ${rec.State}:`, error);
            return {
              district: rec.District,
              state: rec.State,
              coords: [20.5937, 78.9629], 
               // --- FIX 1 (cont.): Store the numeric value ---
              safetyScore: numericSafetyScore,
              rank: rec.Rank,
              isDefault: true 
            };
          }
        });

        const coords = await Promise.all(coordsPromises);
        const validCoords = coords.filter(item => item !== null && item.coords); 
        console.log("Fetched coordinates list:", validCoords);
        setCoordinatesList(validCoords);

      } catch (error) {
        console.error('Error fetching coordinates batch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCoordinates();
  }, [recommendations]); 

  console.log('Final coordinatesList before render:', coordinatesList);

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
              <p>Try adjusting your criteria or weights to get results.</p>
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

   const validMapCoords = coordinatesList.filter(loc => !loc.isDefault); 
   const centerCoords = validMapCoords.length > 0 ? validMapCoords : coordinatesList; 

  const mapCenter = centerCoords.length > 0
    ? centerCoords.reduce((acc, curr) => [acc[0] + curr.coords[0], acc[1] + curr.coords[1]], [0, 0])
        .map(sum => sum / centerCoords.length)
    : [20.5937, 78.9629]; 

  const mapZoom = centerCoords.length > 1 ? 5 : 7;

  return (
    <div className="recommendation-result-page">
      <div className="container">
        <h1 className="section-title">Top Safety Recommendations</h1>
        <p className="section-subtitle">
          Based on your selected criteria and crime weightings.
        </p>
        
        <div className="result-card">
          <div className="map-section">
            <h3>Recommended Locations</h3>
            <p className="map-subtitle">Showing top {recommendations.length} safest districts based on your criteria.</p>
            
            {isLoading ? (
              <div className="map-loading">
                <div className="spinner"></div> 
                Loading map coordinates...
              </div>
            ) : coordinatesList.length > 0 ? (
              <div className="map-container">
                <MapContainer 
                  key={mapCenter.join(',')} 
                  center={mapCenter} 
                  zoom={mapZoom} 
                  scrollWheelZoom={true}
                  style={{ height: '400px', width: '100%', borderRadius: 'var(--border-radius)' }}
                >
                  <TileLayer
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {coordinatesList.map((location) => (
                    location.coords && location.coords.length === 2 ? (
                      <Marker 
                        key={`${location.district}-${location.state}`} 
                        position={location.coords} 
                        icon={customIcon} 
                      >
                        <Popup>
                          <div className="popup-content"> 
                            <strong>{location.district}, {location.state}</strong><br />
                            <span className={`rank-badge ${location.isDefault ? 'default-coords' : ''}`}>
                                Rank #{location.rank} {location.isDefault ? '(Default Location)' : ''}
                            </span>
                            <div className="safety-score-popup">
                              {/* Use the already numeric location.safetyScore */}
                              Safety Score: {location.safetyScore.toFixed(1)}/100 
                            </div>
                            <div className="popup-coords">
                              Coords: {location.coords[0].toFixed(4)}, {location.coords[1].toFixed(4)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ) : (
                      console.warn(`Skipping marker for ${location.district} due to invalid coordinates.`)
                    )
                  ))}
                </MapContainer>
              </div>
            ) : (
              <div className="map-error">Could not retrieve coordinates to display on the map. Please check the console for errors.</div>
            )}
          </div>

          <div className="recommendations-list">
            {recommendations.map((rec) => {
               // --- FIX 2: Ensure rec.Safety_Score is treated as a number here too ---
              const numericSafetyScore = parseFloat(rec.Safety_Score);
              const displaySafetyScore = isNaN(numericSafetyScore) ? 'N/A' : numericSafetyScore.toFixed(1);
              // Also parse crime stats just in case
              const avgMurder = parseFloat(rec.Avg_Murder);
              const displayMurder = isNaN(avgMurder) ? 'N/A' : avgMurder.toFixed(1);
              const avgRape = parseFloat(rec.Avg_Rape);
              const displayRape = isNaN(avgRape) ? 'N/A' : avgRape.toFixed(1);
              const avgTheft = parseFloat(rec.Avg_Theft);
              const displayTheft = isNaN(avgTheft) ? 'N/A' : avgTheft.toFixed(1);
              const avgRiots = parseFloat(rec.Avg_Riots);
              const displayRiots = isNaN(avgRiots) ? 'N/A' : avgRiots.toFixed(1);

              return (
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
                        {displaySafetyScore} {/* Use parsed and formatted value */}
                        {displaySafetyScore !== 'N/A' && <span className="score-max">/100</span>}
                      </div>
                      <div className="score-label">Safety Score</div>
                    </div>
                    <div className="crime-stats">
                      <div className="crime-stat">
                        <div className="crime-label">Murder</div>
                        <div className="crime-value">{displayMurder}</div>
                      </div>
                      <div className="crime-stat">
                        <div className="crime-label">Rape</div>
                        <div className="crime-value">{displayRape}</div>
                      </div>
                      <div className="crime-stat">
                        <div className="crime-label">Theft</div>
                        <div className="crime-value">{displayTheft}</div>
                      </div>
                      <div className="crime-stat">
                        <div className="crime-label">Riots</div>
                        <div className="crime-value">{displayRiots}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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