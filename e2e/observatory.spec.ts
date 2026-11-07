import { AT_SEA, expect, mockNetwork, test } from "./fixtures";

test.use({ geolocation: AT_SEA, permissions: ["geolocation"] });

test("observatory: layers, time slider, point forecast and a named zone", { tag: "@smoke" }, async ({ page, errors }) => {
  await mockNetwork(page);
  await page.goto("/observatory?lat=-38.3&lon=-57.0");

  await expect(page.getByTestId("map")).toBeVisible();
  await expect(page.getByTestId("hour-label")).toContainText("(ahora)");
  await page.getByTestId("layer-waves").click();
  await expect(page.getByTestId("layer-waves")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("5+ m")).toBeVisible();

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
  await expect.poll(() => page.locator("canvas").first().evaluate((c: HTMLCanvasElement) => c.width)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
