import React, { useState, useEffect } from 'react';
import { Compass, AlertCircle, CheckCircle2 } from 'lucide-react';
import WorldMap from './components/WorldMap';
import ControlPanel from './components/ControlPanel';
import Dashboard from './components/Dashboard';

function App() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [visitedCountries, setVisitedCountries] = useState([]);
  const [countriesCatalog, setCountriesCatalog] = useState([]);
  
  // Custom tooltips and toast states
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [toasts, setToasts] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchCountriesCatalog();
  }, []);

  // Fetch visited countries when active user changes
  useEffect(() => {
    if (currentUserId) {
      fetchVisitedCountries();
    }
  }, [currentUserId]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setCurrentUserId(data.currentUserId);
        setCurrentUser(data.currentUser);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      addToast("Failed to connect to database.", "error");
    }
  };

  const fetchCountriesCatalog = async () => {
    try {
      const res = await fetch('/api/countries');
      const data = await res.json();
      if (res.ok) {
        setCountriesCatalog(data);
      }
    } catch (err) {
      console.error("Error fetching country names catalog:", err);
    }
  };

  const fetchVisitedCountries = async () => {
    try {
      const res = await fetch('/api/visited');
      const data = await res.json();
      if (res.ok) {
        setVisitedCountries(data.countries);
        setCurrentUser(data.currentUser);
      }
    } catch (err) {
      console.error("Error fetching visited countries:", err);
    }
  };

  const handleSelectUser = async (userId) => {
    try {
      const res = await fetch('/api/select-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUserId(data.currentUserId);
        setCurrentUser(data.currentUser);
        setVisitedCountries(data.countries);
        addToast(`Switched active profile to ${data.currentUser.name}!`, "success");
      }
    } catch (err) {
      console.error(err);
      addToast("Failed to switch user profiles.", "error");
    }
  };

  const handleAddUser = async (name, color) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(prev => [...prev, data.user]);
        setCurrentUserId(data.currentUserId);
        setCurrentUser(data.user);
        addToast(`Welcome to the tracker, ${data.user.name}!`, "success");
      } else {
        addToast(data.error || "Failed to create family member.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error creating family member profile.", "error");
    }
  };

  const handleAddCountry = async (countryName) => {
    try {
      const res = await fetch('/api/visited', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName })
      });
      const data = await res.json();
      if (res.ok) {
        setVisitedCountries(data.countries);
        addToast(`Added ${countryName} to your map!`, "success");
      } else {
        addToast(data.error || "Could not add country.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error communicating with server.", "error");
    }
  };

  const handleCountryClick = (code, name) => {
    if (visitedCountries.includes(code)) {
      addToast(`${name} is already in your travel journal!`, "error");
    } else {
      handleAddCountry(name);
    }
  };

  const handleHoverCountry = (name, e) => {
    if (!name) {
      setHoveredCountry(null);
      return;
    }
    // Calculate position for custom tooltip inside the relative container
    const mapBounds = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const x = e.clientX - mapBounds.left + 24; // offset slightly
    const y = e.clientY - mapBounds.top;
    
    setHoveredCountry(name);
    setTooltipPos({ x, y });
  };

  const getActiveColor = () => {
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
    return currentUser ? (colorMap[currentUser.color] || '#0d9488') : '#0d9488';
  };

  return (
    <div className="app-container">
      
      {/* App Branding Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Compass size={24} />
          </div>
          <span className="brand-logo-text">Travel Journal</span>
        </div>
      </header>

      {/* Stats Counter Row */}
      <Dashboard 
        visitedCount={visitedCountries.length}
        totalCountries={countriesCatalog.length}
        currentUserName={currentUser?.name}
        currentUserColor={currentUser?.color}
      />

      {/* Main Interactive Grid */}
      <main className="dashboard-grid">
        
        {/* World Map Box */}
        <div className="glass-card" style={{ position: 'relative', padding: '0.5rem' }}>
          <WorldMap 
            visitedCountries={visitedCountries}
            activeColor={getActiveColor()}
            onCountryClick={handleCountryClick}
            onHoverCountry={handleHoverCountry}
          />
          
          {/* Map Hover Tooltip */}
          {hoveredCountry && (
            <div 
              className="country-tooltip"
              style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
            >
              {hoveredCountry}
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <ControlPanel 
          users={users}
          currentUserId={currentUserId}
          currentUserColor={currentUser?.color}
          countriesCatalog={countriesCatalog}
          onSelectUser={handleSelectUser}
          onAddUser={handleAddUser}
          onAddCountry={handleAddCountry}
        />
      </main>

      {/* Custom Toast Alert Center */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
