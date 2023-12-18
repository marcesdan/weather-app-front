export type GeolocationResult = { latitude: number; longitude: number } | null

export default async function getGeolocation(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser")
      resolve(null)
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.log("Error getting geolocation", error)
          resolve(null)
        },
        {
          enableHighAccuracy: true, // Timeout of 5 seconds
          maximumAge: 7200000,
        },
      )
    }
  })
}
