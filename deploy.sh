#!/bin/bash
set -e

# Usage: ./deploy.sh [targets...]
# Targets: web, android, ios, all (default: all)
# Examples:
#   ./deploy.sh            # deploy everything
#   ./deploy.sh web        # web only
#   ./deploy.sh android    # android only
#   ./deploy.sh web ios    # web + ios export

TARGETS="${@:-all}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[deploy]${NC} $1"; }
info() { echo -e "${CYAN}[deploy]${NC} $1"; }

should_run() {
  [[ "$TARGETS" == *"all"* ]] || [[ "$TARGETS" == *"$1"* ]]
}

# Step 1: Build web
log "Building web app..."
npm run build
log "Build complete."

# Step 2: Capacitor sync
if should_run "android" || should_run "ios"; then
  log "Syncing Capacitor..."
  npx cap sync
  log "Capacitor sync complete."
fi

# Step 3: Deploy to web (GitHub Pages)
if should_run "web"; then
  log "Deploying to web (GitHub Pages)..."
  git add -A
  if git diff --cached --quiet; then
    warn "No changes — skipping deploy."
  else
    git commit -m "deploy: update build"
    git push
    log "Pushed to GitHub — site will update shortly."
  fi
fi

# Step 4: Open Android Studio
if should_run "android"; then
  log "Opening Android Studio..."
  npx cap open android
fi

# Step 5: Export iOS project for transfer to Mac
if should_run "ios"; then
  IOS_EXPORT="ios-export"
  log "Exporting iOS project to ./${IOS_EXPORT}/..."
  rm -rf "$IOS_EXPORT"
  cp -r ios "$IOS_EXPORT"
  log "iOS project exported to ./${IOS_EXPORT}/"
  info "Transfer this folder to your Mac, then run:"
  info "  cd ${IOS_EXPORT}/App"
  info "  pod install    # if using CocoaPods"
  info "  open App.xcworkspace"
fi

log "Done!"
