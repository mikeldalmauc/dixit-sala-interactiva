// Smoke test de un ciclo completo de ronda (reparto, mano, carta aislada,
// jugar, montar pared, votar, revelar/puntuar, siguiente ronda).
//
// Uso: con el contenedor de dev levantado (docker compose up -d --build dev,
// sirviendo en el puerto 3000 del host), ejecutar desde este directorio:
//   docker run --rm --network dixit-euskadi_default -v "${PWD}/.verify:/work" \
//     -w /work mcr.microsoft.com/playwright:v1.48.0-jammy node test.mjs
// (la primera vez instala el paquete "playwright" dentro del contenedor:
//   ...same image... sh -c "npm install playwright@1.48.0 --no-save && node test.mjs")
// Capturas y log de errores quedan en .verify/out/.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://host.docker.internal:3000/dixit-euskadi/#';
const OUT = '/work/out';
fs.mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[page] ${msg.text()}`);
});
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));

function trackPage(p) {
  p.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[popup] ${msg.text()}`);
  });
  p.on('pageerror', (err) => errors.push(`[popup-pageerror] ${err.message}`));
}

async function run() {
  const resp = await page.goto(BASE + '/', { timeout: 20000 });
  errors.push(`[info] goto status: ${resp ? resp.status() : 'null'}`);
  await page.waitForTimeout(1000);
  errors.push(`[info] title: ${await page.title()}`);
  await page.screenshot({ path: `${OUT}/00-raw.png` });

  await page.waitForSelector('text=Non Dago?', { timeout: 15000 });
  await page.screenshot({ path: `${OUT}/01-inicio.png` });

  await page.click('button:has-text("3")');
  await page.click('button:has-text("Iniciar partida")');
  await page.waitForSelector('text=Pistero de esta ronda');
  await page.screenshot({ path: `${OUT}/02-panel.png`, fullPage: true });

  const abrirManoBtn = page.locator('button:has-text("Abrir mano")').first();
  const [manoPage] = await Promise.all([context.waitForEvent('page'), abrirManoBtn.click()]);
  trackPage(manoPage);
  await manoPage.waitForLoadState();
  await manoPage.waitForTimeout(300);
  await manoPage.screenshot({ path: `${OUT}/03-mano.png`, fullPage: true });

  const primeraCarta = manoPage.locator('button').first();
  const [cartaPage] = await Promise.all([context.waitForEvent('page'), primeraCarta.click()]);
  trackPage(cartaPage);
  await cartaPage.waitForLoadState();
  await cartaPage.waitForTimeout(300);
  await cartaPage.screenshot({ path: `${OUT}/04-carta.png` });
  await cartaPage.close();
  await manoPage.close();

  const mesaBlocks = page.locator('div.p-4.bg-white, div.bg-white.rounded-2xl.border.p-4');
  const count = await mesaBlocks.count();
  errors.push(`[info] mesaBlocks encontrados: ${count}`);
  for (let i = 0; i < count; i++) {
    const block = mesaBlocks.nth(i);
    const thumb = block.locator('button:not(:has-text("Abrir mano"))').first();
    if (await thumb.count()) {
      await thumb.click();
    }
  }
  await page.screenshot({ path: `${OUT}/05-jugadas.png`, fullPage: true });

  await page.click('button:has-text("Montar la pared")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/06-votacion-panel.png`, fullPage: true });

  const abrirParedBtn = page.locator('button:has-text("Abrir pared")');
  const [paredPage] = await Promise.all([context.waitForEvent('page'), abrirParedBtn.click()]);
  trackPage(paredPage);
  await paredPage.waitForLoadState();
  await paredPage.waitForTimeout(400);
  await paredPage.screenshot({ path: `${OUT}/07-pared-votacion.png`, fullPage: true });

  const selects = page.locator('select');
  const selectCount = await selects.count();
  errors.push(`[info] selects de voto encontrados: ${selectCount}`);
  for (let i = 0; i < selectCount; i++) {
    await selects.nth(i).selectOption('0');
  }
  await page.screenshot({ path: `${OUT}/08-votos.png`, fullPage: true });

  await page.click('button:has-text("Revelar y puntuar")');
  await page.waitForSelector('text=Resultado');
  await page.screenshot({ path: `${OUT}/09-resultado.png`, fullPage: true });

  await paredPage.reload();
  await paredPage.waitForTimeout(400);
  await paredPage.screenshot({ path: `${OUT}/10-pared-revelada.png`, fullPage: true });
  await paredPage.close();

  await page.click('button:has-text("Siguiente ronda")');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/11-siguiente-ronda.png`, fullPage: true });
}

try {
  await run();
  errors.push('[info] flujo completo terminado sin excepciones');
} catch (e) {
  errors.push(`[fatal] ${e.message}`);
  try {
    await page.screenshot({ path: `${OUT}/99-error.png`, fullPage: true });
  } catch {}
} finally {
  fs.writeFileSync(`${OUT}/errors.txt`, errors.join('\n') || '(sin errores de consola)');
  console.log(errors.join('\n'));
  await browser.close();
}
