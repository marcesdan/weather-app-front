// WMO weather codes (Open-Meteo) to the OpenWeatherMap icon codes our icons use, with a Spanish description.
const MAP: [codes: number[], icon: string, text: string][] = [
  [[0], "01", "Despejado"],
  [[1], "02", "Mayormente despejado"],
  [[2], "03", "Parcialmente nublado"],
  [[3], "04", "Nublado"],
  [[45, 48], "50", "Niebla"],
  [[51, 53, 55, 56, 57], "09", "Llovizna"],
  [[61, 66], "10", "Lluvia ligera"],
  [[63], "10", "Lluvia"],
  [[65, 67], "10", "Lluvia intensa"],
  [[80, 81, 82], "09", "Chaparrones"],
  [[71, 77, 85], "13", "Nevada ligera"],
  [[73, 75, 86], "13", "Nevada"],
  [[95, 96, 99], "11", "Tormenta"],
];

export function wmo(code: number, day: boolean) {
  const hit = MAP.find(([codes]) => codes.includes(code)) ?? MAP[2];
  return { icon: `${hit[1]}${day ? "d" : "n"}`, text: hit[2] };
}
