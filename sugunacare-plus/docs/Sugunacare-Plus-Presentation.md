% Sugunacare+
% Cardiac-care medication dashboard
% Project presentation

---

# 1. Project idea

- A calm browser dashboard for medication and cardiac-care routines.
- Makes doses, reminders, contacts, and reports visible in one place.
- Designed for a user who needs a simple daily care workflow.

---

# 2. Main goals

- Track medicines and daily dose completion.
- Support multiple doses for the same medicine.
- Keep emergency contacts ready to call.
- Provide prevention guidance and simple report summaries.
- Offer a responsive experience on desktop and mobile.

---

# 3. Technology stack

- React 19 for the interface.
- TypeScript for safer data structures.
- Vite for development and production builds.
- CSS for responsive layout and visual styling.
- Browser `localStorage` for demo persistence.
- Browser Notification API for reminders.

---

# 4. Application structure

```text
index.html
  -> src/main.tsx
       -> src/App.tsx
            -> App.css
            -> index.css
```

- `main.tsx` mounts React.
- `App.tsx` owns the current application behavior.
- `App.css` defines the dashboard visual system.
- `README.md` documents setup and deployment.

---

# 5. React entry point

`src/main.tsx`:

- Imports `StrictMode`.
- Finds the HTML `root` element.
- Renders the `App` component.
- Loads global styles before the app appears.

This gives the browser one root React tree.

---

# 6. Typed application data

The app defines TypeScript types for:

- `Medication`
- `EmergencyContact`
- `StoredAccount`
- `UserProfile`

A medication contains a `timings` array and a matching `taken` array.

Example:

```ts
{
  name: 'Metformin',
  timings: ['08:00', '13:00', '20:00'],
  taken: [true, false, false]
}
```

This represents three planned doses and one completed dose.

---

# 7. Multiple dose slots

- The user selects 1 to 4 doses per day.
- Each dose has its own time.
- Each slot has its own Taken button.
- Progress counts dose slots, not just medicine names.
- Browser reminders are scheduled for every timing.

This supports medicines taken two or three times in one day.

---

# 8. 12-hour time display

The app stores times internally as `HH:mm` values.

The UI displays familiar labels:

- `08:00` becomes `8:00 AM`.
- `13:00` becomes `1:00 PM`.
- `20:00` becomes `8:00 PM`.

`timeParts` supports the input controls, while `timeValue` converts them back for storage and scheduling.

---

# 9. Add, edit, and delete medicines

The medication form supports two modes:

- Add mode creates a new record.
- Edit mode loads an existing record and updates it.

The medication card provides:

- individual dose completion buttons;
- an Edit action;
- a Delete action;
- remaining stock information.

One form reduces duplicate UI and keeps validation consistent.

---

# 10. Signup and login

Signup:

1. Accepts name, email, and password.
2. Saves a demo account in browser storage.
3. Returns the user to the sign-in mode.

Login:

1. Reads the stored account.
2. Compares email and password.
3. Shows an error for invalid credentials.
4. Opens the dashboard only after a match.

Production systems must use secure server-side authentication.

---

# 11. Emergency contacts

- Contacts are stored in local storage.
- Users can add personal contacts.
- Users can edit names, roles, and phone numbers.
- Phone values become `tel:` links for calling.

This keeps support information available during an urgent situation.

---

# 12. Doctor guidance and reports

Doctor guidance provides short prevention reminders:

- monitor blood pressure;
- choose suitable movement;
- protect the medication and follow-up routine.

Reports provide:

- a status label;
- a plain-language summary;
- a future check date.

The content is for personal tracking and does not replace clinical advice.

---

# 13. State and persistence

React state controls the current screen and interactions.

`useEffect` persists changes:

- `sugunacare-profile`
- `sugunacare-account`
- `sugunacare-medications`
- `sugunacare-emergency-contacts`

When the browser reloads, the app reconstructs the dashboard from those values.

---

# 14. Validation and commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run deploy:check
```

The project has been checked with the production build and linter.

---

# 15. Limitations and next steps

Current prototype limitations:

- one local account per browser;
- credentials are not securely hashed;
- reminders require the app to remain open;
- report content is sample content;
- no server or database is connected.

Future production work:

- secure authentication and role-based access;
- backend database and encrypted health data;
- push notifications;
- real report upload and clinician review;
- automated tests for auth and medication flows.

---

# 16. Closing summary

Sugunacare+ combines a focused React interface with typed data, multi-dose scheduling, local persistence, and care-oriented dashboard views.

The key design principle is simple:

> Make the next care action visible, understandable, and easy to complete.
