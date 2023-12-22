export type GeolocationFromNavigator = { lat: number; lon: number } | null;

export default async function getGeolocation(): Promise<GeolocationFromNavigator> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
      resolve(null);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Error getting geolocation", error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 7200000,
        }
      );
    }
  });
}
