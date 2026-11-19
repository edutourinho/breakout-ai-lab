import { test, expect } from '@playwright/test';

async function paddleCenter(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('#game');
    const ctx = canvas.getContext('2d');
    const startY = Math.floor(canvas.height * 0.86);
    const height = canvas.height - startY;
    const data = ctx.getImageData(0, startY, canvas.width, height).data;
    let minX = canvas.width;
    let maxX = -1;

    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      if (blue > 190 && green > 140 && blue - red > 40 && green - red > 20) {
        const x = (index / 4) % canvas.width;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }

    return maxX < 0 ? null : (minX + maxX) / (2 * canvas.width);
  });
}

async function holdTouch(page, selector, duration) {
  const button = page.locator(selector);
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  if (!box) throw new Error('Botão de toque não encontrado');
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 }]
    });
    await page.waitForTimeout(duration);
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } finally {
    await session.detach();
  }
}

test('teclado inicia, move, lança, pausa, retoma e reinicia a partida', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Breakout', level: 1 })).toBeVisible();
  await expect(page.locator('#status')).toHaveText('Pronto');
  await page.getByRole('button', { name: 'Começar jogo', exact: true }).click();

  await expect(page.locator('#status')).toHaveText('Em jogo');
  await expect(page.locator('#overlay')).toBeHidden();
  await expect(page.locator('#launch')).toBeEnabled();

  const centered = await paddleCenter(page);
  expect(centered).not.toBeNull();

  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(300);
  await page.keyboard.up('ArrowLeft');
  const afterLeft = await paddleCenter(page);
  expect(afterLeft).toBeLessThan(centered - 0.05);

  await page.keyboard.down('d');
  await page.waitForTimeout(300);
  await page.keyboard.up('d');
  const afterRight = await paddleCenter(page);
  expect(afterRight).toBeGreaterThan(afterLeft + 0.05);

  await page.keyboard.press('Space');
  await expect(page.locator('#hint')).toHaveText('Espaço pausa o jogo.');
  await page.keyboard.press('Space');
  await expect(page.locator('#status')).toHaveText('Pausado');
  await expect(page.locator('#overlay')).toBeVisible();

  await page.getByRole('button', { name: 'Retomar', exact: true }).click();
  await expect(page.locator('#status')).toHaveText('Em jogo');

  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await expect(page.locator('#status')).toHaveText('Pausado');
  await page.getByRole('button', { name: 'Retomar jogo', exact: true }).click();
  await expect(page.locator('#status')).toHaveText('Em jogo');

  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(200);
  await page.keyboard.up('ArrowLeft');
  expect(await paddleCenter(page)).toBeLessThan(0.5);

  await page.getByRole('button', { name: 'Reiniciar', exact: true }).click();
  await expect(page.locator('#status')).toHaveText('Em jogo');
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.locator('#lives')).toHaveText('3');
  await expect(page.locator('#launch')).toBeEnabled();
  await page.waitForTimeout(250);
  expect(Math.abs((await paddleCenter(page)) - 0.5)).toBeLessThan(0.03);

  expect(errors).toEqual([]);
});

test('controles de toque movem a raquete em telas sensíveis', async ({ page, hasTouch }) => {
  test.skip(!hasTouch, 'executado apenas no projeto móvel');
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');

  await page.getByRole('button', { name: 'Começar jogo', exact: true }).tap();
  await expect(page.locator('#status')).toHaveText('Em jogo');

  const centered = await paddleCenter(page);
  await holdTouch(page, '#touch-left', 320);
  const afterLeft = await paddleCenter(page);
  expect(afterLeft).toBeLessThan(centered - 0.05);

  await holdTouch(page, '#touch-right', 320);
  const afterRight = await paddleCenter(page);
  expect(afterRight).toBeGreaterThan(afterLeft + 0.05);

  await page.getByRole('button', { name: 'Lançar bola', exact: true }).tap();
  await expect(page.locator('#launch')).toBeDisabled();
  await expect(page.locator('#hint')).toHaveText('Espaço pausa o jogo.');
  await page.getByRole('button', { name: 'Pausar', exact: true }).tap();
  await expect(page.locator('#status')).toHaveText('Pausado');
  await page.getByRole('button', { name: 'Retomar jogo', exact: true }).tap();
  await expect(page.locator('#status')).toHaveText('Em jogo');
  await page.getByRole('button', { name: 'Reiniciar', exact: true }).tap();
  await expect(page.locator('#launch')).toBeEnabled();

  expect(errors).toEqual([]);
});

test('perda de foco pausa a partida e libera os controles', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Começar jogo', exact: true }).click();

  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(120);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.keyboard.up('ArrowLeft');

  await expect(page.locator('#status')).toHaveText('Pausado');
  const pausedPosition = await paddleCenter(page);
  await page.waitForTimeout(250);
  expect(Math.abs((await paddleCenter(page)) - pausedPosition)).toBeLessThan(0.01);

  await page.getByRole('button', { name: 'Retomar', exact: true }).click();
  await expect(page.locator('#status')).toHaveText('Em jogo');
  const resumedPosition = await paddleCenter(page);
  await page.waitForTimeout(250);
  expect(Math.abs((await paddleCenter(page)) - resumedPosition)).toBeLessThan(0.01);
});

test('pausa libera uma seta mantida pressionada antes de retomar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Começar jogo', exact: true }).click();
  await page.keyboard.press('Space');
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(80);
  await page.keyboard.press('Space');
  await expect(page.locator('#status')).toHaveText('Pausado');
  await page.getByRole('button', { name: 'Retomar jogo', exact: true }).click();
  const position = await paddleCenter(page);
  await page.waitForTimeout(200);
  expect(Math.abs((await paddleCenter(page)) - position)).toBeLessThan(0.01);
  await page.keyboard.up('ArrowLeft');
});

