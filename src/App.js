import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner';
import Home from './components/Home/Home';
import PredictionInput from './components/Prediction/PredictionInput';
import PredictionResult from './components/Prediction/PredictionResult';
import RecommendationInput from './components/Recommendation/RecommendationInput';
import RecommendationResult from './components/Recommendation/RecommendationResult';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import './App.css';

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return <LoadingSpinner onComplete={() => setIsInitialLoading(false)} />;
  }

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predict" element={<PredictionInput />} />
            <Route path="/predict/result" element={<PredictionResult />} />
            <Route path="/recommend" element={<RecommendationInput />} />
            <Route path="/recommend/result" element={<RecommendationResult />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;