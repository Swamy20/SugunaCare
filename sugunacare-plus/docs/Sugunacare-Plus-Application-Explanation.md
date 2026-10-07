# Sugunacare+ Application Explanation

## 1. Purpose of the application

Sugunacare+ is a cardiac-care medication dashboard. It gives a user one place to:

- create a local demo account and sign in;
- record medicines, dosage, quantity, stock, and daily times;
- mark each planned dose as taken;
- see daily completion progress and the next reminder;
- identify medicines below their refill threshold;
- keep emergency contacts available for phone calls;
- read sample lab-report summaries and doctor-guidance notes;
- run the same web application as an Android APK through Capacitor.

The current implementation is a working prototype. Account credentials, profile data, medicine data, and contacts are stored in the browser or Android WebView local storage. It is not a production medical-record or authentication system.

## 2. Project files and responsibility

| File or folder | Responsibility |
|---|---|
| `index.html` | Supplies the HTML document and the `root` mount element. |
| `src/main.tsx` | Starts React and mounts the `App` component. |
| `src/App.tsx` | Contains the application types, state, actions, navigation, and rendered screens. |
| `src/App.css` | Contains application layout, component styling, responsive rules, and animations. |
| `src/index.css` | Contains global CSS reset and base typography. |
| `public/` | Contains static files copied into the Vite build. |
| `capacitor.config.ts` | Defines the Android app id, app name, and web asset directory. |
| `android/` | Generated Capacitor Android project. |
| `dist/` | Generated production web bundle. |
| `SugunacarePlus-debug.apk` | Shareable debug APK generated from the Android project. |

## 3. `src/main.tsx`: application startup

The startup file performs four operations:

1. Imports React Strict Mode so development builds can expose unsafe rendering patterns.
2. Imports `createRoot` from React DOM.
3. Imports global CSS and the `App` component.
4. Finds the HTML element with `id="root"` and renders `<App />` into it.

There is no routing library. Screen navigation is handled inside `App.tsx` with the `activeView` state.

## 4. `src/App.tsx`: line-by-line explanation

The source currently has 253 lines. Several lines contain long JSX expressions, so the explanation below follows the source line ranges and explains each rendered block rather than splitting JSX at arbitrary visual characters.

### Lines 1-3: imports

- **Line 1** imports `useState` for local component state and `useEffect` for persistence and reminder side effects.
- **Line 2** imports the TypeScript `FormEvent` type used by form handlers.
- **Line 3** imports all styles from `App.css`.

### Lines 5-15: `Medication` type

The `Medication` type defines one medicine record:

- `id` uniquely identifies the record.
- `name` is the medicine name.
- `dosage` is the strength, such as `500 mg`.
- `volume` is what the user takes, such as `1 tablet`.
- `timings` stores one or more times in 24-hour `HH:mm` format.
- `stock` stores the remaining dose count.
- `threshold` determines when refill status becomes low.
- `color` selects the visual medicine icon color.
- `taken` is an optional Boolean array aligned with `timings`.

The `taken` array is aligned by index. For example, `timings[0]` and `taken[0]` describe the same dose slot.

### Lines 17-19: other data types

- `UserProfile` stores the signed-in user's display name and email.
- `EmergencyContact` stores an id, name, role, and phone number.
- `StoredAccount` stores the prototype account credentials in local storage.

### Lines 21-28: default data

The default medication list supplies three sample medicines: Amlodipine, Metformin, and Vitamin D3. Each has a dosage, a daily time, stock quantity, refill threshold, and display color.

The default contact list supplies a family caregiver and a cardiologist. These values make the dashboard useful immediately after the first successful login.

`emptyMedication` is the initial form value used when adding a medicine. `defaultProfile` provides a fallback name before a user profile is available.

### Lines 30-45: time conversion helpers

- `displayTime` converts `HH:mm` storage values to readable 12-hour labels such as `8:00 AM`.
- `timeParts` splits a stored time into hour, minute, and AM/PM values for the form controls.
- `timeValue` converts the form's hour, minute, and period back into 24-hour storage.

Keeping storage in 24-hour format makes sorting and timers reliable while keeping the user interface familiar.

### Lines 47-66: component state

`App` begins with state for:

- login status and current authentication mode;
- the selected dashboard view;
- whether the add/edit form or first-time setup form is visible;
- notification and authentication messages;
- the user profile;
- authentication form values;
- medications;
- emergency contacts;
- contact form values and the contact being edited;
- medication form values and the medicine being edited.

The profile, medication, and contact initializers read from local storage. If no saved value exists, they use the defaults. The medication initializer also migrates older records that had a single `timing` property into the current `timings` array shape.

