import argparse
import json
import re
import sys
import traceback
from pathlib import Path

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://127.0.0.1:4325')
base_url = parser.parse_args().url.rstrip('/')
ROUTE = '/chinese/test/'

CORRECT = [0, 1, 2, 2, 1, 3, 1, 2, 1, 0, 1, 2, 2, 1, 3, 0, 1, 2, 1, 3]
LEVELS = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]
FIRST_FAQ = 'Як безкоштовно визначити рівень китайської мови онлайн?'
SAMPLE_TEXT = '昨天我们___了一部电影。'

errors = []
checks = []


def check(fn):
    checks.append(fn)
    return fn


def wrong(index):
    return (CORRECT[index] + 1) % 4


def open_test(page):
    page.goto(base_url + ROUTE, wait_until='networkidle')
    page.evaluate('document.fonts.ready')


def run(page, answers):
    """Open the test, click Start and answer each question (None = skip)."""
    open_test(page)
    page.locator('[data-hsk-start]').click()
    page.locator('[data-hsk-screen="quiz"]').wait_for(state='visible')
    for index, answer in enumerate(answers):
        expected = f'Запитання {index + 1} із 20'
        assert page.locator('[data-hsk-counter]').inner_text() == expected, expected
        if answer is None:
            page.locator('[data-hsk-skip]').click()
        else:
            page.locator('.hsk-option').nth(answer).click()
            page.locator('[data-hsk-next]').click()
    page.locator('[data-hsk-screen="results"]').wait_for(state='visible')


def result(page):
    return (
        page.locator('[data-hsk-level]').inner_text(),
        page.locator('[data-hsk-score]').inner_text(),
        page.locator('[data-hsk-percent]').inner_text(),
    )


@check
def all_correct_is_hsk6(page):
    run(page, CORRECT)
    assert result(page) == ('HSK 6', '20 / 20', '100%'), result(page)


@check
def all_skipped_is_beginner(page):
    run(page, [None] * 20)
    assert result(page) == ('Початковий', '0 / 20', '0%'), result(page)
    assert page.locator('[data-hsk-seal]').inner_text() == '入门'
    assert page.locator('.hsk-stairs--result .hsk-step.is-reached').count() == 0
    assert 'HSK 1' in page.locator('[data-hsk-recommendation]').inner_text()


@check
def gap_stops_at_hsk1(page):
    answers = [wrong(i) if LEVELS[i] == 2 else CORRECT[i] for i in range(20)]
    run(page, answers)
    assert result(page) == ('HSK 1', '17 / 20', '85%'), result(page)


@check
def thresholds_exact_is_hsk6(page):
    answers = []
    seen = {}
    for i in range(20):
        level = LEVELS[i]
        seen[level] = seen.get(level, 0) + 1
        need = 2 if level <= 4 else 3
        answers.append(CORRECT[i] if seen[level] <= need else wrong(i))
    run(page, answers)
    assert result(page) == ('HSK 6', '14 / 20', '70%'), result(page)


@check
def next_disabled_until_answer(page):
    open_test(page)
    page.locator('[data-hsk-start]').click()
    assert page.locator('[data-hsk-next]').is_disabled()
    page.locator('.hsk-option').nth(0).click()
    assert page.locator('[data-hsk-next]').is_enabled()


@check
def blank_fills_with_choice(page):
    open_test(page)
    page.locator('[data-hsk-start]').click()
    page.locator('.hsk-option').nth(0).click()
    page.locator('[data-hsk-next]').click()
    assert page.locator('[data-hsk-counter]').inner_text() == 'Запитання 2 із 20'
    assert page.locator('[data-hsk-blank]').inner_text() == ''
    page.locator('.hsk-option').nth(1).click()
    assert page.locator('[data-hsk-blank]').inner_text() == '是'


@check
def back_restores_answer(page):
    open_test(page)
    page.locator('[data-hsk-start]').click()
    page.locator('.hsk-option').nth(0).click()
    page.locator('[data-hsk-next]').click()
    page.locator('[data-hsk-prev]').click()
    assert page.locator('[data-hsk-counter]').inner_text() == 'Запитання 1 із 20'
    assert page.locator('.hsk-option').nth(0).get_attribute('aria-pressed') == 'true'


@check
def keyboard_selects_and_advances(page):
    open_test(page)
    page.locator('[data-hsk-start]').click()
    page.keyboard.press('2')
    assert page.locator('.hsk-option').nth(1).get_attribute('aria-pressed') == 'true'
    page.keyboard.press('Enter')
    assert page.locator('[data-hsk-counter]').inner_text() == 'Запитання 2 із 20'


