from playwright.sync_api import sync_playwright, expect

def verify_responsive_and_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        # Capture console
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        print("Navigating to localhost:4321...")
        try:
            page.goto("http://localhost:4321")

            # Verify Splash Screen
            print("Checking Splash Screen...")
            expect(page.get_by_text("OVERCAST")).to_be_visible(timeout=10000)

            # Wait for Splash to fade (3s + fade time)
            print("Waiting for Menu...")
            page.wait_for_selector("text=READY TO", timeout=10000)

            # Verify Menu
            expect(page.get_by_text("ENTER SIMULATION")).to_be_visible()

            # Click Play
            page.get_by_text("ENTER SIMULATION").click()

            # Verify HUD appears (Game Started)
            page.wait_for_selector("text=Score", timeout=5000)

            # Take Game Screenshot
            page.screenshot(path="verification_game_v4.png")
            print("Game screenshot taken.")

        except Exception as e:
            print(f"FAILED: {e}")
            page.screenshot(path="verification_failed.png")

        browser.close()

if __name__ == "__main__":
    verify_responsive_and_flow()
