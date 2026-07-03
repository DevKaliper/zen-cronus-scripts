# Generador de Scripts GPC — NBA 2K26 (Cronus Zen / PS5)

Web app que genera archivos `.gpc` para Cronus Zen a partir de los datos de tu build/arquetipo de NBA 2K26. Todo se ejecuta en el navegador: no hay backend ni se envía información a ningún servidor.

## Funciones del script generado

- **Auto Green**: release automático del tiro con timing calculado según tu jumpshot y rating de triple. Dos métodos:
  - **Botón**: mantiene Square y suelta en el punto estimado del green.
  - **Rhythm**: stick derecho abajo al presionar Square y snap arriba tras el delay (requiere Shot Timing con release por stick / Pro Stick en el juego).
- **Menú OLED de ajuste** (opcional): `L2 + Options` abre el menú en la pantalla del Zen. D-Pad arriba/abajo ajusta `wait_time` ±1 ms, derecha/izquierda ajusta el jitter, y Cruz (X) guarda los valores en memoria persistente (PVAR), de modo que sobreviven reinicios.
- **Quick Stop** (opcional): frenado rápido en drives con el botón que asignes.
- **Meter Dunk** (opcional): timing automático del meter de dunk con el botón que asignes.
- **Kill switch** (opcional): `L2 + Touchpad` activa/desactiva el Auto Green sin cambiar de slot.

## Uso

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), configura tu build (altura, rating de triple, base de jumpshot, velocidad de release), elige el método de tiro y las funciones, y descarga el `.gpc`.

## Instalación en Cronus Zen

1. Abre **Cronus Zen Studio** (Zen Studio) con el Zen conectado por el puerto PROG.
2. Ve a la pestaña **Compiler** y abre el archivo `.gpc` descargado (o pega el contenido copiado).
3. Compila (`F7` o el botón Compile). No debe haber errores.
4. En **Programmer**, arrastra el script a un slot de memoria y pulsa **Program Device**.
5. Conecta el DualSense al Zen y el Zen a la PS5. Selecciona el slot con el botón del Zen.

## Calibración (importante)

El timing generado es un **punto de partida estimado**. La ventana green real depende de tu animación exacta, tus ratings, los badges y la latencia de la conexión:

1. Entra al gimnasio (Mi Cancha / práctica de tiro).
2. Tira con Square y observa el feedback (early / late).
3. Abre el menú OLED (`L2 + Options`) y ajusta `wait_time`:
   - Tiros **early** (temprano) → sube el valor.
   - Tiros **late** (tarde) → baja el valor.
4. Ajusta en pasos de 1-3 ms hasta encadenar greens y guarda con Cruz (X).
5. Recalibra si cambias de jumpshot, tras cada parche de 2K, o si notas deriva por lag online.

## Estructura del proyecto

- `lib/jumpshots.ts` — catálogo de bases de jumpshot con timings estimados.
- `lib/timing.ts` — cálculo del `wait_time`/jitter según build y método.
- `lib/gpc.ts` — ensamblado del script `.gpc` (defines, init, main, combos, funciones).
- `app/page.tsx` — interfaz del generador.

Tests:

```bash
npm test
```

## Aviso legal

El uso de dispositivos como Cronus Zen y scripts de automatización en partidas online puede violar los términos de servicio de NBA 2K / PlayStation Network y derivar en sanciones o baneos. Este proyecto es solo con fines educativos; úsalo bajo tu propia responsabilidad. Los valores de timing provienen de investigación pública de la comunidad y cambian con los parches del juego.
# zen-cronus-scripts
