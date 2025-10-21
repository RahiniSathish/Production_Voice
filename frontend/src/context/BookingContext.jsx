import React, { createContext, useContext, useState, useCallback } from "react";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingRefreshTrigger, setBookingRefreshTrigger] = useState(0);

  // Call this function after a booking is made
  const triggerBookingRefresh = useCallback(() => {
    setBookingRefreshTrigger((prev) => prev + 1);
    console.log("🔄 Booking refresh triggered");
  }, []);

  return (
    <BookingContext.Provider value={{ bookingRefreshTrigger, triggerBookingRefresh }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookingRefresh = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingRefresh must be used within BookingProvider");
  }
  return context;
};
