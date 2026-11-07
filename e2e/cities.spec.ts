import { AT_SEA, expect, mockNetwork, test } from "./fixtures";

test.use({ geolocation: AT_SEA, permissions: ["geolocation"] });

test("nearby towns are offered first; search, add, rename and remove a city", { tag: "@smoke" }, async ({ page }) => {
  await mockNetwork(page, { reverse: [{ name: "General Pueyrredón", lat: -38.3, lon: -57.0, country: "AR", state: "Buenos Aires" }] });
  await page.goto("/ciudades");

  const nearby = page.getByTestId("nearby");
  await expect(nearby.getByRole("listitem")).toHaveCount(3);
  await expect(nearby.getByRole("listitem").first()).toContainText("Mar del Plata"); // biggest first
  await nearby.getByRole("button", { name: "Agregar Miramar" }).click();

  await page.getByLabel("Buscar una ciudad").fill("Mar del Plata");
  const results = page.getByTestId("search-results");
  await expect(results.getByRole("listitem")).toHaveCount(1);
  await results.getByRole("button", { name: "Agregar Mar del Plata" }).click();
  await expect(results.getByRole("button", { name: "Agregar Mar del Plata" })).toBeDisabled();

  const saved = page.getByTestId("saved");
  await expect(saved.getByRole("listitem")).toHaveCount(2);
  await saved.getByRole("button", { name: "Renombrar Miramar" }).click();
  await saved.getByLabel("Nombre del lugar").fill("Playa Miramar");
  await saved.getByRole("button", { name: "Guardar nombre" }).click();
  await expect(saved).toContainText("Playa Miramar");

  // Saved places show on home with their own weather and the gale alert from the forecast.
  await page.goto("/");
  const cards = page.getByTestId("place-card");
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toContainText("Playa Miramar");
  await expect(cards.first()).toContainText(/\d+°/);
  await expect(cards.first().getByTestId("place-alert")).toHaveText("Ráfagas de temporal");

  await page.goto("/ciudades");
  await saved.getByRole("button", { name: "Quitar Mar del Plata" }).click();
  await expect(saved.getByRole("listitem")).toHaveCount(1);
});

test("an unknown city says so", async ({ page }) => {
  await mockNetwork(page);
  await page.goto("/ciudades");
  await page.getByLabel("Buscar una ciudad").fill("Zzzzz");
  await expect(page.getByText("No encontramos esa ciudad")).toBeVisible();
});
