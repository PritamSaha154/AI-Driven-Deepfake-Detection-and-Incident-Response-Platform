# Deepfake Detection Dashboard

## Quick Start

```powershell
# 1. Install dependencies
npm install

# 2. Run the dashboard
npm run dev

# 3. Open browser
# http://localhost:3000
```

## Project Structure

```
deepfake-dashboard/
├── src/
│   ├── app/              # Next.js App Router (IMPORTANT!)
│   │   ├── api/          # API routes
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   ├── store/           # State management
│   └── lib/             # Utilities
├── mini-services/       # Python analyzer
└── package.json
```

## Troubleshooting

If you see "Couldn't find any pages or app directory":

1. Make sure `src/app/page.tsx` exists
2. Run `dir src\app` to verify
3. If missing, re-extract the ZIP file
