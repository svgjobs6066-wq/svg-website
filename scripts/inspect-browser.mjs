import {chromium} from '@playwright/test';
const browser=await chromium.launch();const page=await browser.newPage();
page.on('pageerror',error=>console.log('PAGE_ERROR',error.message));
page.on('console',msg=>{if(msg.type()==='error')console.log('CONSOLE_ERROR',msg.text().slice(0,1200));});
await page.goto('http://localhost:3000/');await page.waitForTimeout(3000);
console.log('HEADING',await page.locator('h1').textContent());
await browser.close();
