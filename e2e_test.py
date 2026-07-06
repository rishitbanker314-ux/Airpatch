import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            geolocation={"latitude": 28.6139, "longitude": 77.2090},
            permissions=["geolocation"]
        )
        page = await context.new_page()
        
        # We'll use the localhost dev server running the frontend
        print("Navigating to Home...")
        await page.goto("http://localhost:4173")
        
        print("Navigating to Report Page...")
        # Since the Map might fail if localhost wasn't added to API Key restrictions, 
        # let's go straight to the report URL
        await page.goto("http://localhost:4173/report")
        
        # Wait for the report form to load
        await page.wait_for_selector('input[type="file"]')
        
        print("Uploading mock image...")
        # create a dummy image to upload
        import os
        with open("dummy.jpg", "wb") as f:
            f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x08\x01\x01\x00\x00?\x00\x00\xff\xd9')
        
        await page.locator('input[type="file"]').set_input_files("dummy.jpg")
        
        print("Filling out form...")
        await page.locator('select').select_option(label="Industrial Smoke")
        
        # Click "Use Current Location"
        await page.locator('button', has_text="Use Current Location").click()
        await page.wait_for_timeout(1000) # wait for location to update
        
        print("Submitting form...")
        await page.locator('button', has_text="Submit Report").click()
        
        # Wait for submission and redirection to report detail
        try:
            print("Successfully submitted! Waiting for AI processing...")
            # We wait up to 20 seconds for the backend to process
            await page.wait_for_selector('text="AI Verification"', timeout=20000)
            print("AI Verification completed successfully!")
            
            # Check context enrichment
            await page.wait_for_selector('text="Environmental Context"', timeout=5000)
            print("Context enrichment completed successfully!")
            print("Report URL:", page.url)
        except Exception as e:
            print("Failed to submit, redirect, or complete backend processing:", e)
            await page.screenshot(path="e2e_error.webp")
            await browser.close()
            return
        
        await page.screenshot(path="e2e_success.webp")
        await browser.close()

asyncio.run(run())
