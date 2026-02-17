# Trick Ski Calculator

**Developed by Jake Artang & Calvin DeBellis**

---

## Background & Motivation

Competitive trick water skiing is a sport where athletes perform spins and tricks on a smooth, finless ski within a 20-second window, combining unique tricks to maximize their point total. Tournament runs are currently scored by human judges watching live — a system that is old, inconsistent, and prone to error.

**For athletes**, calculating a trick run means cross-referencing a points guide and doing mental math on the fly. It's easy to miscalculate, forget a modifier bonus, or misjudge whether a combination is even legal under IWWF rules. Planning and optimizing a run before a tournament is tedious and often done on paper or in your head.

**For judges**, the problem is even more acute. Most are still using pen and paper — physically writing down each trick as they call it, or recording themselves and transcribing the audio after the fact. This introduces delays, handwriting errors, missed tricks, and inconsistencies between judges scoring the same run.

This calculator is designed to make scoring as seamless and error-free as possible for both athletes and judges. Just tap the tricks as you see them — point totals, duplicate detection, and legal-move enforcement are all handled automatically. And with our AI-powered trick suggestions achieving a **95% hit rate in the top 5 displayed**, you can score a run quickly by simply tapping an AI suggestion without ever needing to navigate the full trick grid.

---

## Features

- **Real-time point calculation** as you build your pass
- **Two-pass system** with automatic duplicate detection across both passes
- **All trick modifiers** — wake, toe, and stepover variations
- **Reverse trick management** following IWWF orientation and 180° turn rules
- **AI-powered trick recommendations** — GRU neural network predicts optimal next tricks based on your current run and skill level
- **Skill-tier models** — separate models trained for beginner (0–1k), intermediate (1k–2k), advanced (2k–7k), and pro (7k+) passes
- **Heatmap visualization** — trick buttons color-coded by prediction confidence
- **Shareable text formatting** — copy and share your run to clipboard
- **Custom trick support** — define and save your own tricks
- **Quick reference guide** — all IWWF 2025 trick point values
- **Responsive design** — works on desktop and mobile
- **Native iOS & Android** — full app via Capacitor

---

## Pages

| Page | Description |
|------|-------------|
| **Calculator** | Main trick input with modifier buttons, AI suggestions, and real-time scoring |
| **Trick Pass** | View your complete two-pass run and copy to clipboard |
| **Trick Guide** | Reference table of all tricks and point values per IWWF 2025 |
| **About** | Background on trick water skiing and the app |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Routing | React Router DOM 7 (HashRouter for GitHub Pages) |
| Styling | Tailwind CSS 3.4 |
| Build Tool | Vite 7 |
| ML Inference | ONNX Runtime Web 1.21 (browser-based, no backend required) |
| Mobile | Capacitor 8 (iOS & Android) |
| ML Training | PyTorch + Python |

---

## Project Structure

```
p69/
├── src/
│   ├── App.jsx                     # Routing, global state, pass management
│   ├── main.jsx                    # Entry point (HashRouter)
│   ├── index.css                   # Global styles and Tailwind imports
│   ├── components/
│   │   ├── Calculator.jsx          # Main calculator UI and IWWF rule logic
│   │   ├── TrickRecommendations.jsx # AI suggestion display (top 5 predictions)
│   │   ├── TrickPass.jsx           # Pass summary and clipboard sharing
│   │   ├── TrickGuide.jsx          # Trick reference tables
│   │   ├── About.jsx               # About page
│   │   ├── TrickButton.jsx         # Trick button with heatmap coloring
│   │   ├── TrickListSidebar.jsx    # Sidebar trick list (desktop)
│   │   ├── ToggleButton.jsx        # Modifier toggle button
│   │   ├── PassSection.jsx         # Per-pass display section
│   │   ├── StatsCard.jsx           # Points and stats display
│   │   ├── TrickTable.jsx          # Reusable table component
│   │   ├── NavLink.jsx             # Navigation link wrapper
│   │   └── Section.jsx             # Reusable content section
│   ├── data/
│   │   └── tricks.js               # All trick definitions, point values, metadata
│   └── utils/
│       ├── trickPredictor.js       # ONNX inference, tier loading, legal filtering
│       └── trickUtils.js           # Pass totals, formatting, clipboard helpers
│
├── ml/                             # ML training pipeline
│   ├── train_all_tiers.py          # Trains all 4 skill-tier GRU models
│   ├── parse_tricks.py             # Parses raw competition data into sequences
│   ├── test_models.py              # Model evaluation
│   ├── train_gru.ipynb             # Exploration notebook
│   ├── Data/                       # Raw competition run files (Nationals/Regionals)
│   └── *.json / *.onnx / *.pt      # Processed data, vocab, trained models
│
├── docs/                           # GitHub Pages build output
│   └── model/
│       ├── 0_1k/                   # Beginner tier ONNX model + vocab
│       ├── 1k_2k/                  # Intermediate tier
│       ├── 2k_7k/                  # Advanced tier
│       └── 7k_plus/                # Pro/elite tier
│
├── android/                        # Capacitor Android project
├── ios/                            # Capacitor iOS project
├── public/                         # Static assets
├── vite.config.js
├── tailwind.config.js
├── capacitor.config.json
└── deploy.sh                       # Build + deploy script
```

---

## AI Trick Recommendations

The calculator includes browser-based ML inference powered by ONNX Runtime Web. No backend server is needed — models run entirely on-device.

### How It Works

1. Your trick history is encoded into a fixed-length sequence (30 tokens)
2. The sequence is fed into a GRU model for the selected skill tier
3. The model outputs a probability distribution over all tricks in the vocabulary
4. Predictions are filtered to only legal next tricks (orientation, reverse availability)
5. The top 5 suggestions appear above the trick grid, with trick buttons color-coded by confidence

### Skill Tiers

| Tier | Score Range | Description |
|------|-------------|-------------|
| Beginner | 0–1,000 pts | Common beginner trick combinations |
| Intermediate | 1,000–2,000 pts | Mid-level pass patterns |
| Advanced | 2,000–7,000 pts | Competitive amateur sequences |
| Pro | 7,000+ pts | Elite competition passes |

Each tier has its own GRU model (~64-dim embeddings, 128-dim hidden, trained on real Nationals and Regionals data). Models are quantized to ONNX and loaded lazily — only the selected tier's model is fetched.

### Training Pipeline

```
Raw competition files (.txt)
    ↓ parse_tricks.py
Sequences split by skill tier
    ↓ train_all_tiers.py
GRU models trained in PyTorch
    ↓ torch.onnx.export()
ONNX models → docs/model/{tier}/
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (outputs to /docs)
npm run build
```

---

## Mobile (Capacitor)

```bash
# Sync web build to native projects
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (macOS only)
npx cap open ios
```

The app uses Capacitor APIs for clipboard access, keyboard handling, status bar styling, safe area insets, and persistent preferences (skill level, custom tricks).

---

## Deployment

The app deploys to GitHub Pages from the `/docs` directory using HashRouter for client-side routing.

```bash
# Build and deploy
npm run build
git add docs/
git commit -m "deploy: update build"
git push
```

Or use the included `deploy.sh` script, which handles building and optionally syncing Capacitor.

---

## Roadmap

- [ ] **Run history** — save and compare multiple runs across sessions
- [ ] **Progress tracking** — document consistency and improvement over time
- [ ] **Additional events** — support for other water ski disciplines
- [ ] **Run comparison and analytics**
- [ ] **PWA / offline support**
- [ ] **Export to PDF**

---

## License

MIT
