const fs = require("fs/promises");
const puppeteer = require("puppeteer");
const cron = require("node-cron");

async function start() {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto("https://learnwebcode.github.io/practice-requests/");
  await page.screenshot({ path: "teste.png", fullPage: true });

  // seleciona os nomes dos animais
  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".info strong")).map(
      (x) => x.textContent
    );
  });

  await page.click("#clickme");
  const clickedData = await page.$eval("#data", (el) => el.textContent);
  console.log(clickedData);

  //seleciona as fotos dos animais
  const photos = await page.$$eval("img", (imgs) => {
    return imgs.map((x) => x.src);
  });

  await page.type("#ourfield", "blue");

  await Promise.all([page.click("#ourform button"), page.waitForNavigation()]);

  const info = await page.$eval("#message", (el) => el.textContent);

  console.log(info);

  for (const photo of photos) {
    const imagepage = await page.goto(photo);
    await fs.writeFile(photo.split("/").pop(), await imagepage.buffer());
  }

  await fs.writeFile("names.txt", names.join("\r\n"));

  await browser.close();
}

cron.schedule("*/5 * * * * *", start);
