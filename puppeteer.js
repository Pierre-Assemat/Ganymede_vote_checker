require('dotenv').config();
const puppeteer = require('puppeteer');


/**
 * Main process
 */

// Options
const HEADLESS = false; // Need to be set to false in order to work
const SLOWMO = 60;
const VISIBLE = !HEADLESS;

const creds = {
  login: process.env.LOGIN,
  pwd: process.env.PASSWORD,
};

puppeteer.launch({headless: HEADLESS, slowMo: SLOWMO}).then(async browser => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 })

  await login(page, creds);
  await isVoteReady(page, 'rpg');
  await isVoteReady(page, 'sp');

  await browser.close();
});

async function login(page, creds) {
  const url = 'https://ganymede.ws/account/vote'

  console.log(`Navigate to ${url}`);
  await page.goto('https://ganymede.ws/account/vote');
  await page.waitForSelector('#login_form', { visible: VISIBLE });

  // Pseudo
  const now = new Date();
  console.log(`Logging in: "${creds.login}" at ${now.getHours()}:${now.getMinutes()}!`);
  await page.waitForSelector('#account', { visible: VISIBLE });
  await page.type('#account', creds.login);

  // Pwd
  await page.waitForSelector('#password', { visible: VISIBLE });
  await page.type('#password', creds.pwd);

  await page.click('#login-btn');
  await page.waitForSelector('.blog-item');
}

async function isVoteReady(page, platform) {
  if(await page.$(`#${platform} > .alert.error`)) {
    const nbMinutes = await page.evaluate(
      platform => document.querySelector(`#${platform} > .alert.error`).textContent.match(/\d+/g)[0], 
      platform);
    console.log(`${platform} -- Vote not ready yet, it will be ready in ${nbMinutes} minutes`);
  } else {
    console.log(`Vote for ${platform} is available`)
  }
}
