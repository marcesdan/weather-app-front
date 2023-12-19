export async function fetchLocationDetails(lang = navigator.language) {
  const response = await fetch(`${import.meta.env.IP_API_URL}?lang=${lang}`);
  return await response.json();
}
