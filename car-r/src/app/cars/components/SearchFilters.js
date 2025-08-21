import React from 'react';

const SearchFilters = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <section className="search-filters-section">
      <div className="filters-container">
        <div className="main-search">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by car name, brand, or model..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="main-search-input"
            />
            <button className="search-btn">
              <span>🔍</span>
              Search
            </button>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="carType">Car Type</label>
            <select
              id="carType"
              value={filters.carType}
              onChange={(e) => handleFilterChange('carType', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="economy">Economy</option>
              <option value="compact">Compact</option>
              <option value="suv">SUV</option>
              <option value="luxury">Luxury</option>
              <option value="electric">Electric</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priceRange">Price Range</label>
            <select
              id="priceRange"
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="filter-select"
            >
              <option value="all">Any Price</option>
              <option value="budget">$25-50/day</option>
              <option value="mid">$50-100/day</option>
              <option value="premium">$100+/day</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Locations</option>
              <option value="downtown">Downtown</option>
              <option value="airport">Airport</option>
              <option value="city-center">City Center</option>
              <option value="suburbs">Suburbs</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sortBy">Sort By</label>
            <select
              id="sortBy"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <div className="active-filters">
          {filters.searchTerm && (
            <span className="filter-tag">
              {/* Fixed: Use proper JSX syntax for quotes */}
              Search: &quot;{filters.searchTerm}&quot;
              <button onClick={() => handleFilterChange('searchTerm', '')}>×</button>
            </span>
          )}
          {filters.carType !== 'all' && (
            <span className="filter-tag">
              Type: {filters.carType}
              <button onClick={() => handleFilterChange('carType', 'all')}>×</button>
            </span>
          )}
          {filters.priceRange !== 'all' && (
            <span className="filter-tag">
              Price: {filters.priceRange}
              <button onClick={() => handleFilterChange('priceRange', 'all')}>×</button>
            </span>
          )}
          {filters.location !== 'all' && (
            <span className="filter-tag">
              Location: {filters.location}
              <button onClick={() => handleFilterChange('location', 'all')}>×</button>
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