@check
def shortcuts_ignored_outside_card(page):
    open_test(page)
    page.locator('[data-hsk-start]').click()
    page.locator('.tc-header a').first.focus()
    page.keyboard.press('b')
    page.keyboard.press('3')
    assert page.locator('.hsk-option.is-selected').count() == 0


@check
def review_lists_20(page):
    run(page, CORRECT)
    page.locator('[data-hsk-review-toggle]').click()
    assert page.locator('.hsk-review__item').count() == 20
    assert page.locator('[data-hsk-review-toggle]').get_attribute('aria-expanded') == 'true'


@check
def restart_resets(page):
    run(page, CORRECT)
    page.locator('[data-hsk-review-toggle]').click()
    page.locator('[data-hsk-restart]').click()
    page.locator('[data-hsk-screen="quiz"]').wait_for(state='visible')
    assert page.locator('[data-hsk-counter]').inner_text() == 'Запитання 1 із 20'
    assert page.locator('.hsk-option.is-selected').count() == 0
    assert page.locator('[data-hsk-review]').inner_html() == ''
    assert page.locator('[data-hsk-review-toggle]').get_attribute('aria-expanded') == 'false'


@check
def modal_opens_from_results(page):
    run(page, CORRECT)
    page.locator('.hsk-results [data-open-modal]').click()
    assert page.locator('#consultModal').is_visible()
    page.keyboard.press('Escape')
    assert not page.locator('#consultModal').is_visible()


@check
def no_overflow(page):
    for width in [320, 390, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        open_test(page)
        probe = 'document.documentElement.scrollWidth <= innerWidth + 1'
        assert page.evaluate(probe), f'intro overflows at {width}'
        page.locator('[data-hsk-start]').click()
        assert page.evaluate(probe), f'quiz overflows at {width}'
        for index in range(20):
            page.locator('.hsk-option').nth(CORRECT[index]).click()
            page.locator('[data-hsk-next]').click()
        page.locator('[data-hsk-screen="results"]').wait_for(state='visible')
        assert page.evaluate(probe), f'results overflow at {width}'
        page.locator('[data-hsk-review-toggle]').click()
        assert page.evaluate(probe), f'review overflows at {width}'


@check
def raw_html_seo(page):
    response = page.request.get(base_url + ROUTE)
    assert response.status == 200, response.status
    html = response.text()
    assert '<h1' in html
    assert len(re.findall(r'<h1[\s>]', html)) == 1, 'expected exactly one <h1'
    assert 'https://teacha.com.ua/chinese/test/' in html and 'rel="canonical"' in html
    assert 'Рівні HSK' in html
    assert FIRST_FAQ in html
    assert SAMPLE_TEXT in html
    assert 'noindex' not in html
    types = set()
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, flags=re.S):
        data = json.loads(block)
        for item in data if isinstance(data, list) else [data]:
            types.add(item.get('@type'))
    missing = {'WebPage', 'BreadcrumbList', 'Quiz', 'FAQPage'} - types
    assert not missing, f'missing JSON-LD types {missing}, got {types}'


@check
def linked_and_in_sitemap(page):
    sitemap = page.request.get(base_url + '/sitemap.xml').text()
    assert '/chinese/test/' in sitemap
    for route in ['/chinese/hsk/', '/chinese/']:
        html = page.request.get(base_url + route).text()
        assert 'href="/chinese/test/"' in html, route


@check
def home_offers_both_tests(page):
    html = page.request.get(base_url + '/').text()
    start = html.index('<section class="tc-test-choice"')
    section = html[start:html.index('</section>', start)]
    assert 'href="/english/test/"' in section and 'href="/chinese/test/"' in section
    assert 'Яка в тебе англійська?' in section and 'Яка в тебе китайська?' in section


def main():
    passed = []
    failed = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        for fn in checks:
            page = context.new_page()
            page.on('pageerror', lambda error: errors.append(str(error)))
            try:
                fn(page)
                passed.append(fn.__name__)
            except Exception:
                failed.append((fn.__name__, traceback.format_exc()))
            finally:
                page.close()
        browser.close()
    print('passed:', ', '.join(passed))
    for name, trace in failed:
        print(f'FAILED {name}\n{trace}')
    for error in errors:
        print('pageerror:', error)
    if failed or errors:
        sys.exit(1)
    print(f'{len(passed)} checks passed')


main()
