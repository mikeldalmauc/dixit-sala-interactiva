// Smoke test con 3 mesas: reparto (mano -> carta en página independiente),
// miniatura del panel -> carta, sacar carta del mazo, siguiente ronda con
// cartas nuevas por repartir y cambio de pistero.
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
const mazo = async () => /Mazo: (\d+)/.exec(await page.locator('text=/Mazo: \\d+/').innerText())?.[1];

async function run() {
  await page.goto(BASE + '/', { timeout: 20000 });
  await page.waitForSelector('text=Dixit · Sala interactiva', { timeout: 15000 });
  await page.screenshot({ path: `${OUT}/01-config.png` });

  await page.click('button:has-text("3")');
  await page.click('button:has-text("Iniciar partida")');
  await page.waitForSelector('text=Pistero:');
  log.push(`[info] mazo inicial: ${await mazo()} (esperado 27)`);
  await page.screenshot({ path: `${OUT}/02-panel.png`, fullPage: true });

  const mano = await popup(() => page.locator('button:has-text("Ver mano")').nth(0).click());
  track(mano, 'mano');
  await mano.screenshot({ path: `${OUT}/03-mano.png`, fullPage: true });
  const carta = await popup(() => mano.locator('button[class*="aspect-"]').first().click());
  track(carta, 'carta');
  log.push(`[info] url carta desde mano: ${carta.url()}`);
  await carta.screenshot({ path: `${OUT}/04-carta.png` });
  await carta.close();
  await mano.close();

  const desdePanel = await popup(() => page.locator('button[class*="aspect-"]').first().click());
  log.push(`[info] url carta desde miniatura del panel: ${desdePanel.url()}`);
  await desdePanel.close();

  const sacada = await popup(() => page.locator('button:has-text("Sacar carta")').nth(1).click());
  log.push(`[info] url carta sacada: ${sacada.url()}`);
  await sacada.close();
  log.push(`[info] mazo tras sacar: ${await mazo()} (esperado 26)`);

  await page.click('button:has-text("Siguiente ronda")');
  await page.waitForSelector('text=Ronda 2');
  await page.waitForSelector('text=Cartas sacadas del mazo');
  log.push(`[info] mazo tras ronda: ${await mazo()} (esperado 21)`);
  log.push(`[info] cartas por repartir: ${await page.locator('button:has-text("Abrir carta")').count()} (esperado 5)`);
  log.push(`[info] pistero: ${await page.locator('text=/Pistero: .*/').innerText()} (esperado Mesa 2)`);
  await page.screenshot({ path: `${OUT}/05-ronda2-repartir.png`, fullPage: true });
  const nueva = await popup(() => page.locator('button:has-text("Abrir carta")').first().click());
  await nueva.close();
  log.push(`[info] por repartir tras abrir una: ${await page.locator('button:has-text("Abrir carta")').count()} (esperado 4)`);
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
