type FaqItem = { q: string; a: string };

const SITE_URL = "https://teacha.com.ua";
const PROVIDER = {
  "@type": "EducationalOrganization" as const,
  name: "TeaCha",
  url: SITE_URL,
};
const LOCATION = {
  "@type": "Place" as const,
  name: "TeaCha",
  address: {
    "@type": "PostalAddress" as const,
    streetAddress: "проспект Академіка Палладіна, 44а",
    addressLocality: "Київ",
    addressCountry: "UA",
  },
};

export function buildCourseSchema(opts: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    provider: PROVIDER,
    inLanguage: "uk-UA",
    hasCourseInstance: [
      {
        "@type": "CourseInstance",
        courseMode: "Online",
      },
      {
        "@type": "CourseInstance",
        courseMode: "Onsite",
        location: LOCATION,
      },
    ],
  };
}

export function buildFaqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a.replace(/<br\s*\/?>/g, " ").replace(/<[^>]*>/g, ""),
      },
    })),
  };
}

export function buildCourseListSchema(courses: Array<{
  name: string;
  description: string;
  path: string;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Курси китайської мови TeaCha",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/${course.path.replace(/^\/+/, "")}`,
      item: {
        "@type": "Course",
        name: course.name,
        description: course.description,
        url: `${SITE_URL}/${course.path.replace(/^\/+/, "")}`,
        provider: PROVIDER,
        inLanguage: "uk-UA",
      },
    })),
  };
}

export function buildOfferSchema(offers: Array<{
  name: string;
  price: number;
  lessons: number;
}>) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Ціни на курси TeaCha",
    url: `${SITE_URL}/prices/`,
    itemListElement: offers.map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      price: offer.price,
      priceCurrency: "UAH",
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        value: offer.lessons,
        unitText: "уроків",
      },
      seller: PROVIDER,
    })),
  };
}
