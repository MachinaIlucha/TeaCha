import { siteText } from './siteText';
export const packs = [1, 8, 12, 24];
export const tuition = {
  individual: { label: siteText.sections.priceRates.groups[0].title, note: '', sizes: 'Індивідуальне', prices: [700, 645, 630, 600] },
  pair: { label: siteText.sections.priceRates.groups[1].title, note: '', sizes: 'за 1 ос.', prices: [500, 445, 430, 400] },
  group: { label: siteText.sections.priceRates.groups[2].title, note: '', sizes: '3–5 ос.', prices: [400, 355, 330, 310] },
};
export const englishCourses = siteText.sections.englishPrograms.items.map(item => [item.title, item.text, item.href.split('/')[1]]);
export const chineseCourses = siteText.sections.chinesePrograms.items.map(item => [item.title, item.text, item.href.split('/')[1]]);
