import { AT_SEA, expect, mockNetwork, ONECALL, screen, test } from "./fixtures";

test.describe("with GPS at sea", () => {
  test.use({ geolocation: AT_SEA, permissions: ["geolocation"] });

  test("home shows the spot, the weather now and the next hours", { tag: "@smoke" }, async ({ page, errors }) => {
    await mockNetwork(page);
    await page.goto("/");
    // No reverse geocoding result at sea: a coordinate-less name, not a crash.
    await expect(page.getByTestId("here-name")).toHaveText("Tu ubicación");
    await expect(page.getByTestId("current-temp")).toHaveText(/^-?\d+°$/);
    // offset 0 (London) used to show an endless skeleton in v1; the date must render.
    await expect(page.getByRole("heading", { level: 1 }).locator("..").getByText(/^\S+, \d+ de /)).toBeVisible();
    const hours = page.getByRole("list", { name: "Próximas horas" }).getByRole("listitem");
    await expect(hours).toHaveCount(24);
    await expect(hours.first()).toContainText("60%"); // v1 floored pop and always showed 0%
    // No minute nowcast here (empty, like Argentina): Open-Meteo's 15-minute steps fill in.
    await expect(page.getByTestId("rain-soon")).toContainText(/Llueve en \d+ min/);
    // Air quality is one more fact; the details open on tap.
    const air = page.getByTestId("air");
    await expect(air).toContainText("Aceptable");
    await air.click();
    const detail = page.getByTestId("air-detail");
    await expect(detail).toContainText("PM2.5 8 µg/m³");
    await expect(detail).toContainText(/Mala desde las \d+ h/);
    expect(errors).toEqual([]);
  });

  test("next days lists seven days with min and max", async ({ page }) => {
    await mockNetwork(page);
    await page.goto("/");
    await page.getByRole("link", { name: /Próximos 7 días/ }).click();
    await expect(page).toHaveURL(/\/dias$/);
    await expect(page.getByTestId("days").getByRole("listitem")).toHaveCount(7);
  });
});

test.describe("without GPS", () => {
  test.use({ permissions: [] });

  test("falls back to the IP location", async ({ page, context }) => {
    await context.clearPermissions();
    await page.addInitScript(() => {
      // Denied permission answers at once (an unanswered prompt is covered by the 12 s guard).
      navigator.geolocation.getCurrentPosition = (_ok, fail) => fail?.({ code: 1, message: "denied" } as GeolocationPositionError);
    });
    await mockNetwork(page);
    await page.goto("/");
    await expect(page.getByTestId("here-name")).toHaveText("Rosario");
  });
});

test.describe("the sky", () => {
  test.use({ geolocation: AT_SEA, permissions: ["geolocation"] });

  test("picking an hour shows that hour over its own sky; Ahora returns", { tag: "@smoke" }, async ({ page, errors }) => {
    await mockNetwork(page);
    await page.goto("/");
    await expect.poll(() => page.getByTestId("sky").evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
    const hours = page.getByRole("list", { name: "Próximas horas" }).getByRole("button");
    await hours.nth(2).click();
    await expect(hours.nth(2)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("region", { name: /Pronóstico a las/ })).toBeVisible();
    await page.getByRole("button", { name: /ahora/ }).click();
    await expect(page.getByRole("region", { name: "Ahora" })).toBeVisible();
    // The sky is hidden on the observatory and comes back at full size.
    await page.getByRole("link", { name: "Observatorio" }).click();
    await expect(page.getByTestId("map")).toBeVisible();
    await page.getByRole("link", { name: "Volver" }).last().click();
    await expect.poll(() => page.getByTestId("sky").evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
});

test.describe("settings", () => {
  test.use({ geolocation: AT_SEA, permissions: ["geolocation"] });

  test("units chosen in Ajustes apply everywhere", async ({ page }) => {
    await mockNetwork(page);
    await page.goto("/");
    await page.getByRole("link", { name: "Ajustes" }).click();
    await page.getByRole("button", { name: "°F" }).click();
    await page.getByRole("button", { name: "kn" }).click();
    await screen(page).getByRole("link", { name: "Volver" }).click();
    await expect(screen(page).getByTestId("current-temp")).toHaveText(`${Math.round((ONECALL.current.temp * 9) / 5 + 32)}°`);
    await expect(screen(page).getByRole("region", { name: "Ahora" })).toContainText(" kn");
  });
});
