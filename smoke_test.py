import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Track console errors
        page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))
        
        # Track failed network requests
        page.on("requestfailed", lambda req: print(f"Request failed: {req.url}"))
        page.on("response", lambda res: print(f"Response {res.status}: {res.url}") if res.status >= 400 else None)

        print("Navigating to Dashboard...")
        await page.goto("http://localhost:4173/")
        await page.wait_for_timeout(2000)

        print("Navigating to Maps...")
        await page.goto("http://localhost:4173/map")
        await page.wait_for_timeout(2000)

        print("Navigating to Reports...")
        await page.goto("http://localhost:4173/reports")
        await page.wait_for_timeout(2000)
        
        await browser.close()

asyncio.run(run())
