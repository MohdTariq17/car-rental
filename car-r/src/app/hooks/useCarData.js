'use client';
import { useCallback, useMemo } from 'react';
import { useCarStore } from './useStore.js';

/**
 * Specialized hook for car data operations
 * 
 * Provides car-specific functionality with computed values,
 * optimized filtering, and business logic
 */

export const useCarData = () => {
  const carStore = useCarStore();

  // Computed values
 const filteredCars = useMemo(() => {
  return carStore.getFilteredCars();
}, [carStore.cars, carStore.carFilters, carStore]); // Added carStore

  const carStats = useMemo(() => {
  return carStore.getCarStats();
}, [carStore.cars, carStore]); // Added carStore

  const availableCars = useMemo(() => {
    return carStore.cars.filter(car => car.available);
  }, [carStore.cars]);

  const carsByLocation = useMemo(() => {
    return carStore.cars.reduce((acc, car) => {
      if (!acc[car.location]) {
        acc[car.location] = [];
      }
      acc[car.location].push(car);
      return acc;
    }, {});
  }, [carStore.cars]);

  const carsByType = useMemo(() => {
    return carStore.cars.reduce((acc, car) => {
      if (!acc[car.type]) {
        acc[car.type] = [];
      }
      acc[car.type].push(car);
      return acc;
    }, {});
  }, [carStore.cars]);

  const priceRanges = useMemo(() => {
    const prices = carStore.cars.map(car => car.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length
    };
  }, [carStore.cars]);

  // Advanced search with multiple criteria
  const searchCarsAdvanced = useCallback(async (criteria) => {
    const {
      query = '',
      minPrice = 0,
      maxPrice = Infinity,
      location = '',
      carType = '',
      features = [],
      availableOnly = false,
      instantBookOnly = false
    } = criteria;

    let results = [...carStore.cars];

    // Text search
    if (query) {
      const searchLower = query.toLowerCase();
      results = results.filter(car =>
        car.name.toLowerCase().includes(searchLower) ||
        car.brand.toLowerCase().includes(searchLower) ||
        car.location.toLowerCase().includes(searchLower) ||
        car.features.some(feature => 
          feature.toLowerCase().includes(searchLower)
        )
      );
    }

    // Price range
    results = results.filter(car => 
      car.price >= minPrice && car.price <= maxPrice
    );

    // Location
    if (location) {
      results = results.filter(car => car.location === location);
    }

    // Car type
    if (carType) {
      results = results.filter(car => car.type === carType);
    }

    // Features
    if (features.length > 0) {
      results = results.filter(car =>
        features.every(feature =>
          car.features.some(carFeature =>
            carFeature.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    // Availability
    if (availableOnly) {
      results = results.filter(car => car.available);
    }

    // Instant book
    if (instantBookOnly) {
      results = results.filter(car => car.instantBook);
    }

    return results;
  }, [carStore.cars]);

  // Get recommendations based on user preferences
  const getRecommendations = useCallback((userPreferences = {}) => {
    const {
      preferredType = null,
      maxPrice = null,
      preferredLocation = null,
      pastBookings = []
    } = userPreferences;

    let cars = availableCars;

    // Filter by preferences
    if (preferredType) {
      cars = cars.filter(car => car.type === preferredType);
    }

    if (maxPrice) {
      cars = cars.filter(car => car.price <= maxPrice);
    }

    if (preferredLocation) {
      cars = cars.filter(car => car.location === preferredLocation);
    }

    // Sort by rating and popularity
    cars.sort((a, b) => {
      // Prioritize high-rated cars
      const ratingDiff = b.rating - a.rating;
      if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
      
      // Then by total bookings (popularity)
      return (b.totalBookings || 0) - (a.totalBookings || 0);
    });

    return cars.slice(0, 6); // Return top 6 recommendations
  }, [availableCars]);

  // Get similar cars based on a reference car
  const getSimilarCars = useCallback((carId, limit = 4) => {
    const referenceCar = carStore.cars.find(car => car.id === carId);
    if (!referenceCar) return [];

    return carStore.cars
      .filter(car => 
        car.id !== carId && 
        car.available &&
        (car.type === referenceCar.type || 
         car.brand === referenceCar.brand ||
         Math.abs(car.price - referenceCar.price) <= 20)
      )
      .sort((a, b) => {
        // Score similarity
        let scoreA = 0, scoreB = 0;
        
        // Same type gets higher score
        if (a.type === referenceCar.type) scoreA += 3;
        if (b.type === referenceCar.type) scoreB += 3;
        
        // Same brand gets points
        if (a.brand === referenceCar.brand) scoreA += 2;
        if (b.brand === referenceCar.brand) scoreB += 2;
        
        // Similar price gets points
        const priceDiffA = Math.abs(a.price - referenceCar.price);
        const priceDiffB = Math.abs(b.price - referenceCar.price);
        if (priceDiffA < priceDiffB) scoreA += 1;
        if (priceDiffB < priceDiffA) scoreB += 1;
        
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }, [carStore.cars]);

  // Check car availability for specific dates
  const checkAvailability = useCallback((carId, startDate, endDate) => {
    // This would typically check against booking data
    // For now, we'll use the car's available status
    const car = carStore.cars.find(car => car.id === carId);
    return car ? car.available : false;
  }, [carStore.cars]);

  // Get popular cars (most booked)
  const getPopularCars = useCallback((limit = 8) => {
    return [...carStore.cars]
      .sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0))
      .slice(0, limit);
  }, [carStore.cars]);

  // Get featured cars (instant book + high rating)
  const getFeaturedCars = useCallback((limit = 6) => {
    return carStore.cars
      .filter(car => car.available && car.instantBook && car.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }, [carStore.cars]);

  // Get cars by price range
  const getCarsByPriceRange = useCallback((min, max) => {
    return carStore.cars.filter(car => 
      car.price >= min && car.price <= max && car.available
    );
  }, [carStore.cars]);

  // Advanced filtering with real-time updates
  const setAdvancedFilters = useCallback((filters) => {
  carStore.updateCarFilters(filters);
}, [carStore.updateCarFilters, carStore]); // Added carStore

  // Reset all filters
  const clearAllFilters = useCallback(() => {
  carStore.resetCarFilters();
}, [carStore.resetCarFilters, carStore]); // Added carStore

  return {
    // Data
    cars: carStore.cars,
    filteredCars,
    availableCars,
    selectedCar: carStore.selectedCar,
    carStats,
    carsByLocation,
    carsByType,
    priceRanges,
    
    // Filters
    filters: carStore.carFilters,
    updateFilters: carStore.updateCarFilters,
    resetFilters: carStore.resetCarFilters,
    setAdvancedFilters,
    clearAllFilters,
    
    // CRUD Operations
    addCar: carStore.addCar,
    updateCar: carStore.updateCar,
    deleteCar: carStore.deleteCar,
    selectCar: carStore.selectCar,
    setAvailability: carStore.setCarAvailability,
    
    // Search & Discovery
    searchCars: carStore.searchCars,
    searchCarsAdvanced,
    getRecommendations,
    getSimilarCars,
    getPopularCars,
    getFeaturedCars,
    getCarsByPriceRange,
    checkAvailability,
    
    // Host-specific
    getCarsByHost: carStore.getCarsByHost,
    
    // Loading states
    loading: carStore.carLoading,
    error: carStore.carError
  };
};
