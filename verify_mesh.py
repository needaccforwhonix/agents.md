from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print("Navigating to /mesh...")
            page.goto("http://localhost:3000/mesh", timeout=60000)

            # Wait for title
            print("Waiting for title...")
            # Title might be "Agents.md" or "Agent Mesh Simulation" depending on implementation
            # page.wait_for_function("document.title.includes('Agent')")

            # Wait for agents to appear
            print("Waiting for agents...")
            page.wait_for_selector("text=ID:", timeout=30000)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="mesh_verification.png", full_page=True)
            print("Screenshot saved to mesh_verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="mesh_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
