import { describe, expect, it } from "vitest";
import { formatHeight, generateGpc, suggestedFilename } from "./gpc";
import type { ScriptConfig } from "./types";

const fullConfig: ScriptConfig = {
  build: {
    heightInches: 77,
    threeRating: 88,
    jumpshotId: "tatum",
  },
  method: "button",
  features: {
    quickStop: true,
    meterDunk: true,
    oledMenu: true,
    killSwitch: true,
  },
  quickStopButton: "PS4_R3",
  meterDunkButton: "PS4_L1",
};

function braceBalance(code: string): number {
  let balance = 0;
  for (const ch of code) {
    if (ch === "{") balance++;
    if (ch === "}") balance--;
  }
  return balance;
}

describe("generateGpc - estructura general", () => {
  const code = generateGpc(fullConfig);

  it("incluye secciones obligatorias de GPC", () => {
    expect(code).toContain("init {");
    expect(code).toContain("main {");
    expect(code).toContain("combo AutoGreen {");
  });

  it("tiene llaves balanceadas", () => {
    expect(braceBalance(code)).toBe(0);
  });

  it("carga y guarda con PVAR", () => {
    expect(code).toContain("get_pvar(SPVAR_1");
    expect(code).toContain("get_pvar(SPVAR_2");
    expect(code).toContain("set_pvar(SPVAR_1, wait_time)");
    expect(code).toContain("set_pvar(SPVAR_2, jitter)");
  });

  it("la cabecera documenta el build", () => {
    expect(code).toContain("6'5\"");
    expect(code).toContain("Rating de triple:  88");
    expect(code).toContain("Base Jayson Tatum");
  });

  it("incluye el timing calculado como defines", () => {
    // tatum 425 + tier 85-89 offset 0
    expect(code).toContain("define DEFAULT_WAIT   = 425;");
    expect(code).toContain("define DEFAULT_JITTER = 8;");
  });
});

describe("generateGpc - método botón", () => {
  const code = generateGpc(fullConfig);

  it("el combo mantiene y suelta Square", () => {
    expect(code).toContain("set_val(PS4_SQUARE, 100);");
    expect(code).toContain("wait(shot_wait);");
    expect(code).toContain("set_val(PS4_SQUARE, 0);");
  });

  it("el combo AutoGreen no usa el stick derecho", () => {
    const autoGreenCombo = code.slice(
      code.indexOf("combo AutoGreen {"),
      code.indexOf("}", code.indexOf("combo AutoGreen {")),
    );
    expect(autoGreenCombo).not.toContain("PS4_RY");
  });
});

describe("generateGpc - método rhythm", () => {
  const code = generateGpc({ ...fullConfig, method: "rhythm" });

  it("usa el stick derecho abajo -> arriba", () => {
    expect(code).toContain("set_val(PS4_RY, 100);");
    expect(code).toContain("set_val(PS4_RY, -100);");
  });

  it("advierte del requisito de shot timing por stick", () => {
    expect(code).toContain("Pro Stick");
  });
});

describe("generateGpc - features opcionales", () => {
  it("omite combos y bloques cuando están desactivados", () => {
    const code = generateGpc({
      ...fullConfig,
      features: { quickStop: false, meterDunk: false, oledMenu: false, killSwitch: false },
    });
    expect(code).not.toContain("combo QuickStop");
    expect(code).not.toContain("combo MeterDunk");
    expect(code).not.toContain("draw_menu");
    expect(code).not.toContain("PS4_TOUCH");
    expect(braceBalance(code)).toBe(0);
  });

  it("usa los botones asignados", () => {
    const code = generateGpc(fullConfig);
    expect(code).toContain("define QS_BUTTON      = PS4_R3;");
    expect(code).toContain("define DUNK_BUTTON    = PS4_L1;");
  });

  it("incluye menú OLED cuando está activado", () => {
    const code = generateGpc(fullConfig);
    expect(code).toContain("cls_oled(OLED_BLACK);");
    expect(code).toContain("puts_oled(");
    expect(code).toContain('const string sTitle  = "AUTO GREEN 2K26";');
  });
});

describe("helpers", () => {
  it("formatHeight convierte pulgadas", () => {
    expect(formatHeight(69)).toBe("5'9\"");
    expect(formatHeight(84)).toBe("7'0\"");
    expect(formatHeight(88)).toBe("7'4\"");
  });

  it("suggestedFilename genera un nombre descriptivo", () => {
    expect(suggestedFilename(fullConfig)).toBe("nba2k26_autogreen_tatum_88_boton.gpc");
  });
});
