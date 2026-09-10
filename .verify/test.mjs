// Smoke test de una ronda completa con 3 mesas (variante de 2 cartas):
// reparto (mano -> carta en pestaña), sacar carta del mazo, jugadas en el
// panel, mezclar, abrir cartas numeradas y tablero, votos, revelado y
// siguiente ronda con cartas nuevas por repartir.
//
// Uso: con el contenedor de dev levantado (docker compose up -d --build dev,
// puerto 3002 del host), ejecutar desde la raíz del repo:
//   docker run --rm -v "${PWD}/.verify:/work" -w /work \
//     mcr.microsoft.com/playwright:v1.48.0-jammy \
//     sh -c "npm install playwright@1.48.0 --no-save >/dev/null 2>&1 && node test.mjs"
// Capturas y log quedan en .verify/out/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE ?? 'http://host.docker.internal:3002/dixit-euskadi/#';
const OUT = '/work/out';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });

function track(p, tag) {
  p.on('console', (msg) => msg.type() === 'error' && !msg.text().includes('WebSocket') && log.push(`[${tag}] ${msg.text()}`));
  p.on('pageerror', (err) => !err.message.includes('WebSocket') && log.push(`[${tag}-pageerror] ${err.message}`));
}

async function popup(action) {
  const [p] = await Promise.all([context.waitForEvent('page'), action()]);
  await p.waitForLoadState();
  await p.waitForTimeout(400);
  return p;
}

const page = await context.newPage();
track(page, 'panel');

async function run() {
  await page.goto(BASE + '/', { timeout: 20000 });
  await page.waitForSelector('text=Dixit · Sala interactiva', { timeout: 15000 });
  await page.screenshot({ path: `${OUT}/01-config.png` });

  await page.click('button:has-text("3")');
  await page.click('button:has-text("Iniciar partida")');
  await page.waitForSelector('text=Pistero:');
  await page.screenshot({ path: `${OUT}/02-panel-reparto.png`, fullPage: true });

  // Mano (ayuda de reparto): cada carta se abre en pestaña nueva.
  const mano = await popup(() => page.locator('button:has-text("Ver mano")').nth(0).click());
  track(mano, 'mano');
  await mano.screenshot({ path: `${OUT}/03-mano.png`, fullPage: true });
  const carta = await popup(() => mano.locator('button[class*="aspect-"]').first().click());
  track(carta, 'carta');
  log.push(`[info] url carta: ${carta.url()}`);
  await carta.screenshot({ path: `${OUT}/04-carta.png` });
  await carta.close();
  await mano.close();

  // Sacar carta del mazo para la mesa 2: abre la carta y sube la mano a 8.
  const sacada = await popup(() => page.locator('button:has-text("Sacar carta")').nth(1).click());
  await sacada.close();
  log.push(`[info] mazo tras sacar: ${await page.locator('text=/Mazo: \\d+/').innerText()} (esperado 26)`);
  await page.screenshot({ path: `${OUT}/05-sacada.png`, fullPage: true });

  // Panel: jugar las cartas necesarias de cada mesa.
  const bloques = page.locator('div.bg-white.rounded-2xl.border.p-4:has(button:has-text("Ver mano"))');
  const n = await bloques.count();
  log.push(`[info] bloques de mesa: ${n}`);
  for (let i = 0; i < n; i++) {
    const bloque = bloques.nth(i);
    const necesarias = Number(/Juega (\d)/.exec(await bloque.innerText())?.[1] ?? 1);
    for (let k = 0; k < necesarias; k++) {
      await bloque.locator('button[class*="aspect-"]').nth(k).click();
    }
  }
  await page.fill('input[placeholder^="Pista"]', 'Un viaje sin mapa');
  await page.screenshot({ path: `${OUT}/06-jugadas.png`, fullPage: true });
  await page.click('button:has-text("Mezclar las cartas jugadas")');
  await page.waitForSelector('text=pared de votación');
  await page.screenshot({ path: `${OUT}/07-orden.png`, fullPage: true });
  log.push(`[info] botones "Abrir carta N": ${await page.locator('button:has-text("Abrir carta ")').count()} (esperado 5)`);

  const c1 = await popup(() => page.click('button:has-text("Abrir carta 1")'));
  await c1.close();
  const tablero = await popup(() => page.click('button:has-text("Abrir tablero")'));
  track(tablero, 'tablero');
  await tablero.screenshot({ path: `${OUT}/08-tablero.png`, fullPage: true });
  await tablero.close();

  const votacion = page.locator('section', { hasText: 'pared de votación' });
  const bloquesVoto = votacion.locator('div.bg-white.rounded-2xl.border.p-4:has(p.font-bold)');
  const nv = await bloquesVoto.count();
  log.push(`[info] mesas votantes: ${nv} (esperado 2)`);
  for (let i = 0; i < nv; i++) {
    const bloque = bloquesVoto.nth(i);
    log.push(`[info] votante ${i}: ${await bloque.locator('button[disabled]').count()} slots propios tachados (esperado 2)`);
    await bloque.locator('button:not([disabled])').first().click();
  }
  await page.click('button:has-text("Revelar y puntuar")');
  await page.waitForSelector('text=Resultado de la ronda');
  await page.screenshot({ path: `${OUT}/09-resultado.png`, fullPage: true });

  const revelado = await popup(() => page.click('button:has-text("Abrir revelado")'));
  track(revelado, 'revelado');
  await revelado.screenshot({ path: `${OUT}/10-revelado.png`, fullPage: true });
  await revelado.close();

  await page.click('button:has-text("Siguiente ronda")');
  await page.waitForSelector('text=Ronda 2');
  await page.waitForSelector('text=Cartas sacadas del mazo');
  // 5 cartas usadas, pero la mesa 2 ya tenía una de más por "Sacar carta": repone 4.
  log.push(`[info] cartas por repartir: ${await page.locator('button:has-text("Abrir carta")').count()} (esperado 4)`);
  await page.screenshot({ path: `${OUT}/11-ronda2-repartir.png`, fullPage: true });
  const nueva = await popup(() => page.locator('button:has-text("Abrir carta")').first().click());
  await nueva.close();
  log.push(`[info] por repartir tras abrir una: ${await page.locator('button:has-text("Abrir carta")').count()} (esperado 3)`);
}

try {
  await run();
  log.push('[info] flujo completo terminado sin excepciones');
} catch (e) {
  log.push(`[fatal] ${e.message}`);
  try {
    await page.screenshot({ path: `${OUT}/99-error.png`, fullPage: true });
  } catch {}
} finally {
  fs.writeFileSync(`${OUT}/errors.txt`, log.join('\n'));
  console.log(log.join('\n'));
  await browser.close();
}
