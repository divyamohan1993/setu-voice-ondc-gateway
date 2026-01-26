# Setu - Voice-to-ONDC Gateway

A voice-to-protocol translation system that enables illiterate farmers to participate in the Open Network for Digital Commerce (ONDC) by converting vernacular voice commands into valid Beckn Protocol catalogs.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0
- **Linting:** ESLint

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── app/                  # Next.js App Router pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/          # React components (to be added)
├── lib/                 # Utility functions (to be added)
├── public/              # Static assets (to be added)
└── prisma/              # Database schema (to be added)
```

## Development

This project uses:
- TypeScript strict mode for type safety
- Tailwind CSS for styling
- ESLint for code quality

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
