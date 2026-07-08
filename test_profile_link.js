const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000); // wait for load
  
  // click Impact Profile
  console.log("Looking for Impact Profile link...");
  const impactProfileLink = await page.$('a[href="/profile"]');
  if (impactProfileLink) {
      console.log("Found link. Clicking...");
      await impactProfileLink.click();
      await page.waitForTimeout(2000);
      console.log("Current URL is:", page.url());
      await page.screenshot({path: 'impact_profile_click.png'});
  } else {
      console.log("Could not find Impact Profile link");
      await page.screenshot({path: 'landing_page_no_link.png'});
  }
  await browser.close();
})();
