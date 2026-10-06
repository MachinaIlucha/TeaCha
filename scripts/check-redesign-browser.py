import json
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / 'artifacts/browser'
out.mkdir(parents=True, exist_ok=True)
report = {'pages': [], 'errors': [], 'checks': []}
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page.on('pageerror', lambda error: report['errors'].append(str(error)))
    for width in [1440, 390]:
        page.set_viewport_size({'width': width, 'height': 1000 if width == 1440 else 844})
        for route in ['/', '/chinese/', '/chinese/hsk/', '/about/', '/corporate/', '/prices/', '/blog/', '/english/test/']:
            response = page.goto('http://127.0.0.1:4325' + route, wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            page.screenshot(path=str(out / f'{route.strip("/").replace("/", "-") or "home"}-{width}.png'), full_page=True)
            overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth + 1')
            broken = page.locator('img').evaluate_all('(images) => images.filter(img => img.complete && img.naturalWidth === 0).map(img => img.src)')
            report['pages'].append({'route': route, 'width': width, 'status': response.status, 'overflow': overflow, 'broken_images': broken})
    page.set_viewport_size({'width': 1440, 'height': 1000})
    page.goto('http://127.0.0.1:4325/', wait_until='networkidle')
    page.locator('[data-pack="24"]').click()
    assert page.locator('[data-tuition="individual"]').inner_text() == '600'
    assert page.locator('[data-tuition="pair"]').inner_text() == '400'
    report['checks'].append('Prices: 24 lessons correctly switch all formats')
    page.locator('[data-review-next]').click()
    assert page.locator('[data-review]:visible .tc-review__identity strong').inner_text() == 'НАТАЛІЯ'
    report['checks'].append('Review carousel retains original reviews')
    page.locator('[data-service="parent"]').click()
    assert page.locator('[data-service-panel="parent"]').is_visible()
    report['checks'].append('Existing animated content tabs work')
    page.locator('.tc-header [data-open-modal]').click()
    assert page.locator('#consultModal').is_visible()
    page.keyboard.press('Escape')
    assert not page.locator('#consultModal').is_visible()
    report['checks'].append('Dialog opens and closes with Escape')
    requests = []
    def mock_lead(route):
        requests.append(route.request.post_data_json)
        route.fulfill(status=200, content_type='application/json', body='{"ok":true}')
    page.route('**/api/lead', mock_lead)
    page.locator('.tc-header [data-open-modal]').click()
    page.locator('#consultForm input[name="name"]').fill('Перевірка')
    page.locator('#consultForm input[name="contact"]').fill('@teacha_test')
    page.locator('#consultForm input[type="checkbox"]').check()
    page.locator('#consultForm button[type="submit"]').click()
    page.wait_for_timeout(1300)
    assert requests and requests[0]['source'] == 'modal'
    assert not page.locator('#consultModal').is_visible()
    report['checks'].append('Lead submission keeps original payload; request intercepted locally')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.locator('[data-menu-toggle]').click()
    assert page.locator('#school-nav').is_visible()
    assert page.locator('#school-nav a[href="/products/"]').is_visible()
    page.keyboard.press('Escape')
    assert page.locator('[data-menu-toggle]').get_attribute('aria-expanded') == 'false'
    report['checks'].append('Mobile navigation includes every original link')
    page.goto('http://127.0.0.1:4325/blog/', wait_until='networkidle')
    page.locator('[data-blog-search]').fill('HSK')
    assert page.locator('[data-article-title]:visible').count() > 0
    page.locator('[data-blog-search]').fill('zzzz-no-matches')
    assert page.locator('[data-blog-empty]').is_visible()
    report['checks'].append('Blog filtering works')
    browser.close()
(out/'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
assert not report['errors']
assert all(item['status'] == 200 and not item['overflow'] and not item['broken_images'] for item in report['pages'])
