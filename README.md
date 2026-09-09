# Capacitor mobile shell

Phase 1 includes the Capacitor configuration and npm scripts only.

After npm dependencies are installed:

```bash
npm run build
npx cap add android
npx cap add ios   # requires macOS/Xcode for iOS development
npx cap sync
```

Native Android/iOS release completion is intentionally **not** claimed in Phase 1. The web application remains the canonical UI codebase.
