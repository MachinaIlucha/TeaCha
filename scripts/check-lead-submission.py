"""Regression checks for lead requests. All API calls are intercepted locally."""
import argparse
import json
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url', default='http://127.0.0.1:4325/')
args = parser.parse_args()
report = []

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    page = browser.new_page(reduced_motion='reduce')
    page.add_init_script('''
      window.leadBindings = {};
      const original = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'submit' && this.id) window.leadBindings[this.id] = (window.leadBindings[this.id] || 0) + 1;
        return original.call(this, type, listener, options);
      };
    ''')
    requests = []
    failure = False

    def mock_lead(route):
        requests.append(route.request.post_data_json)
        route.fulfill(status=502 if failure else 200, content_type='application/json',
                      body='{"ok":false,"code":"UPSTREAM"}' if failure else '{"ok":true}')

    page.route('**/api/lead', mock_lead)

    def load():
        requests.clear()
        page.goto(args.url, wait_until='networkidle')
        # Reproduce Astro's repeated initialization on the original layout.
        page.evaluate("document.dispatchEvent(new Event('astro:page-load'))")
        assert page.evaluate('window.leadBindings.consultForm') == 2, page.evaluate('window.leadBindings')

    def fill(form_id='consultForm', name='Перевірка'):
        form = page.locator(f'#{form_id}')
        form.locator('input[name="name"]').fill(name)
        form.locator('input[name="contact"]').fill('@teacha_test')
        consent = form.locator('input[name="consent"]')
        consent.focus()
        page.keyboard.press('Space')
        expect(consent).to_be_checked()
        return form

    def open_modal():
        page.locator('[data-open-modal]').first.click()

    load()
    open_modal()
    form = fill()
    form.locator('button[type="submit"]').click()
    expect(form.locator('button[type="submit"]')).to_be_enabled(timeout=5000)
    assert requests == [{'name':'Перевірка','contact':'@teacha_test','source':'modal'}], requests
    report.append('One click sends exactly one modal request after repeated initialization')

    load()
    open_modal()
    form = fill()
    page.evaluate('''() => {
      const form = document.getElementById('consultForm');
      for (let i = 0; i < 3; i++) form.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
    }''')
    expect(form.locator('button[type="submit"]')).to_be_enabled(timeout=5000)
    assert len(requests) == 1, requests
    report.append('Three rapid submit events create only one request')

    load()
    open_modal()
    form = fill(name='ABC123')
    form.locator('button[type="submit"]').click()
    page.wait_for_timeout(150)
    assert not requests, requests
    report.append('Custom validation rejects invalid data without sending it')

    load()
    failure = True
    open_modal()
    form = fill()
    form.locator('button[type="submit"]').click()
    expect(form.locator('button[type="submit"]')).to_be_enabled(timeout=5000)
    assert len(requests) == 1, requests
    failure = False
    form.locator('button[type="submit"]').click()
    expect(form.locator('button[type="submit"]')).to_be_enabled(timeout=5000)
    assert len(requests) == 2, requests
    report.append('A failed request can be retried; each attempt sends once')

    load()
    form = fill('start-lead-form')
    form.locator('button[type="submit"]').click()
    expect(form.locator('button[type="submit"]')).to_be_enabled(timeout=5000)
    assert len(requests) == 1 and requests[0]['source'] == 'start-lead', requests
    form = fill('start-lead-form', name='Олена')
    form.locator('button[type="submit"]').click()
    expect(form.locator('button[type="submit"]')).to_be_enabled(timeout=5000)
    assert len(requests) == 2 and requests[-1]['name'] == 'Олена', requests
    report.append('A later legitimate application is accepted normally')

    load()
    if page.locator('#footer-lead-form').count():
        form = fill('footer-lead-form')
        form.locator('button[type="submit"]').click()
        expect(form.locator('button[type="submit"]')).to_be_enabled(timeout=5000)
        assert len(requests) == 1 and requests[0]['source'] == 'footer-lead', requests
        report.append('Original footer form sends once')

    browser.close()

print(json.dumps({'url': args.url, 'checks': report, 'result':'ok'}, ensure_ascii=False))
