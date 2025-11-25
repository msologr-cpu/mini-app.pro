(function () {
  const lang = document.documentElement.lang || "en";
  const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
  const description =
    document.querySelector('meta[name="description"]')?.content ||
    "MiniApp Pro by Unitee Space helps you build full Telegram mini apps without writing code.";
  const title = (document.querySelector("title")?.textContent || "MiniApp Pro").trim();
  const image =
    document.querySelector('meta[property="og:image"]')?.content ||
    "https://mini-app.pro/assets/images/og-cover.svg";
  const now = "2025-11-25";
  const siteUrl = "https://mini-app.pro/";

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    name: "Unitee Space",
    url: siteUrl,
    logo: image,
    image,
    description,
    sameAs: ["https://unitee.space/"],
    datePublished: "2023-11-01",
    dateModified: now,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    url: siteUrl,
    name: "MiniApp Pro",
    description: "No-code Telegram mini app builder by Unitee Space.",
    inLanguage: lang,
    publisher: { "@id": `${siteUrl}#organization` },
    datePublished: "2023-11-01",
    dateModified: now,
    potentialAction: {
      "@type": "SearchAction",
      target: "https://mini-app.pro/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "MiniApp Pro builder",
    description,
    image,
    brand: { "@id": `${siteUrl}#organization` },
    category: "SoftwareApplication",
    url: canonical,
    inLanguage: lang,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    datePublished: "2023-11-01",
    dateModified: now,
  };

  const faqContent =
    lang === "en"
      ? {
          q1: "What is MiniApp Pro?",
          a1: description,
          q2: "How do I launch a Telegram mini app without coding?",
          a2: "Use the MiniApp Pro builder by Unitee Space to combine CRM, payments, automation and publish directly to Telegram without engineering effort.",
        }
      : {
          q1: "[Please localize] What is MiniApp Pro?",
          a1: description,
          q2: "[Please localize] How do I launch a Telegram mini app without coding?",
          a2: "[Please localize] Use the MiniApp Pro builder by Unitee Space to combine CRM, payments, automation and publish directly to Telegram without engineering effort.",
        };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: title,
    description,
    inLanguage: lang,
    isPartOf: { "@id": `${siteUrl}#website` },
    datePublished: "2023-11-01",
    dateModified: now,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    datePublished: "2023-11-01",
    dateModified: now,
    mainEntity: [
      {
        "@type": "Question",
        name: faqContent.q1,
        acceptedAnswer: { "@type": "Answer", text: faqContent.a1 },
      },
      {
        "@type": "Question",
        name: faqContent.q2,
        acceptedAnswer: { "@type": "Answer", text: faqContent.a2 },
      },
    ],
  };

  const graph = [org, website, product, webPage, faqPage];
  const ldScript = document.createElement("script");
  ldScript.type = "application/ld+json";
  ldScript.textContent = JSON.stringify(graph);
  document.head.appendChild(ldScript);
})();
