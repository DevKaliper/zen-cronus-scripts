import { getJumpshot, RELEASE_SPEED_LABELS } from "./jumpshots";
import { computeTiming } from "./timing";
import type { ScriptConfig } from "./types";

export function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rest = inches % 12;
  return `${feet}'${rest}"`;
}

const BUTTON_LABELS: Record<string, string> = {
  PS4_R3: "R3",
  PS4_L3: "L3",
  PS4_L1: "L1",
  PS4_R1: "R1",
  PS4_UP: "D-Pad Arriba",
  PS4_RIGHT: "D-Pad Derecha",
  PS4_LEFT: "D-Pad Izquierda",
};

export function buttonLabel(constant: string): string {
  return BUTTON_LABELS[constant] ?? constant;
}

/**
 * Genera el script .gpc completo para Cronus Zen a partir de la configuración.
 * El script usa constantes PS4_* (Cronus Zen las mapea al DualSense de PS5).
 */
export function generateGpc(config: ScriptConfig): string {
  const { build, method, features } = config;
  const jumpshot = getJumpshot(build.jumpshotId);
  const timing = computeTiming(build, method);
  const speed = build.releaseSpeedOverride ?? jumpshot.speed;
  const date = new Date().toISOString().slice(0, 10);

  const methodName = method === "button" ? "BOTON (hold Square)" : "RHYTHM (stick derecho)";

  const header = `/* ============================================================
   NBA 2K26 - AUTO GREEN (Cronus Zen / PS5)
   Generado: ${date}
   ------------------------------------------------------------
   Build:
     - Altura:            ${formatHeight(build.heightInches)}
     - Rating de triple:  ${build.threeRating}
     - Jumpshot base:     ${jumpshot.name}
     - Velocidad release: ${RELEASE_SPEED_LABELS[speed]}
   Metodo de tiro:        ${methodName}
   Timing inicial:        ${timing.waitMs} ms (+/- ${timing.jitterMs} ms jitter)
   ------------------------------------------------------------
   IMPORTANTE:
   - El timing es un PUNTO DE PARTIDA. Calibra en el gimnasio
     (Mi Cancha / practica) ajustando en pasos de 1 ms.${
       features.oledMenu
         ? `
   - Menu OLED: manten L2 + OPTIONS para abrir/cerrar.
       D-Pad ARRIBA/ABAJO  -> wait_time +/- 1 ms
       D-Pad DER/IZQ       -> jitter    +/- 1 ms
       CRUZ (X)            -> guardar en memoria (PVAR)`
         : ""
     }${
       features.killSwitch
         ? `
   - Kill switch: L2 + TOUCHPAD activa/desactiva el Auto Green.`
         : ""
     }${
       method === "rhythm"
         ? `
   - Requiere Shot Timing con release por stick (Pro Stick) en
     los ajustes del juego.`
         : ""
     }
   - Recomendado: desactivar el shot meter en el juego.
   ============================================================ */
`;

  const defines = `
define DEFAULT_WAIT   = ${timing.waitMs};
define DEFAULT_JITTER = ${timing.jitterMs};
${features.quickStop ? `define QS_BUTTON      = ${config.quickStopButton}; // Quick Stop: ${buttonLabel(config.quickStopButton)}\n` : ""}${features.meterDunk ? `define DUNK_BUTTON    = ${config.meterDunkButton}; // Meter Dunk: ${buttonLabel(config.meterDunkButton)}\ndefine DUNK_HOLD_MS   = 320; // duracion del meter de dunk (ajustable)\n` : ""}`;

  const strings = features.oledMenu
    ? `
const string sTitle  = "AUTO GREEN 2K26";
const string sWait   = "WAIT ms:";
const string sJitter = "JITTER :";
const string sSaved  = "GUARDADO";
`
    : "";

  const vars = `
int wait_time;
int jitter;
int shot_wait;
int seed = 77;
int autogreen_on = TRUE;
${features.oledMenu ? "int menu_open = FALSE;\nint menu_dirty = TRUE;\nint n_chars;\n" : ""}`;

  const init = `
init {
    wait_time = get_pvar(SPVAR_1, 5, 900, DEFAULT_WAIT);
    jitter    = get_pvar(SPVAR_2, 0, 30, DEFAULT_JITTER);
}
`;

  // --- bloques de main ---

  const killSwitchBlock = features.killSwitch
    ? `
    // ---- Kill switch: L2 + Touchpad ----
    if(get_val(PS4_L2) && event_press(PS4_TOUCH)) {
        autogreen_on = !autogreen_on;
        set_val(PS4_TOUCH, 0);${features.oledMenu ? "\n        menu_dirty = TRUE;" : ""}
    }
`
    : "";

  const menuBlock = features.oledMenu
    ? `
    // ---- Menu OLED: L2 + Options ----
    if(get_val(PS4_L2) && event_press(PS4_OPTIONS)) {
        menu_open = !menu_open;
        menu_dirty = TRUE;
        if(!menu_open) {
            cls_oled(OLED_BLACK);
        }
        set_val(PS4_OPTIONS, 0);
    }

    if(menu_open) {
        if(event_press(PS4_UP))    { wait_time = wait_time + 1; menu_dirty = TRUE; }
        if(event_press(PS4_DOWN))  { wait_time = wait_time - 1; menu_dirty = TRUE; }
        if(event_press(PS4_RIGHT)) { jitter = jitter + 1; menu_dirty = TRUE; }
        if(event_press(PS4_LEFT))  { jitter = jitter - 1; menu_dirty = TRUE; }
        if(wait_time < 5)   wait_time = 5;
        if(wait_time > 900) wait_time = 900;
        if(jitter < 0)  jitter = 0;
        if(jitter > 30) jitter = 30;

        if(event_press(PS4_CROSS)) {
            set_pvar(SPVAR_1, wait_time);
            set_pvar(SPVAR_2, jitter);
            cls_oled(OLED_BLACK);
            print(28, 25, OLED_FONT_MEDIUM, OLED_WHITE, sSaved[0]);
            menu_dirty = FALSE;
        }

        if(menu_dirty) {
            draw_menu();
            menu_dirty = FALSE;
        }

        // Bloquear inputs del menu para que no lleguen al juego
        set_val(PS4_UP, 0);
        set_val(PS4_DOWN, 0);
        set_val(PS4_LEFT, 0);
        set_val(PS4_RIGHT, 0);
        set_val(PS4_CROSS, 0);
    }
`
    : "";

  const autoGreenBlock =
    method === "button"
      ? `
    // ---- Auto Green (metodo BOTON) ----
    if(autogreen_on${features.oledMenu ? " && !menu_open" : ""}) {
        if(event_press(PS4_SQUARE) && !combo_running(AutoGreen)) {
            shot_wait = wait_time + rand_jitter();
            combo_run(AutoGreen);
        }
        // El combo controla la salida de Square; se anula el input manual
        if(get_val(PS4_SQUARE)) set_val(PS4_SQUARE, 0);
    }
`
      : `
    // ---- Auto Green (metodo RHYTHM / stick derecho) ----
    if(autogreen_on${features.oledMenu ? " && !menu_open" : ""}) {
        if(event_press(PS4_SQUARE) && !combo_running(AutoGreen)) {
            shot_wait = wait_time + rand_jitter();
            combo_run(AutoGreen);
        }
        // Se anula el input manual; el combo maneja RS y Square
        if(get_val(PS4_SQUARE)) set_val(PS4_SQUARE, 0);
        if(combo_running(AutoGreen)) set_val(PS4_RY, 0);
    }
`;

  const quickStopBlock = features.quickStop
    ? `
    // ---- Quick Stop ----
    if(event_press(QS_BUTTON) && !combo_running(QuickStop)) {
        combo_run(QuickStop);
        set_val(QS_BUTTON, 0);
    }
`
    : "";

  const meterDunkBlock = features.meterDunk
    ? `
    // ---- Meter Dunk ----
    if(event_press(DUNK_BUTTON) && !combo_running(MeterDunk)) {
        combo_run(MeterDunk);
        set_val(DUNK_BUTTON, 0);
    }
`
    : "";

  const seedBlock = `
    // Semilla pseudo-aleatoria para humanizar el release
    seed = seed * 31 + 13;
    if(seed > 30000 || seed < 0) seed = seed % 997;
`;

  const main = `
main {${seedBlock}${killSwitchBlock}${menuBlock}${autoGreenBlock}${quickStopBlock}${meterDunkBlock}}
`;

  // --- combos ---

  const autoGreenCombo =
    method === "button"
      ? `
combo AutoGreen {
    set_val(PS4_SQUARE, 100);
    wait(shot_wait);
    set_val(PS4_SQUARE, 0);
    wait(60);
}
`
      : `
combo AutoGreen {
    // Pull del stick derecho hacia abajo (inicia el tiro)
    set_val(PS4_RY, 100);
    wait(shot_wait);
    // Snap hacia arriba (release)
    set_val(PS4_RY, -100);
    wait(60);
    set_val(PS4_RY, 0);
    wait(20);
}
`;

  const quickStopCombo = features.quickStop
    ? `
combo QuickStop {
    // Suelta sprint y neutraliza el stick de movimiento
    set_val(PS4_R2, 0);
    set_val(PS4_LX, 0);
    set_val(PS4_LY, 0);
    wait(180);
}
`
    : "";

  const meterDunkCombo = features.meterDunk
    ? `
combo MeterDunk {
    // Sprint + RS abajo para cargar el meter, snap arriba para finalizar
    set_val(PS4_R2, 100);
    set_val(PS4_RY, 100);
    wait(DUNK_HOLD_MS);
    set_val(PS4_R2, 100);
    set_val(PS4_RY, -100);
    wait(80);
    set_val(PS4_RY, 0);
    wait(20);
}
`
    : "";

  // --- funciones ---

  const randFn = `
function rand_jitter() {
    if(jitter == 0) return 0;
    return (abs(seed) % ((jitter * 2) + 1)) - jitter;
}
`;

  const menuFns = features.oledMenu
    ? `
function draw_menu() {
    cls_oled(OLED_BLACK);
    print(6, 0, OLED_FONT_SMALL, OLED_WHITE, sTitle[0]);
    print(2, 20, OLED_FONT_SMALL, OLED_WHITE, sWait[0]);
    draw_number(80, 20, wait_time);
    print(2, 38, OLED_FONT_SMALL, OLED_WHITE, sJitter[0]);
    draw_number(80, 38, jitter);
}

function draw_number(f_x, f_y, f_num) {
    n_chars = 0;
    if(f_num >= 100) {
        n_chars = n_chars + 1;
        putc_oled(n_chars, 48 + (f_num / 100));
    }
    if(f_num >= 10) {
        n_chars = n_chars + 1;
        putc_oled(n_chars, 48 + ((f_num / 10) % 10));
    }
    n_chars = n_chars + 1;
    putc_oled(n_chars, 48 + (f_num % 10));
    puts_oled(f_x, f_y, OLED_FONT_SMALL, n_chars, OLED_WHITE);
}
`
    : "";

  return [header, defines, strings, vars, init, main, autoGreenCombo, quickStopCombo, meterDunkCombo, randFn, menuFns]
    .filter((s) => s.trim().length > 0)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function suggestedFilename(config: ScriptConfig): string {
  const jumpshot = getJumpshot(config.build.jumpshotId);
  const method = config.method === "button" ? "boton" : "rhythm";
  const safeName = jumpshot.id.replace(/[^a-z0-9-]/gi, "");
  return `nba2k26_autogreen_${safeName}_${config.build.threeRating}_${method}.gpc`;
}