### Lines 68-78: persistence effects

The first effect writes the current medication array to `sugunacare-medications` whenever medications change.

The second effect writes contacts to `sugunacare-emergency-contacts` whenever contacts change.

Because these effects run after state updates, adding, editing, deleting, or marking a dose taken is automatically persisted for the current browser or WebView.

### Lines 80-101: reminder scheduling

The reminder effect creates one timer for every medication timing:

1. It splits the `HH:mm` value into hours and minutes.
2. It creates a `Date` for the next occurrence.
3. If today's occurrence has already passed, it schedules the next day.
4. It calls the browser `Notification` API when the timer fires.
5. It schedules the following occurrence again, creating a daily reminder loop.
6. Its cleanup function clears all timers when medications change or the component unmounts.

The timer runs while the app is open. Reliable background reminders would require a native notification implementation or a push-notification service.

### Lines 103-112: notification permission

`requestNotifications` first checks whether the current environment supports the Notification API. If it does not, it displays a status message.

If supported, it requests permission. The result is displayed as either an enabled message or an instruction to allow notifications in browser settings.

### Lines 114-139: account registration and login

`handleAuth` prevents the browser's default form submission and normalizes the email to lowercase.

In register mode:

1. It creates a `StoredAccount` from the form.
2. It saves that account under `sugunacare-account`.
3. It tells the user the account was created.
4. It switches the form to sign-in mode.

In login mode:

1. It loads the saved account.
2. It compares the saved email and password with the form values.
3. It displays an error when no matching account exists.
4. It creates and persists the user profile after a successful match.
5. It sets `isLoggedIn` to true.
6. It opens first-time medicine setup unless setup was already completed.

This is intentionally local demo authentication. Production authentication must use a backend, secure password hashing, sessions or tokens, authorization, and protected health-data storage.

### Lines 141-167: add and edit medication

`saveMedication` handles both creation and editing:

- It prevents the default form submission.
- It rejects empty medicine name, dosage, or volume values.
- If `editingMedicationId` exists, it updates the matching record.
- Otherwise, it appends a new record with a generated id and default blue icon color.
- It converts stock and threshold form strings into numbers.
- It creates a `taken` Boolean for each timing.
- It resets the form and edit state.
- During first-time setup, it marks setup complete, closes the modal, and requests notification permission.
- During normal use, it only closes the medication form.

### Lines 169-176: edit and delete actions

`editMedication` copies an existing medicine into the form, converts numeric values to strings for the inputs, stores its id, and opens the modal.

`removeMedication` filters out the selected id. The persistence effect then saves the shortened list.

### Lines 178-186: marking a dose taken

`toggleTaken` locates one medicine and one timing slot.

It copies the current Boolean array, flips the selected slot, and adjusts stock:

- marking a dose taken subtracts one dose, without allowing stock below zero;
- undoing a taken status adds one dose back.

The updated medication is returned to the state array, which also triggers persistence and dashboard recalculation.

### Lines 188-191: derived dashboard values

The dashboard does not store duplicate totals. It derives them from medication state:

- `dosesPlanned` counts every timing across every medicine.
- `dosesTaken` counts all true values in the `taken` arrays.
- `progress` calculates the percentage completed, with zero used when no doses exist.
- `nextMedication` finds the earliest incomplete dose after sorting by stored time.

Derived values reduce the risk that the summary and medicine list disagree.

### Lines 193-205: emergency contact actions

`saveContact` validates the required name and phone fields, applies `Personal contact` when no role is entered, and either updates the selected contact or appends a new contact with a generated id. It then clears the form and edit id.

`editContact` copies a selected contact into the form and stores its id so the next submit updates rather than adds.

### Lines 207-224: authentication screen

When `isLoggedIn` is false, the component returns the authentication page immediately.

The screen contains:

- decorative pulse background elements;
- Sugunacare+ branding;
- a register/sign-in switcher;
- a conditional full-name field during registration;
- required email and six-character minimum password fields;
- a submit button whose label changes with the mode;
- an authentication status message;
- a local-privacy note.

Controlled inputs keep the visible form values synchronized with `authForm` state.

### Line 226: standalone emergency contacts screen

When `activeView` is `Emergency` before the main dashboard return, the app renders the editable contact manager.

The form accepts name, role, and phone. Existing contacts show edit and `tel:` call actions. The back button returns to `Today`.

### Line 228: doctor guidance screen

This screen renders three static care reminders:

1. Keep blood pressure visible.
2. Choose steady movement.
3. Protect the medication and follow-up routine.

