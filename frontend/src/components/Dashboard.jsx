import React from 'react';
import { Globe, Compass, User } from 'lucide-react';

const Dashboard = ({ 
  visitedCount, 
  totalCountries, 
  currentUserName, 
  currentUserColor 
}) => {
  // Calculate percentage of the world explored
  const totalWorldCountries = totalCountries > 0 ? totalCountries : 195; // fallback to 195 if empty
  const percentage = ((visitedCount / totalWorldCountries) * 100).toFixed(1);

  // Helper to resolve preset color values
  const colorMap = {
    teal: '#0d9488',
    blue: '#2563eb',
    violet: '#7c3aed',
    purple: '#9333ea',
    pink: '#db2777',
    red: '#dc2626',
    orange: '#ea580c',
    yellow: '#ca8a04',
    green: '#16a34a',
    indigo: '#4f46e5'
  };

  const colorHex = colorMap[currentUserColor] || '#0d9488';

  return (
    <div 
      className="stats-container"
      style={{ 
        '--active-user-color': colorHex,
        '--active-user-glow': `${colorHex}33`
      }}
    >
      {/* Stat Card 1: Visited Countries */}
      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper">
          <Globe size={24} />
        </div>
        <div className="stat-details">
          <span className="stat-value">{visitedCount}</span>
          <span className="stat-label">Countries Visited</span>
        </div>
      </div>

      {/* Stat Card 2: Percentage Explored */}
      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper">
          <Compass size={24} />
        </div>
        <div className="stat-details">
          <span className="stat-value">{percentage}%</span>
          <span className="stat-label">World Explored</span>
        </div>
      </div>

      {/* Stat Card 3: Active Traveler */}
      <div className="glass-card stat-card">
        <div className="stat-icon-wrapper">
          <User size={24} />
        </div>
        <div className="stat-details">
          <span className="stat-value" style={{ color: colorHex }}>{currentUserName || 'Traveler'}</span>
          <span className="stat-label">Active Member</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
