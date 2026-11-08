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
    // No minute nowcast here (empty, like Argentina): Open-Meteo's 15-minute steps give the exact start time.
    await expect(page.getByRole("region", { name: "Ahora" })).toContainText(/Lluvia\s*\d+%\s*llueve \d{1,2}:\d{2}/);
    // Sunrise and sunset in the place's own time zone (fixture: Europe/London).
    await expect(page.getByRole("region", { name: "Ahora" })).toContainText(/Sol\s*\d{1,2}:\d{2}\s*hasta \d{1,2}:\d{2}/);
    await expect(page.getByRole("region", { name: "Ahora" })).toContainText(/Viento\s*\d+ km\/h\s*(Norte|Noreste|Este|Sudeste|Sur|Sudoeste|Oeste|Noroeste)/);
    expect(errors).toEqual([]);
  });

  test("the week is on home; a day opens hour by hour in place", async ({ page }) => {
    await mockNetwork(page);
    await page.goto("/");
    const days = screen(page).getByTestId("days");
    await expect(days.locator("[data-slot=accordion-trigger]")).toHaveCount(7);
    await days.locator("[data-slot=accordion-trigger]").first().click();
    await expect(days.getByRole("list", { name: /Hora a hora/ }).getByRole("listitem").first()).toBeVisible();
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
    await page.getByRole("button", { name: "Volver a ahora" }).click();
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
