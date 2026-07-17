/* =========================================================================
   seo.jsx — per-route 메타 + JSON-LD (SEO·GEO 노출용)
   vite-react-ssg 의 <Head> 로 빌드 시 정적 HTML <head> 에 주입된다.
   GEO(생성형 엔진) 노출: 구조화 데이터(JSON-LD) + 명확한 메타가 핵심 신호.
   ========================================================================= */
import { Head } from "vite-react-ssg";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "./config.js";
import { LANGS, dirOf, langFromPath, withLang } from "./langs.js";
import { getSeoOverride } from "./content.js";

const DEFAULT_DESC =
  "CareBridge Global offers comprehensive healthcare in Korea — from preventive checkups (Comprehensive, Whole-Body MRI) to specialized Revital treatments (ophthalmology, dental, dermatology and more) — powered by Korea's trusted medical expertise, with transport, accommodation and tours arranged end to end.";

const OG_LOCALE = { en: "en_US", ko: "ko_KR", ar: "ar_AR", ja: "ja_JP" };

export function Seo({ title, description = DEFAULT_DESC, path = "/", type = "website", jsonLd, noindex }) {
  const lang = langFromPath(useLocation().pathname);       // 현재 언어 = URL 접두어
  const url = SITE_URL + withLang(path, lang);             // 자기 언어 canonical
  // admin SEO/GEO 오버라이드 — *해당 언어 값이 있을 때만* 적용(비면 기존 유지 → 회귀 없음)
  const ov = getSeoOverride(path);
  const oTitle = ov && ov.title && ov.title[lang];
  const oDesc = ov && ov.description && ov.description[lang];
  const oKeywords = ov && ov.keywords && ov.keywords[lang];
  const ogImage = (ov && ov.ogImage) || "";
  title = oTitle || title;
  description = oDesc || description;
  const fullTitle = title ? `${title} | CareBridge Global` : "CareBridge Global — Healthcare & Health Checkups in Korea";
  const graphs = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Head>
      <html lang={lang} dir={dirOf(lang)} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {oKeywords && <meta name="keywords" content={oKeywords} />}
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {/* hreflang — 언어별 대체 URL (검색·GEO 다국어 색인) */}
      {!noindex && LANGS.map((l) => (
        <link key={l.code} rel="alternate" hrefLang={l.code} href={SITE_URL + withLang(path, l.code)} />
      ))}
      {!noindex && <link rel="alternate" hrefLang="x-default" href={SITE_URL + withLang(path, "en")} />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="CareBridge Global" />
      <meta property="og:locale" content={OG_LOCALE[lang] || "en_US"} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      {graphs.map((g, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(g)}</script>
      ))}
    </Head>
  );
}

/* ----------------------------- JSON-LD builders ----------------------------- */

// 홈: 조직 + 사이트 (MedicalBusiness/Organization + WebSite)
export const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "MedicalBusiness"],
      "@id": SITE_URL + "/#org",
      name: "CareBridge Global",
      url: SITE_URL + "/",
      description: DEFAULT_DESC,
      areaServed: ["South Korea", "United States", "Worldwide"],
      medicalSpecialty: ["PreventiveMedicine", "Ophthalmologic", "Dermatologic", "PlasticSurgery", "Dental", "Radiography"],
      knowsAbout: [
        "Health checkup in Korea",
        "Whole-body MRI screening",
        "SMILE LASIK and vision correction",
        "Medical tourism in Korea",
        "Dental, dermatology and plastic surgery in Korea",
      ],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      url: SITE_URL + "/",
      name: "CareBridge Global",
      publisher: { "@id": SITE_URL + "/#org" },
      inLanguage: "en",
    },
  ],
};

// 시술 상세: MedicalProcedure
export function procedureJsonLd({ name, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name,
    description,
    url,
    provider: { "@id": SITE_URL + "/#org" },
  };
}

// 파트너 병원 목록: ItemList of Hospital (GEO 신호 — "trusted Korean hospitals" 쿼리 대응)
// items: [{ id, name, area, specialties:[en], rating, reviews }]
export function providersJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Trusted Korean hospitals and clinics",
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": ["Hospital", "MedicalOrganization"],
        "@id": SITE_URL + "/providers#" + p.id,
        name: p.name,
        url: SITE_URL + "/providers",
        address: { "@type": "PostalAddress", addressLocality: p.area, addressRegion: "Seoul", addressCountry: "KR" },
        medicalSpecialty: p.specialties,
        aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews, bestRating: 5, worstRating: 1 },
      },
    })),
  };
}

// 스캔 메뉴(MRI/CT): ItemList of MedicalProcedure + Offer(USD 가격)
// items: [{ name, description, price:number|null }]
export function scanMenuJsonLd(items, url) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MRI & CT scan menu",
    itemListElement: items.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MedicalProcedure",
        name: s.name,
        description: s.description,
        url,
        provider: { "@id": SITE_URL + "/#org" },
        ...(s.price != null ? { offers: { "@type": "Offer", price: s.price, priceCurrency: "USD", availability: "https://schema.org/InStock" } } : {}),
      },
    })),
  };
}

// FAQ: FAQPage
export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

// 빵부스러기: BreadcrumbList
export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: SITE_URL + it.path,
    })),
  };
}
