import { AT_SEA, expect, mockNetwork, test } from "./fixtures";

test.use({ geolocation: AT_SEA, permissions: ["geolocation"] });

test("observatory: layers, time slider, point forecast and a named zone", { tag: "@smoke" }, async ({ page, errors }) => {
  await mockNetwork(page);
  await page.goto("/observatory?lat=-38.3&lon=-57.0");

  await expect(page.getByTestId("map")).toBeVisible();
  await expect(page.getByTestId("hour-label")).toContainText("(ahora)");
  await page.getByTestId("layer-waves").click();
  await expect(page.getByTestId("layer-waves")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("6 m+")).toBeVisible();

  // Live OpenWeatherMap radar: tiles come from our backend (key stays server-side).
  const tile = page.waitForRequest(/\/api\/v2\/tiles\/precipitation_new\/\d+\/\d+\/\d+\.png/);
  await page.getByTestId("layer-radar").click();
  await tile;
  await expect(page.getByText("En vivo, de OpenWeatherMap")).toBeVisible();
  await page.getByTestId("layer-waves").click();

  await page.getByRole("slider", { name: "Pronóstico" }).fill("6");
  await expect(page.getByTestId("hour-label")).toContainText("(+6 h)");

  // Opened with lat/lon: the point panel is already there. At sea, no place name.
  const panel = page.getByTestId("point-panel");
  await expect(panel.getByRole("heading")).toHaveText("Punto sin nombre");
  await expect(panel.getByTestId("point-table").getByRole("row")).toHaveCount(23); // header + every 3 h from +6 h
  await expect(panel.getByTestId("beaufort")).toContainText("Beaufort");
  await expect(panel.getByTestId("point-alerts")).toContainText("Ráfagas de temporal");

  // Unit switch reaches the table header.
  await page.getByRole("radio", { name: "km/h" }).click();
  await expect(panel.getByRole("columnheader", { name: "Viento km/h" })).toBeVisible();

  await panel.getByRole("button", { name: "Guardar zona" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Guardar zona" })).toBeDisabled(); // a nameless spot needs a name
  await dialog.getByLabel("Nombre").fill("Camino del delfín");
  await dialog.getByRole("button", { name: "Guardar zona" }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("link", { name: "Volver" }).click();
  await expect(page.getByTestId("place-card").first()).toContainText("Camino del delfín");

  // Tapping the map picks a new point.
  await page.goto("/observatory");
  await expect(page.getByTestId("point-panel")).toHaveCount(0);
  await page.getByTestId("map").click({ position: { x: 120, y: 160 } });
  await expect(page.getByTestId("point-panel")).toBeVisible();
  expect(errors).toEqual([]);
});

test("going back from the observatory leaves no errors (Ionic keeps the page cached at size 0)", async ({ page, errors }) => {
  await mockNetwork(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Observatorio" }).click();
  await expect(page.getByTestId("map")).toBeVisible();
  await expect(page.getByTestId("hour-label")).toContainText("(ahora)"); // field loaded, layers drawing
  await page.getByRole("link", { name: "Volver" }).last().click();
  await expect(page.getByTestId("here-name")).toBeVisible();
  await page.waitForTimeout(1000);

  // Coming back to the cached page resumes drawing at full size.
  await page.getByRole("link", { name: "Observatorio" }).click();
  await expect(page.getByTestId("map")).toBeVisible();
  await expect.poll(() => page.getByTestId("map").locator("..").locator("canvas").first().evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test("panning the map inside the loaded area sends no new forecast requests (Open-Meteo rate limits)", async ({ page }) => {
  await mockNetwork(page);
  let gridRequests = 0;
  page.on("request", (r) => {
    if (/open-meteo\.com\/v1\/(forecast|marine)\?latitude=[^&]*%2C/.test(r.url())) gridRequests++; // multi-point = map grid
  });
  await page.goto("/observatory?lat=-38.3&lon=-57.0");
  await expect(page.getByTestId("hour-label")).toContainText("(ahora)");
  await page.waitForTimeout(1200);
  const before = gridRequests;
  const map = page.getByTestId("map");
  const box = (await map.boundingBox())!;
  for (const dx of [40, -60, 30]) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dx / 2, { steps: 5 });
    await page.mouse.up();
  }
  await page.waitForTimeout(1500);
  expect(gridRequests - before).toBe(0);
});
