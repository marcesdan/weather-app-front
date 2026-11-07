import { AT_SEA, expect, mockNetwork, test } from "./fixtures";

// Notifications through the service worker: Chromium only (WebKit has no notification permission in Playwright).
test.skip(({ browserName }) => browserName !== "chromium", "notifications need Chromium");
test.use({ geolocation: AT_SEA, permissions: ["geolocation", "notifications"] });

test("turning alerts on notifies the gale forecast for a saved place once", async ({ page }) => {
  await mockNetwork(page);
  await page.goto("/ciudades");
  await page.getByRole("button", { name: "Agregar Miramar" }).click();

  await page.getByRole("switch", { name: /Avisarme de alertas/ }).click();
  await expect(page.getByRole("switch", { name: /Avisarme de alertas/ })).toBeChecked();
  await page.getByRole("button", { name: "Enviar un aviso de prueba" }).click();

  const titles = () =>
    page.evaluate(async () => (await (await navigator.serviceWorker.ready).getNotifications()).map((n) => n.title).sort());
  await expect.poll(titles).toContain("Prueba: ráfagas de temporal");

  // The open app checks saved places on start; the alert is shown once even after a reload.
  await page.reload();
  await expect.poll(titles).toContain("Ráfagas de temporal en Miramar");
  await page.reload();
  await page.waitForTimeout(1500);
  expect((await titles()).filter((t) => t.includes("Miramar"))).toHaveLength(1);
});
