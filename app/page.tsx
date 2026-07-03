"use client";

import { useMemo, useState } from "react";
import { buttonLabel, formatHeight, generateGpc, suggestedFilename } from "@/lib/gpc";
import { JUMPSHOT_BASES, RELEASE_SPEED_LABELS, getJumpshot } from "@/lib/jumpshots";
import { computeTiming } from "@/lib/timing";
import type { AssignableButton, ReleaseSpeed, ScriptConfig, ShotMethod } from "@/lib/types";

const HEIGHTS = Array.from({ length: 88 - 69 + 1 }, (_, i) => 69 + i);

const ASSIGNABLE_BUTTONS: AssignableButton[] = [
  "PS4_R3",
  "PS4_L3",
  "PS4_L1",
  "PS4_R1",
  "PS4_UP",
  "PS4_RIGHT",
  "PS4_LEFT",
];

const SPEEDS: ReleaseSpeed[] = ["very-fast", "fast", "normal", "slow", "very-slow"];

export default function Home() {
  const [heightInches, setHeightInches] = useState(77);
  const [threeRating, setThreeRating] = useState(85);
  const [jumpshotId, setJumpshotId] = useState("tatum");
  const [speedOverride, setSpeedOverride] = useState<ReleaseSpeed | "">("");
  const [method, setMethod] = useState<ShotMethod>("button");
  const [quickStop, setQuickStop] = useState(true);
  const [meterDunk, setMeterDunk] = useState(true);
  const [oledMenu, setOledMenu] = useState(true);
  const [killSwitch, setKillSwitch] = useState(false);
  const [quickStopButton, setQuickStopButton] = useState<AssignableButton>("PS4_R3");
  const [meterDunkButton, setMeterDunkButton] = useState<AssignableButton>("PS4_L1");
  const [copied, setCopied] = useState(false);

  const jumpshot = getJumpshot(jumpshotId);

  const config: ScriptConfig = useMemo(
    () => ({
      build: {
        heightInches,
        threeRating,
        jumpshotId,
        releaseSpeedOverride: speedOverride === "" ? undefined : speedOverride,
      },
      method,
      features: { quickStop, meterDunk, oledMenu, killSwitch },
      quickStopButton,
      meterDunkButton,
    }),
    [
      heightInches,
      threeRating,
      jumpshotId,
      speedOverride,
      method,
      quickStop,
      meterDunk,
      oledMenu,
      killSwitch,
      quickStopButton,
      meterDunkButton,
    ],
  );

  const timing = useMemo(() => computeTiming(config.build, method), [config.build, method]);
  const code = useMemo(() => generateGpc(config), [config]);

  function download() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedFilename(config);
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          Cronus Zen · PS5
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Generador de Scripts GPC — NBA 2K26
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Ingresa los datos de tu build y descarga un archivo <code>.gpc</code> con Auto Green
          listo para compilar en Cronus Zen Studio. El timing calculado es un punto de partida:
          calibra en el gimnasio con el menú OLED del script.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* ---------- Formulario ---------- */}
        <div className="space-y-6">
          <Section title="1. Tu build / arquetipo">
            <Field label={`Altura: ${formatHeight(heightInches)}`}>
              <select
                className={inputCls}
                value={heightInches}
                onChange={(e) => setHeightInches(Number(e.target.value))}
              >
                {HEIGHTS.map((h) => (
                  <option key={h} value={h}>
                    {formatHeight(h)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={`Rating de triple: ${threeRating}`}>
              <input
                type="range"
                min={60}
                max={99}
                value={threeRating}
                onChange={(e) => setThreeRating(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>60</span>
                <span>99</span>
              </div>
            </Field>

            <Field label="Base de jumpshot">
              <select
                className={inputCls}
                value={jumpshotId}
                onChange={(e) => {
                  setJumpshotId(e.target.value);
                  setSpeedOverride("");
                }}
              >
                {JUMPSHOT_BASES.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Velocidad de release">
              <select
                className={inputCls}
                value={speedOverride}
                onChange={(e) => setSpeedOverride(e.target.value as ReleaseSpeed | "")}
              >
                <option value="">
                  De la base ({RELEASE_SPEED_LABELS[jumpshot.speed]})
                </option>
                {SPEEDS.map((s) => (
                  <option key={s} value={s}>
                    {RELEASE_SPEED_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="2. Método de tiro">
            <div className="grid grid-cols-2 gap-2">
              <MethodCard
                active={method === "button"}
                title="Botón"
                desc="Mantiene Square y suelta en el punto green."
                onClick={() => setMethod("button")}
              />
              <MethodCard
                active={method === "rhythm"}
                title="Rhythm (RS)"
                desc="Stick derecho abajo → snap arriba tras el delay."
                onClick={() => setMethod("rhythm")}
              />
            </div>
            {method === "rhythm" && (
              <p className="mt-2 text-xs text-amber-400">
                Requiere Shot Timing con release por stick (Pro Stick) en el juego.
              </p>
            )}
          </Section>

          <Section title="3. Funciones del script">
            <Toggle label="Auto Green" checked disabled hint="Núcleo del script (siempre activo)" />
            <Toggle
              label="Menú OLED de ajuste"
              checked={oledMenu}
              onChange={setOledMenu}
              hint="L2 + Options: ajusta wait/jitter ±1 ms y guarda en PVAR"
            />
            <Toggle
              label="Quick Stop"
              checked={quickStop}
              onChange={setQuickStop}
              hint="Frenado rápido en drives"
            />
            {quickStop && (
              <ButtonPicker
                label="Botón de Quick Stop"
                value={quickStopButton}
                onChange={setQuickStopButton}
                exclude={meterDunk ? meterDunkButton : undefined}
              />
            )}
            <Toggle
              label="Meter Dunk"
              checked={meterDunk}
              onChange={setMeterDunk}
              hint="Timing automático del meter de dunk"
            />
            {meterDunk && (
              <ButtonPicker
                label="Botón de Meter Dunk"
                value={meterDunkButton}
                onChange={setMeterDunkButton}
                exclude={quickStop ? quickStopButton : undefined}
              />
            )}
            <Toggle
              label="Kill switch"
              checked={killSwitch}
              onChange={setKillSwitch}
              hint="L2 + Touchpad activa/desactiva el Auto Green"
            />
          </Section>
        </div>

        {/* ---------- Resultado ---------- */}
        <div className="space-y-4">
          <Section title="Timing calculado">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="wait_time" value={`${timing.waitMs} ms`} />
              <Stat label="jitter" value={`± ${timing.jitterMs} ms`} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              Estimado a partir de la base <strong>{jumpshot.name}</strong> y tu rating de triple
              ({threeRating}). En 2K26 la altura no cambia el tamaño de la ventana green en tiros
              abiertos, así que solo se documenta en el script. Ajusta el valor final en el
              gimnasio{oledMenu ? " con el menú OLED (L2 + Options)" : ""}.
            </p>
          </Section>

          <Section
            title="Vista previa del script"
            right={
              <div className="flex gap-2">
                <button onClick={copy} className={btnSecondary}>
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
                <button onClick={download} className={btnPrimary}>
                  Descargar .gpc
                </button>
              </div>
            }
          >
            <p className="mb-2 text-xs text-zinc-500">{suggestedFilename(config)}</p>
            <pre className="max-h-[560px] overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-[11px] leading-relaxed text-emerald-300/90">
              <code>{code}</code>
            </pre>
          </Section>

          <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4 text-xs leading-relaxed text-amber-200/80">
            <strong>Aviso:</strong> el uso de scripts en partidas online puede violar los términos
            de servicio de NBA 2K y derivar en sanciones. Usa esta herramienta bajo tu propia
            responsabilidad. Los timings son estimaciones de la comunidad y cambian con cada
            parche del juego.
          </div>
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500";

const btnPrimary =
  "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500";

const btnSecondary =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500";

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">{title}</h2>
        {right}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-center">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-emerald-400">{value}</p>
    </div>
  );
}

function MethodCard({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        active
          ? "border-emerald-500 bg-emerald-950/40"
          : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">{desc}</p>
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 ${disabled ? "opacity-70" : "cursor-pointer"}`}
    >
      <span>
        <span className="block text-sm font-medium text-zinc-200">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 accent-emerald-500"
      />
    </label>
  );
}

function ButtonPicker({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: AssignableButton;
  onChange: (v: AssignableButton) => void;
  exclude?: AssignableButton;
}) {
  return (
    <Field label={label}>
      <select
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value as AssignableButton)}
      >
        {ASSIGNABLE_BUTTONS.filter((b) => b !== exclude).map((b) => (
          <option key={b} value={b}>
            {buttonLabel(b)}
          </option>
        ))}
      </select>
    </Field>
  );
}
