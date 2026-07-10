import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Users, Check, X } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'teal', value: '#0d9488' },
  { name: 'blue', value: '#2563eb' },
  { name: 'violet', value: '#7c3aed' },
  { name: 'purple', value: '#9333ea' },
  { name: 'pink', value: '#db2777' },
  { name: 'red', value: '#dc2626' },
  { name: 'orange', value: '#ea580c' },
  { name: 'yellow', value: '#ca8a04' },
  { name: 'green', value: '#16a34a' },
  { name: 'indigo', value: '#4f46e5' }
];

const ControlPanel = ({ 
  users, 
  currentUserId, 
  currentUserColor, 
  countriesCatalog, 
  onSelectUser, 
  onAddUser, 
  onAddCountry 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserColor, setNewUserColor] = useState('teal');
  
  // Autocomplete search states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  
  const dropdownRef = useRef(null);

  // Close suggestion list on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter country suggestions when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = countriesCatalog
      .filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5); // Max 5 suggestions
    setSuggestions(filtered);
    setSelectedSuggestionIndex(-1);
  }, [searchQuery, countriesCatalog]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let finalCountry = searchQuery.trim();
    
    // If a suggestion was highlighted via keyboard, use it
    if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
      finalCountry = suggestions[selectedSuggestionIndex];
    }
    
    if (finalCountry) {
      onAddCountry(finalCountry);
      setSearchQuery('');
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isFocused || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      setSearchQuery(suggestions[selectedSuggestionIndex]);
      setIsFocused(false);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    onAddUser(newUserName, newUserColor);
    setNewUserName('');
    setNewUserColor('teal');
    setIsModalOpen(false);
  };

  // Helper to extract hex value for selected user styling
  const getColorHex = (colorName) => {
    const match = PRESET_COLORS.find(c => c.name === colorName);
    return match ? match.value : '#0d9488';
  };

  return (
    <div className="control-sidebar">
      
      {/* User Switcher Card */}
      <div className="glass-card">
        <h3 className="user-section-title">Family Members</h3>
        <div className="user-switcher">
          {users.map(user => {
            const isActive = user.id === currentUserId;
            const colorHex = getColorHex(user.color);
            return (
              <div 
                key={user.id}
                className={`user-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSelectUser(user.id)}
                style={isActive ? { 
                  '--active-user-color': colorHex,
                  '--active-user-glow': `${colorHex}44`
                } : {}}
              >
                <div className="user-avatar" style={{ backgroundColor: colorHex }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name-label">{user.name}</span>
              </div>
            );
          })}
          
          <button 
            className="add-member-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Add Visited Country Form */}
      <div className="glass-card">
        <h3 className="user-section-title" style={{ marginBottom: '1rem' }}>Add Country</h3>
        <form 
          className="search-form" 
          onSubmit={handleSearchSubmit}
          style={{ 
            '--active-user-color': getColorHex(currentUserColor),
            '--active-user-glow': `${getColorHex(currentUserColor)}44`
          }}
        >
          <div className="input-wrapper" ref={dropdownRef}>
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Enter visited country..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
            />
            
            {/* Auto-complete suggestions */}
            {isFocused && suggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {suggestions.map((country, idx) => (
                  <div
                    key={country}
                    className={`suggestion-item ${idx === selectedSuggestionIndex ? 'selected' : ''}`}
                    onClick={() => {
                      setSearchQuery(country);
                      setIsFocused(false);
                      onAddCountry(country);
                      setSearchQuery('');
                    }}
                  >
                    {country}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="submit-btn">
            <Plus size={18} />
            <span>Mark Visited</span>
          </button>
        </form>
      </div>

      {/* Add Family Member Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3 className="modal-title">Add Family Member</h3>
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter name"
                  className="form-input"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Choose Theme Color</label>
                <div className="color-picker-grid">
                  {PRESET_COLORS.map(c => (
                    <div
                      key={c.name}
                      className={`color-option ${newUserColor === c.name ? 'selected' : ''}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => setNewUserColor(c.name)}
                    >
                      {newUserColor === c.name && <Check size={18} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="modal-btn cancel"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewUserName('');
                    setNewUserColor('teal');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn confirm">
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
