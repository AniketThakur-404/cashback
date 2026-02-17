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
      () => {
        resolve({});
      },
      settings,
    );
  });
};
