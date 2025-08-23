import React, { useState, useMemo } from 'react';

// ✅ MOVED OUTSIDE COMPONENT: Stable reference, no re-creation on renders
const MOCK_CAR_DATA = [
  {
    id: 1,
    name: 'BMW X3 2023',
    brand: 'BMW',
    type: 'suv',
    price: 85,
    rating: 4.9,
    reviews: 127,
    location: 'downtown',
    image: '🚙',
    features: ['GPS', 'Bluetooth', 'AC', 'Automatic'],
    available: true,
    instantBook: true,
    host: 'Sarah M.',
    hostRating: 4.8,
    fuel: 'Gasoline',
    seats: 5,
    transmission: 'Automatic'
  },
  {
    id: 2,
    name: 'Tesla Model 3 2023',
    brand: 'Tesla',
    type: 'electric',
    price: 95,
    rating: 4.8,
    reviews: 89,
    location: 'city-center',
    image: '⚡',
    features: ['Autopilot', 'Supercharger', 'Premium Audio', 'Glass Roof'],
    available: true,
    instantBook: false,
    host: 'Mike W.',
    hostRating: 4.9,
    fuel: 'Electric',
    seats: 5,
    transmission: 'Automatic'
  },
  {
    id: 3,
    name: 'Honda Civic 2022',
    brand: 'Honda',
    type: 'compact',
    price: 45,
    rating: 4.6,
    reviews: 203,
    location: 'airport',
    image: '🚗',
    features: ['Fuel Efficient', 'Backup Camera', 'Android Auto', 'AC'],
    available: true,
    instantBook: true,
    host: 'Emily D.',
    hostRating: 4.7,
    fuel: 'Gasoline',
    seats: 5,
    transmission: 'Manual'
  },
  {
    id: 4,
    name: 'Mercedes C-Class 2023',
    brand: 'Mercedes',
    type: 'luxury',
    price: 120,
    rating: 4.9,
    reviews: 67,
    location: 'downtown',
    image: '🏎️',
    features: ['Leather Seats', 'Premium Sound', 'Navigation', 'Heated Seats'],
    available: false,
    instantBook: false,
    host: 'David L.',
    hostRating: 5.0,
    fuel: 'Gasoline',
    seats: 4,
    transmission: 'Automatic'
  },
  {
    id: 5,
    name: 'Toyota Corolla 2022',
    brand: 'Toyota',
    type: 'economy',
    price: 35,
    rating: 4.5,
    reviews: 156,
    location: 'suburbs',
    image: '🚕',
    features: ['Great MPG', 'Reliable', 'AC', 'Bluetooth'],
    available: true,
    instantBook: true,
    host: 'Lisa K.',
    hostRating: 4.6,
    fuel: 'Gasoline',
    seats: 5,
    transmission: 'Automatic'
  },
  {
    id: 6,
    name: 'Audi Q5 2023',
    brand: 'Audi',
    type: 'suv',
    price: 110,
    rating: 4.8,
    reviews: 94,
    location: 'city-center',
    image: '🚙',
    features: ['Quattro AWD', 'Virtual Cockpit', 'Premium Plus', 'Sunroof'],
    available: true,
    instantBook: false,
    host: 'James R.',
    hostRating: 4.8,
    fuel: 'Gasoline',
    seats: 5,
    transmission: 'Automatic'
  },
  {
    id: 7,
    name: 'Ford Mustang 2023',
    brand: 'Ford',
    type: 'luxury',
    price: 90,
    rating: 4.7,
    reviews: 78,
    location: 'downtown',
    image: '🏎️',
    features: ['V8 Engine', 'Sport Mode', 'Premium Audio', 'Racing Stripes'],
    available: true,
    instantBook: true,
    host: 'Alex T.',
    hostRating: 4.9,
    fuel: 'Gasoline',
    seats: 4,
    transmission: 'Manual'
  },
  {
    id: 8,
    name: 'Nissan Leaf 2022',
    brand: 'Nissan',
    type: 'electric',
    price: 55,
    rating: 4.4,
    reviews: 112,
    location: 'airport',
    image: '⚡',
    features: ['Zero Emissions', 'Fast Charging', 'Eco Mode', 'Smart Key'],
    available: true,
    instantBook: true,
    host: 'Maria S.',
    hostRating: 4.5,
    fuel: 'Electric',
    seats: 5,
    transmission: 'Automatic'
  }
];

