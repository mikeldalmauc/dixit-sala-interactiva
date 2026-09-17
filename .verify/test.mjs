// Smoke test con 4 mesas: mano (abrir carta, girarla con el ojo, eliminar y
// deshacer), cartas de voto (girar, abrir oculta, auto-ocultar en la mano,
// revelar), sacar carta del mazo y siguiente ronda.
//
// Uso: con el contenedor de dev levantado (docker compose up -d --build dev,
// puerto 3002 del host), ejecutar desde la raíz del repo:
//   docker run --rm -v "${PWD}/.verify:/work" -w /work \
//     mcr.microsoft.com/playwright:v1.48.0-jammy \
//     sh -c "npm install playwright@1.48.0 --no-save >/dev/null 2>&1 && node test.mjs"
// Capturas y log quedan en .verify/out/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE ?? 'http://host.docker.internal:3002/dixit-sala-interactiva/#';
const OUT = '/work/out';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const check = (nombre, real, esperado) =>
  log.push(`[${String(real) === String(esperado) ? 'ok' : 'FALLO'}] ${nombre}: ${real} (esperado ${esperado})`);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });

function track(p, tag) {
  p.on('console', (msg) => msg.type() === 'error' && !msg.text().includes('WebSocket') && log.push(`[${tag}] ${msg.text()}`));
  p.on('pageerror', (err) => !err.message.includes('WebSocket') && log.push(`[${tag}-pageerror] ${err.message}`));
}

async function popup(action, tag) {
  const [p] = await Promise.all([context.waitForEvent('page'), action()]);
  track(p, tag);
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
  await page.click('button:has-text("Iniciar partida")');
  await page.waitForSelector('text=Pistero:');
  check('mazo inicial', await mazo(), 24);
  await page.screenshot({ path: `${OUT}/01-panel.png`, fullPage: true });

  // --- Mano: abrir carta, girarla, eliminar y deshacer ---
  const mano = await popup(() => page.locator('button:has-text("Ver mano")').nth(1).click(), 'mano');
  const cartasMano = mano.locator('button[class*="aspect-"]');
  check('cartas en la mano', await cartasMano.count(), 6);

  const carta = await popup(() => cartasMano.first().click(), 'carta');
  check('carta abre sin mesa visible', await carta.locator('text=Mesa 2').count(), 0);
  await carta.screenshot({ path: `${OUT}/02-carta-oculta.png` });
  await carta.click('button[aria-label="Revelar"]');
  check('carta girada muestra la mesa', await carta.locator('text=Mesa 2').count(), 1);
  check('carta girada sigue mostrando la imagen', await carta.locator('img').count(), 1);
  await carta.screenshot({ path: `${OUT}/03-carta-revelada.png` });
  await carta.click('button[aria-label="Ocultar"]');
  check('carta vuelve a ocultar la mesa', await carta.locator('text=Mesa 2').count(), 0);
  await carta.close();

  await mano.locator('button[aria-label="Eliminar carta de la mano"]').first().click();
  await mano.screenshot({ path: `${OUT}/04-mano-confirmar.png`, fullPage: true });
  await mano.click('button:has-text("Eliminar")');
  check('cartas tras eliminar', await cartasMano.count(), 5);
  await mano.reload();
  await mano.waitForTimeout(400);
  check('eliminación persiste al recargar', await cartasMano.count(), 5);
  await mano.screenshot({ path: `${OUT}/05-mano-eliminada.png`, fullPage: true });
  await mano.click('button:has-text("Deshacer")');
  check('cartas tras deshacer', await cartasMano.count(), 6);
  await mano.close();

  // --- Cartas de voto ---
  const votos = await popup(() => page.locator('button:has-text("Cartas de voto")').nth(1).click(), 'votos');
  const cartasVoto = votos.locator('button[class*="aspect-"]');
  check('cartas de voto', await cartasVoto.count(), 4);
  check('la mano de votos muestra los números', (await cartasVoto.allInnerTexts()).map((t) => t.replace(/\D+/g, '').slice(-1)).join(','), '1,2,3,4');
  await votos.screenshot({ path: `${OUT}/06-votos.png`, fullPage: true });

  const voto = await popup(() => cartasVoto.nth(2).click(), 'voto');
  log.push(`[info] url voto: ${voto.url()}`);
  check('voto abre oculto', await voto.locator('text=Vota la carta').count(), 0);
  check('voto oculto muestra la mesa', await voto.locator('text=Mesa 2').count(), 1);
  await voto.screenshot({ path: `${OUT}/08-voto-oculto.png` });
  await voto.click('button[aria-label="Revelar"]');
  check('voto revelado muestra el número', await voto.locator('text=/^3$/').count(), 1);
  check('voto revelado muestra la mesa', await voto.locator('text=Mesa 2').count(), 1);
  await voto.screenshot({ path: `${OUT}/09-voto-revelado.png` });
  await voto.click('button[aria-label="Ocultar"]');
  check('voto se puede volver a ocultar', await voto.locator('text=Vota la carta').count(), 0);
  await voto.close();
  await votos.close();

  // --- Mazo ---
  const sacada = await popup(() => page.locator('button:has-text("Sacar carta")').nth(0).click(), 'sacada');
  check('carta sacada lleva mesa (tiene ojo)', await sacada.locator('button[aria-label="Revelar"]').count(), 1);
  await sacada.close();
  check('mazo tras sacar', await mazo(), 23);

  await page.click('button:has-text("Siguiente ronda")');
  await page.waitForSelector('text=Ronda 2');
  check('mazo tras ronda', await mazo(), 19);
  check('cartas por repartir', await page.locator('button:has-text("Abrir carta")').count(), 4);
  await page.screenshot({ path: `${OUT}/10-ronda2.png`, fullPage: true });
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
