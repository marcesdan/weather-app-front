export async function fetchWeatherInOneCall(lat: string, lng: string) {
  const response = await fetch(`${import.meta.env.WEATHER_API_URL}?lat=${lat}`)
  return await response.json()
}
