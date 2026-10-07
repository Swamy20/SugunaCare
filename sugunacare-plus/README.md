# Sugunacare+

Cardiac-care medication dashboard built with React, TypeScript, and Vite.

For the complete line-by-line application explanation, see [Sugunacare+ Application Explanation](docs/Sugunacare-Plus-Application-Explanation.md).

See [COPYRIGHT.md](COPYRIGHT.md) for the software copyright notice.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Production deployment

Run the deployment check:

```bash
npm run deploy:check
```

The production-ready files are generated in `dist/`. Upload that folder to any static host, or connect this repository to Vercel or Netlify. The included `vercel.json` and `netlify.toml` preserve the single-page app routes.

For a local production preview:

```bash
npm run preview
```

## Important behavior

- User profile and medication data are stored in the browser's local storage.
- Medicine notifications use the browser Notification API and require permission.
- Notifications work while the app remains open in the browser. Reliable background/mobile notifications require a native app or push-notification service.

## APK packaging

The Android project is generated in `android/` through Capacitor. Build a debug APK with:

```bash
npm run build
npx cap sync android
android\\gradlew.bat -p android assembleDebug
```

The generated APK is available at `android/app/build/outputs/apk/debug/app-debug.apk`. A shareable copy is also available as [SugunacarePlus-debug.apk](SugunacarePlus-debug.apk).

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
