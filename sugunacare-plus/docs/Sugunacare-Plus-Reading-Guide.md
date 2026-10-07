# Sugunacare+ Reading Guide

## 1. Project overview

Sugunacare+ is a cardiac-care medication dashboard built with React, TypeScript, and Vite. It helps a user:

- Create an account and sign in on the same browser.
- Add medicines with one or more daily dose times.
- View each dose in 12-hour AM/PM format.
- Mark individual doses as taken.
- Edit or delete medicines.
- Store emergency contacts and edit their phone numbers.
- Read doctor guidance and prevention suggestions.
- Review simple health-report summaries and future check dates.

This is a browser-based prototype. Data is stored in `localStorage`, so it is not a production authentication or medical-record system.

## 2. Technology stack

- **React**: Builds the user interface from components and state.
- **TypeScript**: Adds types for medication, contacts, accounts, and profile data.
- **Vite**: Runs the development server and creates the production bundle.
- **CSS**: Defines the responsive dashboard layout and visual design.
- **Browser APIs**: `localStorage` stores demo data and the Notification API schedules reminders while the app is open.

## 3. Application entry point

`src/main.tsx` is the startup file:

1. It imports React's `StrictMode`.
2. It imports `createRoot` from React DOM.
3. It imports global CSS and the main `App` component.
4. It mounts `<App />` into the HTML element with the id `root`.

`StrictMode` helps reveal unsafe React patterns during development.

## 4. Main component: `src/App.tsx`

The `App` component owns the main application state and decides which screen to show.

### Important types

`Medication` represents a medicine:

- `name`, `dosage`, and `volume` describe what the user takes.
- `timings` is an array such as `['08:00', '13:00', '20:00']`.
- `taken` is a matching boolean array. Each item represents one dose slot.
- `stock` and `threshold` support refill tracking.

`EmergencyContact` stores a name, role, and phone number.

`StoredAccount` stores the demo signup credentials used by the local login flow.

### Authentication flow

The `authMode` state switches between `register` and `login`.

During signup, `handleAuth`:

1. Reads the name, email, and password from `authForm`.
2. Normalizes the email to lowercase.
3. Stores the account under `sugunacare-account`.
4. Changes the screen to the sign-in mode.

During login, the same function:

1. Reads the saved account.
2. Compares the entered email and password.
3. Shows an error message when the credentials do not match.
4. Opens the dashboard only after successful validation.

This local check is appropriate for a demonstration, but a real application should use a secure backend, password hashing, sessions, and server-side authorization.

### Medication state

Medication records are loaded from `sugunacare-medications`. Existing records using the earlier single `timing` property are migrated to the newer `timings` array.

A `useEffect` writes medication changes back to local storage. Another effect creates browser timers for every medication time and displays a notification when the time arrives.

The `saveMedication` function handles both creation and editing:

- When `editingMedicationId` is empty, it appends a new medication.
- When it contains an id, it replaces the matching medication.
- It keeps existing completion values where possible when times are edited.

`removeMedication` filters out the selected medication. `toggleTaken` changes one dose slot and adjusts the remaining stock.

### 12-hour time handling

The app stores times internally in the reliable 24-hour `HH:mm` format. This makes sorting and browser timers predictable.

`timeParts` converts a stored value into:

- hour, from 1 to 12;
- minute, currently in 15-minute increments;
- period, either AM or PM.

`timeValue` converts those three UI values back to 24-hour storage. `displayTime` converts stored values to labels such as `8:00 AM` or `1:00 PM`.

This separation keeps storage logic stable while giving the user a familiar 12-hour input.

### Dashboard calculations

The dashboard derives its summary instead of storing duplicate totals:

- `dosesPlanned` counts every timing across all medicines.
- `dosesTaken` counts all completed dose slots.
- `progress` calculates the completion percentage.
- `nextMedication` finds the earliest incomplete timing.

Derived values reduce the chance that the dashboard and medication list disagree.

### Emergency contacts

Contacts are loaded from `sugunacare-emergency-contacts` and saved whenever the list changes. The contact form uses `editingContactId` in the same pattern as medication editing:

- no id means add a contact;
- an id means update the matching contact.

Each phone number is rendered as a `tel:` link so a compatible device can start a call.

### Additional views

The dashboard navigation changes `activeView`. The current app includes:

- Today
- Medications
- Lab reports
- Safety tips
- Doctor guidance
- Emergency contacts

The doctor guidance and reports views are intentionally simple. They provide prevention reminders and plain-language summaries, but they do not replace advice from a qualified clinician.

## 5. Styling: `src/App.css`

`App.css` contains:

- color variables such as `--teal`, `--deep-teal`, and `--coral`;
- authentication and dashboard layouts;
- medication cards, forms, report cards, and guidance cards;
- responsive rules for tablet and mobile screens;
- small entrance and heartbeat animations.

The CSS uses the same class names rendered by `App.tsx`. When adding a UI element, add a focused class instead of changing unrelated global rules.

## 6. Development commands

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173/
```

Build the production bundle:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Run both deployment checks:

```bash
npm run deploy:check
```

## 7. Important limitations

- Local storage is browser-specific and can be cleared by the user.
- The demo supports one local account per browser.
- Passwords are not securely hashed.
- Notifications require browser permission and the app to remain open.
- Report content is sample content and is not a medical diagnosis.
- Production use requires a backend, secure authentication, protected health-data storage, audit logging, and clinical review.

## 8. Suggested presentation message

Sugunacare+ demonstrates how a focused care dashboard can make medication routines easier to see and manage. Its strongest technical ideas are typed state, derived dose progress, reusable add/edit flows, browser persistence, and a responsive React interface. Its main next step is replacing local-only demo behavior with secure backend services.
