// Smoke test de una ronda completa con 3 mesas (variante de 2 cartas):
// reparto, mano en pared (zoom + elegir + votar), jugadas en el panel,
// montar la mesa, tablero central, votos, revelado y siguiente ronda.
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
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });

function track(p, tag) {
  p.on('console', (msg) => msg.type() === 'error' && log.push(`[${tag}] ${msg.text()}`));
  p.on('pageerror', (err) => log.push(`[${tag}-pageerror] ${err.message}`));
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

  // Mano del pistero (mesa 1): zoom + elegir.
  const manoPistero = await popup(() => page.locator('button:has-text("Abrir mano")').nth(0).click());
  track(manoPistero, 'mano-pistero');
  await manoPistero.screenshot({ path: `${OUT}/03-mano-pistero.png`, fullPage: true });
  await manoPistero.locator('button[class*="aspect-"]').first().click();
  await manoPistero.waitForSelector('text=Elegir esta carta');
  await manoPistero.screenshot({ path: `${OUT}/04-mano-zoom.png` });
  await manoPistero.click('button:has-text("Elegir esta carta")');
  await manoPistero.waitForSelector('text=Carta elegida');
  log.push(`[info] mano pistero muestra votación: ${await manoPistero.locator('text=Votación').count()} (esperado 0)`);
  await manoPistero.screenshot({ path: `${OUT}/05-mano-elegida.png`, fullPage: true });
  await manoPistero.close();

  // Mano de una mesa votante (mesa 2): 2 cartas + voto secreto.
  const manoVotante = await popup(() => page.locator('button:has-text("Abrir mano")').nth(1).click());
  track(manoVotante, 'mano-votante');
  for (let i = 0; i < 2; i++) {
    await manoVotante.locator('button[class*="aspect-"]').nth(i).click();
    await manoVotante.click('button:has-text("Elegir esta carta")');
  }
  await manoVotante.waitForSelector('text=Cartas elegidas');
  await manoVotante.click('button:has-text("3")');
  await manoVotante.waitForSelector('text=Voto guardado');
  await manoVotante.click('button:has-text("Mostrar voto")');
  await manoVotante.screenshot({ path: `${OUT}/06-mano-voto.png`, fullPage: true });
  await manoVotante.close();

  // Panel: jugar las cartas necesarias de cada mesa.
  const bloques = page.locator('div.bg-white.rounded-2xl.border.p-4:has(button:has-text("Abrir mano"))');
  const n = await bloques.count();
  log.push(`[info] bloques de mesa: ${n}`);
  for (let i = 0; i < n; i++) {
    const bloque = bloques.nth(i);
    const texto = await bloque.innerText();
    const necesarias = Number(/Juega (\d)/.exec(texto)?.[1] ?? 1);
    for (let k = 0; k < necesarias; k++) {
      await bloque.locator('button[class*="aspect-"]').nth(k).click();
    }
  }
  await page.fill('input[placeholder^="Pista"]', 'Un viaje sin mapa');
  await page.screenshot({ path: `${OUT}/07-jugadas.png`, fullPage: true });
  await page.click('button:has-text("Mezclar y montar la mesa")');
  await page.waitForSelector('text=recoge los votos');

  const tablero = await popup(() => page.click('button:has-text("Abrir tablero")'));
  track(tablero, 'tablero');
  await tablero.screenshot({ path: `${OUT}/08-tablero-votacion.png`, fullPage: true });
  log.push(`[info] cartas en el tablero: ${await tablero.locator('button[class*="aspect-"]').count()} (esperado 5)`);
  await tablero.locator('button[class*="aspect-"]').first().click();
  await tablero.waitForSelector('text=toca para volver');
  await tablero.screenshot({ path: `${OUT}/09-tablero-zoom.png` });
  await tablero.close();

  const votacion = page.locator('section', { hasText: 'recoge los votos' });
  const bloquesVoto = votacion.locator('div.bg-white.rounded-2xl.border.p-4:has(p.font-bold)');
  const nv = await bloquesVoto.count();
  log.push(`[info] mesas votantes: ${nv} (esperado 2)`);
  for (let i = 0; i < nv; i++) {
    const bloque = bloquesVoto.nth(i);
    log.push(`[info] votante ${i}: ${await bloque.locator('button[disabled]').count()} slots propios tachados (esperado 2)`);
    await bloque.locator('button:not([disabled])').first().click();
  }
  await page.screenshot({ path: `${OUT}/10-votos.png`, fullPage: true });
  await page.click('button:has-text("Revelar y puntuar")');
  await page.waitForSelector('text=Resultado de la ronda');
  await page.screenshot({ path: `${OUT}/11-resultado.png`, fullPage: true });

  const revelado = await popup(() => page.click('button:has-text("Abrir revelado")'));
  track(revelado, 'revelado');
  await revelado.screenshot({ path: `${OUT}/12-tablero-revelado.png`, fullPage: true });
  await revelado.close();

  await page.click('button:has-text("Siguiente ronda")');
  await page.waitForSelector('text=Ronda 2');
  await page.screenshot({ path: `${OUT}/13-ronda2.png`, fullPage: true });
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