const CarGrid = ({ filters, onBookCar }) => {
  const [viewMode, setViewMode] = useState('grid');

  // ✅ FIXED: Only depends on filters (stable dependency)
  const filteredCars = useMemo(() => {
    let filtered = MOCK_CAR_DATA.filter(car => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (!car.name.toLowerCase().includes(searchLower) && 
            !car.brand.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Car type filter
      if (filters.carType !== 'all' && car.type !== filters.carType) {
        return false;
      }

      // Price range filter
      if (filters.priceRange !== 'all') {
        switch (filters.priceRange) {
          case 'budget':
            if (car.price < 25 || car.price > 50) return false;
            break;
          case 'mid':
            if (car.price < 50 || car.price > 100) return false;
            break;
          case 'premium':
            if (car.price < 100) return false;
            break;
        }
      }

      // Location filter
      if (filters.location !== 'all' && car.location !== filters.location) {
        return false;
      }

      return true;
    });

    // Sort cars
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default: // featured
        filtered.sort((a, b) => (b.instantBook ? 1 : 0) - (a.instantBook ? 1 : 0));
    }

    return filtered;
  }, [filters]); // ✅ Only depends on filters

  const formatLocation = (location) => {
    return location.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <section className="car-grid-section">
      <div className="section-header">
        <div className="results-info">
          <h2>Available Cars</h2>
          <p>{filteredCars.length} cars available</p>
        </div>
        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            📄
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            📄
          </button>
        </div>
      </div>

      {filteredCars.length === 0 ? (
        <div className="no-results">
          <div className="no-results-content">
            <span className="no-results-icon">🚗</span>
            <h3>No cars found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        </div>
      ) : (
        <div className={`cars-container ${viewMode}-view`}>
          {filteredCars.map(car => (
            <div key={car.id} className={`car-card ${!car.available ? 'unavailable' : ''}`}>
              {/* Car Image/Icon */}
              <div className="car-image-section">
                <div className="car-image">
                  <span className="car-emoji">{car.image}</span>
                  {car.instantBook && <span className="instant-book-badge">⚡ Instant</span>}
                  {!car.available && <span className="unavailable-badge">Unavailable</span>}
                </div>
              </div>

              {/* Car Details */}
              <div className="car-details">
                <div className="car-header">
                  <h3 className="car-name">{car.name}</h3>
                  <div className="car-rating">
                    <span className="rating-stars">⭐ {car.rating}</span>
                    <span className="rating-count">({car.reviews})</span>
                  </div>
                </div>

                <div className="car-info">
                  <div className="info-row">
                    <span className="info-item">
                      <span className="info-icon">📍</span>
                      {formatLocation(car.location)}
                    </span>
                    <span className="info-item">
                      <span className="info-icon">👥</span>
                      {car.seats} seats
                    </span>
                    <span className="info-item">
                      <span className="info-icon">⚙️</span>
                      {car.transmission}
                    </span>
                  </div>
                </div>

                <div className="car-features">
                  {car.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                  {car.features.length > 3 && (
                    <span className="feature-tag more">+{car.features.length - 3} more</span>
                  )}
                </div>

                <div className="host-info">
                  <span className="host-text">Host: {car.host}</span>
                  <span className="host-rating">⭐ {car.hostRating}</span>
                </div>
              </div>

              {/* Pricing and Action */}
              <div className="car-footer">
                <div className="price-section">
                  <span className="price">${car.price}</span>
                  <span className="price-unit">/day</span>
                </div>
                <button 
                  className={`book-btn ${!car.available ? 'disabled' : ''}`}
                  onClick={() => car.available && onBookCar(car)}
                  disabled={!car.available}
                >
                  {car.available ? (car.instantBook ? 'Book Now' : 'Request') : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More if needed for pagination */}
      {filteredCars.length > 0 && (
        <div className="load-more-section">
          <button className="load-more-btn">Load More Cars</button>
        </div>
      )}
    </section>
  );
};

export default CarGrid;