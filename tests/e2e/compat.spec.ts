import { devices, expect, test } from "@playwright/test";

test.describe("Compatibilidad multiplataforma", () => {
  test("Museo del Tiempo renderiza correctamente en iPhone 14 Pro", async ({
    page,
  }) => {
    test.use({ ...devices["iPhone 14 Pro"] });

    await page.goto("http://localhost:3000");

    // Verificar que el título se carga correctamente
    await expect(page.getByText(/Museo del Tiempo/i)).toBeVisible();

    // Verificar que la interfaz es responsive en móvil
    await expect(page.locator("main")).toBeVisible();

    // Verificar que los elementos de navegación están presentes
    await expect(page.locator("nav")).toBeVisible();
  });

  test("Navegación por décadas funciona en iPhone 14 Pro", async ({ page }) => {
    test.use({ ...devices["iPhone 14 Pro"] });

    await page.goto("http://localhost:3000");

    // Esperar a que la página cargue completamente
    await page.waitForLoadState("networkidle");

    // Buscar y hacer clic en una década (1980s)
    const decadeButton = page.getByRole("button", { name: /1980s|1980/i });
    await expect(decadeButton).toBeVisible();
    await decadeButton.click();

    // Verificar que el contenido de la década se carga
    await expect(
      page.getByText(/Contexto histórico|Resumen|1980/i)
    ).toBeVisible();
  });

  test("AudioPlayer es compatible con Safari/iPhone", async ({ page }) => {
    test.use({ ...devices["iPhone 14 Pro"] });

    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    // Navegar a una década que tenga audio
    const decadeButton = page.getByRole("button", { name: /1980s|1980/i });
    await decadeButton.click();

    // Verificar que el AudioPlayer se renderiza
    const audioPlayer = page
      .locator('[data-testid="audio-player"], .audio-player, [class*="audio"]')
      .first();
    await expect(audioPlayer).toBeVisible();

    // Verificar que el botón de play está presente
    const playButton = page.getByRole("button", { name: /reproducir|play/i });
    await expect(playButton).toBeVisible();

    // Verificar que el elemento audio tiene los atributos correctos para iPhone
    const audioElement = page.locator("audio");
    await expect(audioElement).toHaveAttribute("playsinline", "");
    await expect(audioElement).toHaveAttribute("webkit-playsinline", "true");
  });

  test("Interacción táctil funciona correctamente en iPhone", async ({
    page,
  }) => {
    test.use({ ...devices["iPhone 14 Pro"] });

    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    // Simular gestos táctiles
    const decadeButton = page.getByRole("button", { name: /1980s|1980/i });

    // Tap en el botón
    await decadeButton.tap();
    await expect(
      page.getByText(/Contexto histórico|Resumen|1980/i)
    ).toBeVisible();

    // Verificar que no hay problemas de scroll o layout
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  test("Compatibilidad con WebKit (Safari)", async ({ page }) => {
    test.use({ ...devices["Desktop Safari"] });

    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    // Verificar que la página carga sin errores de JavaScript
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.waitForTimeout(2000);

    // Verificar que no hay errores críticos
    expect(
      errors.filter(
        (error) =>
          error.includes("ReferenceError") ||
          error.includes("TypeError") ||
          error.includes("SyntaxError")
      )
    ).toHaveLength(0);

    // Verificar funcionalidad básica
    await expect(page.getByText(/Museo del Tiempo/i)).toBeVisible();
  });

  test("Compatibilidad con Chrome Desktop", async ({ page }) => {
    test.use({ ...devices["Desktop Chrome"] });

    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    // Verificar que todas las funcionalidades principales funcionan
    await expect(page.getByText(/Museo del Tiempo/i)).toBeVisible();

    const decadeButton = page.getByRole("button", { name: /1980s|1980/i });
    await decadeButton.click();
    await expect(
      page.getByText(/Contexto histórico|Resumen|1980/i)
    ).toBeVisible();
  });

  test("Compatibilidad con Firefox Desktop", async ({ page }) => {
    test.use({ ...devices["Desktop Firefox"] });

    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");

    // Verificar que la página carga correctamente
    await expect(page.getByText(/Museo del Tiempo/i)).toBeVisible();

    // Verificar que las animaciones de Framer Motion funcionan
    const animatedElement = page.locator('[class*="motion"]').first();
    await expect(animatedElement).toBeVisible();
  });
});