The content is educational prototype content and does not replace clinical advice.

### Line 230: standalone lab-report screen

This screen renders simplified sample summaries for lipid profile, blood pressure, and HbA1c. Each card includes an overall status and a next-check date.

The warning text correctly tells the user to share original reports with a doctor before changing treatment.

### Lines 232-240: dashboard shell and navigation

The main authenticated shell contains:

- a responsive sidebar;
- the Sugunacare+ brand mark;
- navigation buttons for Today, Medications, Lab reports, Safety tips, and Doctor guidance;
- quick access to emergency contacts;
- a sign-out action that sets `isLoggedIn` to false;
- a top bar showing the date, user greeting, initials avatar, name, and email.

Each navigation button updates `activeView`. The selected class gives the active item its visual state.

### Lines 241-247: authenticated dashboard content

The dashboard uses conditional rendering for emergency contacts and lab reports. Otherwise it shows the Today view.

The Today view contains:

- a welcome banner with a heartbeat graphic;
- three summary values: today's doses, next reminder, and low-stock medicine count;
- a notification status banner when one exists;
- the medication list;
- progress, heart-health tips, and refill information.

Each medicine card shows its name, volume, dosage, dose buttons, remaining stock, edit action, and delete action. A completed medicine receives a different class when all of its dose slots are true.

The progress card displays the derived percentage and changes its message when all planned doses are complete. The refill strip identifies the first medicine at or below its threshold and links to the medication plan.

### Lines 249-250: medication modal

The modal appears when `showMedicationForm` or `showSetup` is true.

It contains:

- a title that changes between first setup, add, and edit modes;
- an optional close button for normal add/edit mode;
- medicine name, dosage, volume, stock, and threshold fields;
- a dose-count selector from one to four times per day;
- one time selector for each selected dose slot;
- a submit button that saves through `saveMedication`.

The setup version cannot be dismissed before the first reminder is entered. Normal add/edit mode can be closed without saving.

### Lines 251-253: component export

Line 251 closes the `App` function. Line 253 exports it as the default module export so `src/main.tsx` can render it.

## 5. Styling explanation

### `src/index.css`

The global stylesheet sets the base font, text color, background color, font rendering, box sizing, body margin, minimum viewport width, and shared button/input font behavior.

### `src/App.css`

The application stylesheet defines:

- teal, coral, yellow, text, border, and muted color variables;
- the authentication page and dashboard shell;
- responsive sidebar behavior on smaller screens;
- medication cards, dose buttons, stock warnings, and progress indicators;
- emergency, guidance, and report cards;
- modal form layout and time controls;
- the entrance animation and animated heartbeat line;
- mobile breakpoints at 800, 900, and 520 pixels.

The React class names in `App.tsx` are the contract between rendering and styling. A new UI element should receive a focused class rather than changing unrelated global rules.

## 6. Capacitor and Android explanation

`package.json` includes `@capacitor/core`, `@capacitor/android`, and the Capacitor CLI. The existing web application remains the source of the user interface.

`capacitor.config.ts` defines:

- `appId: 'com.sugunacare.plus'`, the Android application identifier;
- `appName: 'Sugunacare+'`, the native application name;
- `webDir: 'dist'`, the Vite output copied into the Android WebView.

The Android workflow is:

```bash
npm run build
npx cap sync android
android\\gradlew.bat -p android assembleDebug
```

The generated APK is written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

The repository also contains the shareable copy `SugunacarePlus-debug.apk`. This is a debug-signed APK for testing and sharing, not a Play Store release build.

`android/local.properties` points Gradle to the local Android SDK. It is machine-specific and should not be treated as application source configuration.

## 7. Complete user flow

1. Open the app.
2. Choose Create account.
3. Enter a name, email, and password of at least six characters.
4. Submit the form.
5. Switch to Sign in and use the same credentials.
6. Enter the first medicine during setup.
7. Allow notifications when prompted.
8. Use the Today screen to mark doses taken.
9. Add, edit, or delete medicines from the medication plan.
10. Review progress and refill warnings.
11. Open emergency contacts to add or call support.
12. Open lab reports or doctor guidance for the sample information.
13. Sign out to return to the authentication screen.

## 8. Validation commands

```bash
npm run lint
npm run build
.\\android\\gradlew.bat -p android assembleDebug
```

The web build and Android debug build have been completed successfully in this workspace.

## 9. Production work still required

Before real clinical use, the application needs secure backend authentication, encrypted and access-controlled health data, server-side authorization, audit logs, robust notification delivery, real report upload and storage, clinician review, accessibility testing, automated tests, privacy compliance, and a release-signed Android build.
