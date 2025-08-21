import React, { useState } from 'react';

const BookingModal = ({ car, onConfirm, onClose }) => {
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupTime: '10:00',
    returnTime: '10:00',
    pickupLocation: car.location,
    additionalRequests: ''
  });

  const [step, setStep] = useState(1); // 1: Dates, 2: Details, 3: Confirmation
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price when dates change
  React.useEffect(() => {
    if (bookingData.pickupDate && bookingData.returnDate) {
      const startDate = new Date(bookingData.pickupDate);
      const endDate = new Date(bookingData.returnDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      setTotalPrice(days * car.price);
    }
  }, [bookingData.pickupDate, bookingData.returnDate, car.price]);

  const handleInputChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = () => {
    onConfirm({
      car: car,
      ...bookingData,
      totalPrice: totalPrice
    });
  };

  const formatLocation = (location) => {
    return location.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getDaysCount = () => {
    if (bookingData.pickupDate && bookingData.returnDate) {
      const startDate = new Date(bookingData.pickupDate);
      const endDate = new Date(bookingData.returnDate);
      return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  return (
    <div className="booking-modal-overlay">
      <div className="booking-modal">
        <div className="modal-header">
          <h2>Book {car.name}</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        {/* Progress Indicator */}
        <div className="booking-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <label>Dates</label>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <label>Details</label>
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <label>Confirm</label>
          </div>
        </div>

        <div className="modal-content">
          {/* Car Summary */}
          <div className="car-summary">
            <div className="car-summary-image">{car.image}</div>
            <div className="car-summary-info">
              <h3>{car.name}</h3>
              <div className="car-summary-details">
                <span>⭐ {car.rating} ({car.reviews} reviews)</span>
                <span>📍 {formatLocation(car.location)}</span>
                <span>${car.price}/day</span>
              </div>
            </div>
          </div>

          {/* Step 1: Date Selection */}
          {step === 1 && (
            <div className="booking-step">
              <h3>Select Your Dates</h3>
              <div className="date-selection">
                <div className="date-group">
                  <label htmlFor="pickupDate">Pickup Date</label>
                  <input
                    type="date"
                    id="pickupDate"
                    value={bookingData.pickupDate}
                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="date-input"
                  />
                  <input
                    type="time"
                    value={bookingData.pickupTime}
                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    className="time-input"
                  />
                </div>
                <div className="date-group">
                  <label htmlFor="returnDate">Return Date</label>
                  <input
                    type="date"
                    id="returnDate"
                    value={bookingData.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    min={bookingData.pickupDate}
                    className="date-input"
                  />
                  <input
                    type="time"
                    value={bookingData.returnTime}
                    onChange={(e) => handleInputChange('returnTime', e.target.value)}
                    className="time-input"
                  />
                </div>
              </div>
              {getDaysCount() > 0 && (
                <div className="price-preview">
                  <p>{getDaysCount()} days × ${car.price}/day = <strong>${totalPrice}</strong></p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="booking-step">
              <h3>Booking Details</h3>
              <div className="booking-details-form">
                <div className="form-group">
                  <label htmlFor="pickupLocation">Pickup Location</label>
                  <select
                    id="pickupLocation"
                    value={bookingData.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    className="form-select"
                  >
                    <option value={car.location}>{formatLocation(car.location)} (Default)</option>
                    <option value="downtown">Downtown</option>
                    <option value="airport">Airport</option>
                    <option value="city-center">City Center</option>
                    <option value="suburbs">Suburbs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="additionalRequests">Additional Requests (Optional)</label>
                  <textarea
                    id="additionalRequests"
                    value={bookingData.additionalRequests}
                    onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
                    placeholder="Any special requests or notes for the host..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="booking-step">
              <h3>Confirm Your Booking</h3>
              <div className="booking-summary">
                <div className="summary-row">
                  <span>Pickup:</span>
                  <span>{bookingData.pickupDate} at {bookingData.pickupTime}</span>
                </div>
                <div className="summary-row">
                  <span>Return:</span>
                  <span>{bookingData.returnDate} at {bookingData.returnTime}</span>
                </div>
                <div className="summary-row">
                  <span>Duration:</span>
                  <span>{getDaysCount()} days</span>
                </div>
                <div className="summary-row">
                  <span>Location:</span>
                  <span>{formatLocation(bookingData.pickupLocation)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Price:</span>
                  <span><strong>${totalPrice}</strong></span>
                </div>
                {bookingData.additionalRequests && (
                  <div className="summary-notes">
                    <strong>Notes:</strong> {bookingData.additionalRequests}
                  </div>
                )}
              </div>
              
              <div className="booking-terms">
                <p><small>By confirming, you agree to our terms of service and cancellation policy.</small></p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-buttons">
            {step > 1 && (
              <button className="btn-secondary" onClick={handlePrevStep}>
                ← Back
              </button>
            )}
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            {step < 3 ? (
              <button 
                className="btn-primary" 
                onClick={handleNextStep}
                disabled={
                  (step === 1 && (!bookingData.pickupDate || !bookingData.returnDate)) ||
                  (step === 2 && !bookingData.pickupLocation)
                }
              >
                Next →
              </button>
            ) : (
              <button className="btn-confirm" onClick={handleConfirm}>
                🎉 Confirm Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
