# mini-app.pro

Bilingual SEO-optimised landing pages about Telegram Mini Apps for the `mini-app.pro` domain.

## Structure

```
mini-app.pro/
├── index.html              # Russian landing page based on SurferSEO export
├── en/index.html           # English translation
├── assets/
│   ├── css/style.css       # Tailwind-friendly custom styles, animations
│   └── js/script.js        # Navigation, smooth scroll, parallax
├── data/llm-index.json     # Knowledge snippets for LLM/vector search
├── images/                 # Documentation about embedded SurferSEO imagery
├── .gitattributes         # Шаблон для потенциальной поддержки бинарных активов
└── README.md
```

## Features

- TailwindCSS layout with Apple × Unitee.Space inspired UI, parallax hero and soft hover states.
- Semantic `<section data-topic="…">` blocks for LLM-friendly indexing and knowledge extraction.
- Sticky navigation with anchors, language toggle and responsive mobile menu.
- CTA banner that links to [Unitee.Space](https://unitee.space/?utm_source=mini-apppro&utm_medium=seo&utm_campaign=sat&utm_content=en) for no-code Mini App creation.
- OpenGraph, Twitter Card and Schema.org metadata in both languages plus hreflang alternates.
- JSON knowledge base with bilingual summaries to support search and embeddings.

## Local preview

Open `index.html` or `en/index.html` in a modern browser. TailwindCSS is loaded from CDN; ensure you have internet access during preview.

## Deployment

1. Commit changes: `git add . && git commit -m "Initial bilingual SEO landing with LLM search support"`
2. Push to the `main` branch and enable GitHub Pages (source: `main`, folder: `/`).
3. Publish at `https://mini-app.pro/`.

Add analytics scripts inside the commented placeholders when you are ready to track traffic.

## Binary assets

SurferSEO изображения встроены в страницы как base64 data URI, поэтому бинарные файлы не требуются и
ограничения платформы Git не нарушаются. При необходимости извлечь исходники используйте строки из
`index.html` и `en/index.html`.
