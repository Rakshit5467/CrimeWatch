import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Welcome to <span className="brand-highlight">CrimeWatch</span></h1>
        <p className="hero-subtitle">Advanced crime data analysis for safer communities</p>
      </header>

      <div className="info-cards">
        <div className="info-card">
          <h3>Real-time Insights</h3>
          <p>Access up-to-date crime statistics and predictive analytics to make informed decisions about safety.</p>
        </div>
        <div className="info-card">
          <h3>Comprehensive Data</h3>
          <p>Our database covers all states and union territories with detailed district-level information.</p>
        </div>
        <div className="info-card">
          <h3>Smart Recommendations</h3>
          <p>Get personalized safety recommendations based on your specific needs and preferences.</p>
        </div>
      </div>

      <div className="options-container">
        <Link to="/predict" className="option-card predict-card">
          <div className="card-icon">🔍</div>
          <h2>Predict District Safety</h2>
          <p>Enter a State/UT and District to predict if it's relatively safe or unsafe based on historical crime averages.</p>
          <div className="card-footer">Get Started →</div>
        </Link>
        <Link to="/recommend" className="option-card recommend-card">
          <div className="card-icon">🏆</div>
          <h2>Recommend Safest Districts</h2>
          <p>Get a list of the safest districts based on aggregated crime data. Filter by state and customize crime weights.</p>
          <div className="card-footer">Explore Options →</div>
        </Link>
      </div>

      <div className="stats-preview bg-gray-100 py-12 px-6">
  <div className="max-w-7xl mx-auto text-center">
    <h3 className="text-3xl font-bold text-gray-800 mb-6">Crime Insights Across India</h3>
    <p className="text-lg text-gray-600 mb-10">
      Explore comprehensive crime data from every corner of India. Our platform provides detailed analytics to understand trends, patterns, and safety metrics, empowering communities and policymakers alike.
    </p>
    <div className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="stat-item bg-white p-6 rounded-lg shadow-md">
        <div className="stat-value text-4xl font-semibold text-blue-600">36</div>
        <div className="stat-label text-gray-700 mt-2">States & Union Territories</div>
      </div>
      <div className="stat-item bg-white p-6 rounded-lg shadow-md">
        <div className="stat-value text-4xl font-semibold text-blue-600">750+</div>
        <div className="stat-label text-gray-700 mt-2">Districts Analyzed</div>
      </div>
      <div className="stat-item bg-white p-6 rounded-lg shadow-md">
        <div className="stat-value text-4xl font-semibold text-blue-600">1M+</div>
        <div className="stat-label text-gray-700 mt-2">Crime Records</div>
      </div>
      <div className="stat-item bg-white p-6 rounded-lg shadow-md">
        <div className="stat-value text-4xl font-semibold text-blue-600">20+</div>
        <div className="stat-label text-gray-700 mt-2">Crime Categories Tracked</div>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default Home;


