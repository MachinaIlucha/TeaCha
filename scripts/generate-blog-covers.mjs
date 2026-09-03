import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const covers = [
  { slug: "nova-systema-hsk-3-0", marker: "考", category: "HSK", lines: ["НОВА СИСТЕМА", "HSK 3.0", "У 2026 РОЦІ"] },
  { slug: "skilky-chasu-vyvchaty-kytaysku", marker: "时", category: "ПОЧАТКІВЦЯМ", lines: ["СКІЛЬКИ ЧАСУ", "ВЧИТИ", "КИТАЙСЬКУ"] },
  { slug: "chy-skladno-vchyty-kytaysku", marker: "易", category: "МІФИ", lines: ["ЧИ СПРАВДІ", "КИТАЙСЬКА", "ТАКА СКЛАДНА?"] },
  { slug: "pinyin-za-vyhidni", marker: "音", category: "ВИМОВА", lines: ["PINYIN", "ЗА ВИХІДНІ", "ГАЙД ІЗ ВИМОВИ"] },
  { slug: "navishcho-dytyni-kytayska", marker: "童", category: "ДІТЯМ", lines: ["НАВІЩО ДИТИНІ", "ВИВЧАТИ", "КИТАЙСЬКУ"] },
  { slug: "z-choho-pochaty-kytaysku", marker: "始", category: "СТАРТ", lines: ["З ЧОГО ПОЧАТИ", "ВИВЧАТИ", "КИТАЙСЬКУ"] },
  { slug: "yak-obraty-kursy-kytayskoyi", marker: "选", category: "КУРСИ", lines: ["ЯК ОБРАТИ", "КУРСИ", "КИТАЙСЬКОЇ"] },
  { slug: "kytayska-samostiyno-chy-z-vykladachem", marker: "师", category: "НАВЧАННЯ", lines: ["САМОСТІЙНО", "ЧИ З", "ВИКЛАДАЧЕМ?"] },
  { slug: "200-bazovyh-kytayskyh-sliv", marker: "词", category: "ЛЕКСИКА", lines: ["200 БАЗОВИХ", "КИТАЙСЬКИХ", "СЛІВ"] },
  { slug: "kytayska-dlya-roboty-v-ukrayini", marker: "业", category: "КАР’ЄРА", lines: ["КИТАЙСЬКА", "ДЛЯ РОБОТИ", "В УКРАЇНІ"] },
];

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const outputDir = path.resolve("public/img/blog");
await fs.mkdir(outputDir, { recursive: true });

for (const [index, cover] of covers.entries()) {
  const title = cover.lines
    .map((line, lineIndex) => `<tspan x="74" dy="${lineIndex === 0 ? 0 : 72}">${escapeXml(line)}</tspan>`)
    .join("");
  const offset = 690 + (index % 3) * 32;
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#30344d"/>
          <stop offset="1" stop-color="#171922"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#db1f32" stop-opacity="0.42"/>
          <stop offset="1" stop-color="#db1f32" stop-opacity="0"/>
        </radialGradient>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.045"/>
        </pattern>
      </defs>
      <rect width="1200" height="630" rx="0" fill="url(#bg)"/>
      <rect width="1200" height="630" fill="url(#grid)"/>
      <circle cx="1010" cy="122" r="330" fill="url(#glow)"/>
      <circle cx="1002" cy="314" r="224" fill="none" stroke="#ffffff" stroke-opacity="0.13" stroke-width="2"/>
      <text x="1002" y="400" fill="#ffffff" fill-opacity="0.12" text-anchor="middle" font-family="Microsoft YaHei, Noto Sans SC, sans-serif" font-size="292" font-weight="700">${escapeXml(cover.marker)}</text>
      <rect x="74" y="65" width="${offset - 690 + 150}" height="38" rx="19" fill="#db1f32"/>
      <text x="94" y="90" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">${escapeXml(cover.category)}</text>
      <text x="74" y="194" fill="#ffffff" font-family="Arial, sans-serif" font-size="58" font-weight="800" letter-spacing="-1.5">${title}</text>
      <path d="M74 551H1126" stroke="#ffffff" stroke-opacity="0.18"/>
      <text x="74" y="591" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="1.2">TEA<tspan fill="#f13c50">CHA</tspan> · ШКОЛА КИТАЙСЬКОЇ МОВИ</text>
      <text x="1126" y="591" fill="#ffffff" fill-opacity="0.62" text-anchor="end" font-family="Arial, sans-serif" font-size="17">teacha.com.ua</text>
    </svg>`;

  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(path.join(outputDir, `${cover.slug}.png`));
}

console.log(`Generated ${covers.length} blog covers in ${outputDir}`);
