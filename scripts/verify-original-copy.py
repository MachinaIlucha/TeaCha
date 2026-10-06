"""Compare working main content and SEO with the approved redesign build."""
import hashlib
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup, Comment

root = Path(__file__).resolve().parents[1]
baseline = root.parent / 'TeaCha-main-preview/dist'
original_design = root.parent / 'TeaCha'
def norm(value):
    return re.sub(r'\s+', '', value)

def content(soup):
    for tag in soup.select('script,style,svg,noscript'):
        tag.decompose()
    return soup.body

def seo(soup):
    return {
        'title': soup.title.get_text(),
        'meta': [tag.attrs for tag in soup.head.select('meta')],
        'links': [tag.attrs for tag in soup.head.select('link') if set(tag.get('rel', [])) & {'canonical','alternate','icon','shortcut','apple-touch-icon'}],
        'schemas': [json.loads(tag.get_text()) for tag in soup.select('script[type="application/ld+json"]')],
    }

report = {'pages': [], 'seo_errors': [], 'protected_errors': [], 'missing_text': {}}
for html in sorted(baseline.rglob('*.html')):
    relative = html.relative_to(baseline)
    before = BeautifulSoup(html.read_text(encoding='utf-8'), 'html.parser')
    after = BeautifulSoup((root/'dist'/relative).read_text(encoding='utf-8'), 'html.parser')
    if seo(before) != seo(after):
        report['seo_errors'].append(str(relative))
    before, after = content(before), content(after)
    after_text = norm(after.get_text())
    # Text nodes preserve wording independently of where the new design wraps it.
    missing = sorted(set(' '.join(str(node).split()) for node in before.find_all(string=True)
                         if not isinstance(node, Comment) and len(norm(str(node))) >= 2 and norm(str(node)) not in after_text))
    # Long paragraphs must also match as a whole, including text around inline links.
    missing = sorted(set(missing + [' '.join(tag.get_text(' ').split()) for tag in before.select('p,blockquote,h1')
                                   if 'r2Row' not in tag.get('class', []) and len(norm(tag.get_text())) > 30 and norm(tag.get_text()) not in after_text]))
    if missing:
        report['missing_text'][relative.as_posix()] = missing
    report['pages'].append(relative.as_posix())

for file in ['robots.txt', 'sitemap.xml']:
    if (baseline/file).read_bytes() != (root/'dist'/file).read_bytes():
        report['protected_errors'].append(file)
for file in ['school.css','school-brand.css','school-motion.css','school-story.css']:
    if (root/'src/styles'/file).read_bytes() != (original_design/'src/styles'/file).read_bytes():
        report['protected_errors'].append(file)
for file in ['siteText.ts','blog.ts','chineseVocabulary.ts','seoSchemas.ts']:
    if (root/'src/data'/file).read_bytes() != (root.parent/'TeaCha-main-preview/src/data'/file).read_bytes():
        report['protected_errors'].append(file)
write_to = root/'artifacts/original-copy-verification.json'
write_to.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'pages': len(report['pages']), 'seo_errors': report['seo_errors'], 'protected_errors': report['protected_errors'], 'pages_with_missing_text': len(report['missing_text']), 'missing_strings': sum(map(len,report['missing_text'].values()))}, ensure_ascii=False))
for route, missing in report['missing_text'].items():
    print(route, json.dumps(missing, ensure_ascii=False))
raise SystemExit(bool(report['seo_errors'] or report['protected_errors'] or report['missing_text']))
