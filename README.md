# Trick Ski Calculator

A web-based trick water skiing calculator built with React and Tailwind CSS. Based on official IWWF 2025 rules.

**Developed by Jake Artang & Calvin DeBellis**

## Features

- **Real-time point calculation** as you build your pass
- **Two-pass system** with automatic duplicate detection across passes
- **All trick modifiers** including wake, toe, and stepover variations
- **Reverse trick management** following IWWF rules
- **Shareable text formatting** for copying and sharing your runs
- **Responsive design** for desktop and mobile devices
- **Quick reference guide** with all trick values

## Pages

| Page | Description |
|------|-------------|
| **Calculator** | Main trick input interface with modifier buttons and real-time scoring |
| **Trick Pass** | View your complete run with both passes and copy to clipboard |
| **Trick Guide** | Reference table of all tricks and point values from IWWF 2025 rules |
| **About** | Information about trick water skiing and the app |

## Tech Stack

- **React 19** - UI framework
- **React Router** - Client-side routing (HashRouter for GitHub Pages)
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Project Structure

```
src/
├── App.jsx                    # Main app with routing and state management
├── main.jsx                   # Entry point
├── index.css                  # Global styles and Tailwind imports
├── components/
│   ├── Calculator.jsx         # Main calculator interface
│   ├── TrickPass.jsx          # Pass display and sharing
│   ├── TrickGuide.jsx         # Trick reference tables
│   ├── About.jsx              # About page
│   ├── TrickButton.jsx        # Individual trick button
│   ├── ToggleButton.jsx       # Modifier toggle button
│   ├── TrickListSidebar.jsx   # Sidebar trick list (desktop)
│   ├── TrickTable.jsx         # Reusable trick table
│   ├── PassSection.jsx        # Pass display section
│   ├── Section.jsx            # Reusable content section
│   ├── StatsCard.jsx          # Stats display card
│   └── NavLink.jsx            # Navigation link wrapper
├── data/
│   └── tricks.js              # Trick definitions and helper functions
└── utils/
    └── trickUtils.js          # Shared utility functions
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

The app is configured to deploy to GitHub Pages. The build outputs to `/docs` for GitHub Pages compatibility.

```bash
# Build and deploy
npm run build
git add docs/
git commit -m "Update build"
git push
```

## Roadmap

### Planned Features

- [ ] **AI-powered trick recommendations** - Predict optimal next tricks based on current run
- [ ] **Run history** - Save and compare multiple runs
- [ ] **Progress tracking** - Document consistency and improvement over time
- [ ] **Additional events** - Support for other water ski disciplines

### Ideas

- Run comparison and analytics
- Offline support (PWA)
- Export to PDF

## License

MIT
