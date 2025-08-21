/**
 * Car Store Slice
 * 
 * Manages car inventory and operations:
 * - Car listings and details
 * - Availability management
 * - Search and filtering
 * - CRUD operations
 */

export const createCarSlice = (set, get, api) => ({
  // Car State
  cars: getInitialCars(),
  selectedCar: null,
  carFilters: {
    searchTerm: '',
    carType: 'all',
    priceRange: 'all',
    location: 'all',
    sortBy: 'featured',
    availability: 'all'
  },
  carLoading: false,
  carError: null,

  // Car Actions
  setCars: (cars) => {
    set((state) => {
      state.cars = cars;
    });
  },

  addCar: (carData) => {
    const newCar = {
      id: Date.now(),
      ...carData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalBookings: 0,
      revenue: 0
    };

    set((state) => {
      state.cars.push(newCar);
    });

    return newCar;
  },

  updateCar: (carId, updates) => {
    set((state) => {
      const carIndex = state.cars.findIndex(car => car.id === carId);
      if (carIndex !== -1) {
        Object.assign(state.cars[carIndex], {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }
    });
  },

  deleteCar: (carId) => {
    set((state) => {
      state.cars = state.cars.filter(car => car.id !== carId);
      if (state.selectedCar?.id === carId) {
        state.selectedCar = null;
      }
    });
  },

  selectCar: (carId) => {
    const state = get();
    const car = state.cars.find(car => car.id === carId);
    
    set((draft) => {
      draft.selectedCar = car || null;
    });
  },

  setCarAvailability: (carId, available) => {
    set((state) => {
      const car = state.cars.find(car => car.id === carId);
      if (car) {
        car.available = available;
        car.updatedAt = new Date().toISOString();
      }
    });
  },

  updateCarFilters: (newFilters) => {
    set((state) => {
      Object.assign(state.carFilters, newFilters);
    });
  },

  resetCarFilters: () => {
    set((state) => {
      state.carFilters = {
        searchTerm: '',
        carType: 'all',
        priceRange: 'all',
        location: 'all',
        sortBy: 'featured',
        availability: 'all'
      };
    });
  },

  getFilteredCars: () => {
    const state = get();
    const { cars, carFilters } = state;

    let filtered = [...cars];

    // Search term filter
    if (carFilters.searchTerm) {
      const searchLower = carFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(car => 
        car.name.toLowerCase().includes(searchLower) ||
        car.brand.toLowerCase().includes(searchLower) ||
        car.location.toLowerCase().includes(searchLower)
      );
    }

    // Car type filter
    if (carFilters.carType !== 'all') {
      filtered = filtered.filter(car => car.type === carFilters.carType);
    }

    // Price range filter
    if (carFilters.priceRange !== 'all') {
      const priceRanges = {
        budget: [0, 50],
        mid: [50, 100],
        premium: [100, Infinity]
      };
      const [min, max] = priceRanges[carFilters.priceRange] || [0, Infinity];
      filtered = filtered.filter(car => car.price >= min && car.price < max);
    }

    // Location filter
    if (carFilters.location !== 'all') {
      filtered = filtered.filter(car => car.location === carFilters.location);
    }

    // Availability filter
    if (carFilters.availability !== 'all') {
      const showAvailable = carFilters.availability === 'available';
      filtered = filtered.filter(car => car.available === showAvailable);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (carFilters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'popular':
          return b.totalBookings - a.totalBookings;
        default: // featured
          return (b.instantBook ? 1 : 0) - (a.instantBook ? 1 : 0);
      }
    });

    return filtered;
  },

  getCarsByHost: (hostId) => {
    const state = get();
    return state.cars.filter(car => car.hostId === hostId);
  },

  getCarStats: () => {
    const state = get();
    const { cars } = state;

    return {
      total: cars.length,
      available: cars.filter(car => car.available).length,
      rented: cars.filter(car => !car.available).length,
      byType: cars.reduce((acc, car) => {
        acc[car.type] = (acc[car.type] || 0) + 1;
        return acc;
      }, {}),
      totalRevenue: cars.reduce((sum, car) => sum + (car.revenue || 0), 0),
      averagePrice: cars.length > 0 
        ? cars.reduce((sum, car) => sum + car.price, 0) / cars.length 
        : 0,
      averageRating: cars.length > 0
        ? cars.reduce((sum, car) => sum + car.rating, 0) / cars.length
        : 0
    };
  },

  searchCars: async (query) => {
    set((state) => {
      state.carLoading = true;
      state.carError = null;
    });

    try {
      // Simulate API search delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const state = get();
      const results = state.cars.filter(car =>
        car.name.toLowerCase().includes(query.toLowerCase()) ||
        car.brand.toLowerCase().includes(query.toLowerCase()) ||
        car.location.toLowerCase().includes(query.toLowerCase()) ||
        car.features.some(feature => 
          feature.toLowerCase().includes(query.toLowerCase())
        )
      );

      set((state) => {
        state.carLoading = false;
      });

      return results;

    } catch (error) {
      set((state) => {
        state.carLoading = false;
        state.carError = error.message;
      });
      return [];
    }
  }
});

/**
 * Initial car data for demonstration
 */
function getInitialCars() {
  return [
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
      hostId: 'hoster_1',
      hostName: 'Sarah M.',
      hostRating: 4.8,
      fuel: 'Gasoline',
      seats: 5,
      transmission: 'Automatic',
      totalBookings: 89,
      revenue: 7565,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2025-08-22T02:00:00Z'
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
      hostId: 'hoster_2',
      hostName: 'Mike W.',
      hostRating: 4.9,
      fuel: 'Electric',
      seats: 5,
      transmission: 'Automatic',
      totalBookings: 67,
      revenue: 6365,
      createdAt: '2024-02-10T14:30:00Z',
      updatedAt: '2025-08-21T18:15:00Z'
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
      hostId: 'hoster_3',
      hostName: 'Emily D.',
      hostRating: 4.7,
      fuel: 'Gasoline',
      seats: 5,
      transmission: 'Manual',
      totalBookings: 134,
      revenue: 6030,
      createdAt: '2024-01-20T09:15:00Z',
      updatedAt: '2025-08-20T12:45:00Z'
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
      hostId: 'hoster_4',
      hostName: 'David L.',
      hostRating: 5.0,
      fuel: 'Gasoline',
      seats: 4,
      transmission: 'Automatic',
      totalBookings: 45,
      revenue: 5400,
      createdAt: '2024-03-05T16:20:00Z',
      updatedAt: '2025-08-19T09:30:00Z'
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
      image: '🚘',
      features: ['Great MPG', 'Reliable', 'AC', 'Bluetooth'],
      available: true,
      instantBook: true,
      hostId: 'hoster_1',
      hostName: 'Lisa K.',
      hostRating: 4.6,
      fuel: 'Gasoline',
      seats: 5,
      transmission: 'Automatic',
      totalBookings: 178,
      revenue: 6230,
      createdAt: '2024-01-10T11:45:00Z',
      updatedAt: '2025-08-18T15:20:00Z'
    }
  ];
}
