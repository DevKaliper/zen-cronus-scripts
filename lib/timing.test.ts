import { describe, expect, it } from "vitest";
import { computeTiming } from "./timing";
import type { BuildInput } from "./types";

const baseBuild: BuildInput = {
  heightInches: 77, // 6'5"
  threeRating: 85,
  jumpshotId: "tatum",
};

describe("computeTiming - método botón", () => {
  it("usa el release base del jumpshot en el tier 85-89 (offset 0)", () => {
    const result = computeTiming(baseBuild, "button");
    expect(result.waitMs).toBe(425);
    expect(result.jitterMs).toBe(8);
  });

  it("resta offset para ratings altos (95+) y reduce jitter", () => {
    const result = computeTiming({ ...baseBuild, threeRating: 99 }, "button");
    expect(result.waitMs).toBe(400); // 425 - 25
    expect(result.jitterMs).toBe(6);
  });

  it("suma offset para ratings bajos (75-79)", () => {
    const result = computeTiming({ ...baseBuild, threeRating: 76 }, "button");
    expect(result.waitMs).toBe(455); // 425 + 30
    expect(result.jitterMs).toBe(12);
  });

  it("una base más rápida produce un wait menor", () => {
    const curry = computeTiming({ ...baseBuild, jumpshotId: "curry" }, "button");
    const postFade = computeTiming({ ...baseBuild, jumpshotId: "post-fade" }, "button");
    expect(curry.waitMs).toBeLessThan(postFade.waitMs);
  });

  it("aplica el override de velocidad de release", () => {
    const normal = computeTiming(baseBuild, "button");
    const forcedFast = computeTiming(
      { ...baseBuild, releaseSpeedOverride: "very-fast" },
      "button",
    );
    expect(forcedFast.waitMs).toBeLessThan(normal.waitMs);
  });

  it("mantiene el resultado dentro de límites razonables", () => {
    const result = computeTiming(
      { ...baseBuild, jumpshotId: "post-fade", threeRating: 60 },
      "button",
    );
    expect(result.waitMs).toBeLessThanOrEqual(900);
    expect(result.waitMs).toBeGreaterThanOrEqual(200);
  });
});

describe("computeTiming - método rhythm", () => {
  it("usa la escala pequeña del stick", () => {
    const result = computeTiming(baseBuild, "rhythm");
    expect(result.waitMs).toBe(30);
    expect(result.jitterMs).toBe(2);
  });

  it("ajusta proporcionalmente por tier de rating", () => {
    const high = computeTiming({ ...baseBuild, threeRating: 99 }, "rhythm");
    const low = computeTiming({ ...baseBuild, threeRating: 70 }, "rhythm");
    expect(high.waitMs).toBeLessThan(low.waitMs);
  });

  it("nunca baja de 5ms ni el jitter de 1ms", () => {
    const result = computeTiming(
      { ...baseBuild, jumpshotId: "curry", threeRating: 99, releaseSpeedOverride: "very-fast" },
      "rhythm",
    );
    expect(result.waitMs).toBeGreaterThanOrEqual(5);
    expect(result.jitterMs).toBeGreaterThanOrEqual(1);
  });
});

describe("computeTiming - errores", () => {
  it("lanza error con jumpshot desconocido", () => {
    expect(() =>
      computeTiming({ ...baseBuild, jumpshotId: "no-existe" }, "button"),
    ).toThrow();
  });
});
