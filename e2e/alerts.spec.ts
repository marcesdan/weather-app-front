import { AT_SEA, expect, mockNetwork, test } from "./fixtures";

// Notifications through the service worker: Chromium only (WebKit has no notification permission in Playwright).
test.skip(({ browserName }) => browserName !== "chromium", "notifications need Chromium");
test.use({ geolocation: AT_SEA, permissions: ["geolocation", "notifications"] });

test("alerts are chosen per place: only the place with its bell on notifies, once", async ({ page }) => {
  await mockNetwork(page);
  await page.goto("/ciudades");
  await page.getByRole("button", { name: "Agregar Miramar" }).click();
  await page.getByRole("button", { name: "Agregar Batán" }).click();

  const bell = page.getByRole("button", { name: "Avisos para Miramar" });
  await bell.click();
  await expect(bell).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Avisos para Batán" })).toHaveAttribute("aria-pressed", "false");

  const titles = () =>
    page.evaluate(async () => (await (await navigator.serviceWorker.ready).getNotifications()).map((n) => n.title).sort());

  await page.goto("/ajustes");
  await page.getByRole("button", { name: "Enviar un aviso de prueba" }).click();
  await expect.poll(titles).toContain("Prueba: ráfagas de temporal");

  // Every mocked place forecasts a gale, but only Miramar has its bell on.
  await page.reload();
  await expect.poll(titles).toContain("Ráfagas de temporal en Miramar");
  await page.reload();
  await page.waitForTimeout(1500);
  const all = await titles();
  expect(all.filter((t) => t.includes("Miramar"))).toHaveLength(1);
  expect(all.some((t) => t.includes("Batán"))).toBe(false);
});
