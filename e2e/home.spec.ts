import { AT_SEA, expect, mockNetwork, test } from "./fixtures";

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
