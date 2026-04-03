from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    print("Navigating to /mesh...")
    page.goto("http://localhost:3000/mesh")

    print("Waiting for canvas...")
    page.wait_for_selector("div.grid")

    print("Starting simulation...")
    page.get_by_role("button", name="Start").click()

    print("Waiting for agents to act...")
    page.wait_for_timeout(5000)

    print("Taking screenshot...")
    page.screenshot(path="verification/mesh_simulation_structured.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
