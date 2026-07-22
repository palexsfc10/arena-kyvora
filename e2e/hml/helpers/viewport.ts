import { expect, type Locator, type Page } from "@playwright/test";

export type ViewportBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Hard visual gate: interactive overlay must sit fully inside the viewport
 * and must not force page-level horizontal scroll.
 */
export async function assertWithinViewport(
  page: Page,
  locator: Locator,
  opts: { label?: string; tolerancePx?: number } = {},
): Promise<ViewportBox> {
  const tolerance = opts.tolerancePx ?? 1;
  const label = opts.label ?? "overlay";
  const viewport = page.viewportSize();
  expect(viewport, `${label}: viewport missing`).not.toBeNull();

  await expect(locator, `${label}: not visible`).toBeVisible();
  const box = await locator.boundingBox();
  expect(box, `${label}: bounding box missing`).not.toBeNull();

  const b = box!;
  const v = viewport!;

  expect(b.x, `${label}: overflows LEFT (x=${b.x})`).toBeGreaterThanOrEqual(
    -tolerance,
  );
  expect(b.y, `${label}: overflows TOP (y=${b.y})`).toBeGreaterThanOrEqual(
    -tolerance,
  );
  expect(
    b.x + b.width,
    `${label}: overflows RIGHT (right=${b.x + b.width} vw=${v.width})`,
  ).toBeLessThanOrEqual(v.width + tolerance);
  // Bottom can scroll internally; only require the top stays reachable.
  expect(b.y, `${label}: starts below fold`).toBeLessThan(v.height);

  const pageHorizontalOverflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1
    );
  });
  expect(
    pageHorizontalOverflow,
    `${label}: page has horizontal overflow`,
  ).toBe(false);

  return b;
}

export async function assertNoPageHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    return (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1
    );
  });
  expect(overflow).toBe(false);
}
