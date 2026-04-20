import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        filepath = f"file://{os.getcwd()}/docs/pricing.html"

        # PC View
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        await page.goto(filepath)
        await page.add_style_tag(content="[data-aos] { opacity: 1 !important; transform: none !important; }")
        await page.evaluate("window.scrollTo(0, 800)")
        await page.wait_for_timeout(500)
        await page.screenshot(path="verify_pc_sync.png")

        # Mobile View
        context = await browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        mobile_page = await context.new_page()
        await mobile_page.goto(filepath)
        await mobile_page.add_style_tag(content="[data-aos] { opacity: 1 !important; transform: none !important; }")

        # Scroll to cards
        await mobile_page.locator(".comparison-wrapper").scroll_into_view_if_needed()
        await mobile_page.evaluate("document.querySelector('.comparison-wrapper').scrollLeft = 200")
        await mobile_page.wait_for_timeout(500)
        # Full page screenshot of comparison section
        await mobile_page.locator(".comparison-wrapper").screenshot(path="verify_mobile_scrolled.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
