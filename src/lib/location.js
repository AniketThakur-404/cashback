export const captureClientLocation = (options = {}) => {
  if (typeof window === "undefined" || !window.navigator?.geolocation) {
    return Promise.resolve({});
  }

  const settings = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  };

  return new Promise((resolve) => {
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: Number(position.coords?.latitude),
          lng: Number(position.coords?.longitude),
          accuracyMeters: Number(position.coords?.accuracy || 0),
          capturedAt: new Date().toISOString(),
        });
      },
      (error) => {
        let message = "Location access denied";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Please enable it in browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        reject(new Error(message));
      },
      settings,
    );
  });
};
