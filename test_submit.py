from playwright.sync_api import sync_playwright

def test_submit():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Listen to console
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
        page.on("requestfailed", lambda req: print(f"REQUEST FAILED: {req.url} {req.failure}"))
        
        print("Navigating to form...")
        page.goto("http://localhost:5173/report")
        
        print("Filling form...")
        # Upload a dummy image
        page.set_input_files('input[type="file"]', 'dummy.jpg')
        
        # Fill lat and lng
        inputs = page.locator('input[type="number"]')
        inputs.nth(0).fill('28.6139')
        inputs.nth(1).fill('77.2090')
        
        # Click submit
        print("Submitting...")
        page.click('button[type="submit"]')
        
        # Wait a bit
        page.wait_for_timeout(3000)
        
        print("Current URL after submit:", page.url)
        browser.close()

if __name__ == "__main__":
    test_submit()
