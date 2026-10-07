import pptxgen from 'pptxgenjs'

const pptx = new pptxgen()
pptx.layout = 'LAYOUT_WIDE'
pptx.author = 'Sugunacare+'
pptx.subject = 'Project and code explanation'
pptx.title = 'Sugunacare+ Project Presentation'
pptx.company = 'Sugunacare+'
pptx.lang = 'en-US'
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-US',
}
pptx.defineSlideMaster({
  title: 'MASTER',
  background: { color: 'F5FAF8' },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.18, fill: { color: '0D4D57' }, line: { color: '0D4D57' } } },
    { text: { text: 'SUGUNACARE+', options: { x: 0.55, y: 7.08, w: 2.4, h: 0.18, fontFace: 'Aptos', fontSize: 8, bold: true, color: '138B86', margin: 0 } } },
  ],
  slideNumber: { x: 12.35, y: 7.05, color: '6D8187', fontSize: 8 },
})

const colors = { ink: '17313A', muted: '6D8187', teal: '138B86', deep: '0D4D57', coral: 'EF7567', soft: 'E7F5F2', white: 'FFFFFF' }

function addTitle(slide, title, subtitle = '') {
  slide.addText(title, { x: 0.65, y: 0.62, w: 11.9, h: 0.55, fontSize: 27, bold: true, color: colors.deep, margin: 0 })
  if (subtitle) slide.addText(subtitle, { x: 0.68, y: 1.22, w: 11.5, h: 0.3, fontSize: 12, color: colors.muted, margin: 0 })
}

function addBullets(slide, items, x = 0.9, y = 1.75, w = 11.3, h = 4.7, size = 19) {
  slide.addText(items.map((item) => ({ text: item, options: { bullet: { indent: size + 5 }, hanging: 4 } })), {
    x, y, w, h, fontSize: size, breakLine: true, color: colors.ink, paraSpaceAfterPt: 16, margin: 0.05, valign: 'mid', fit: 'shrink', bullet: { type: 'ul' },
  })
}

function addCode(slide, code, x = 0.85, y = 1.75, w = 11.6, h = 4.5) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: '17313A' }, line: { color: '17313A' } })
  slide.addText(code, { x: x + 0.25, y: y + 0.22, w: w - 0.5, h: h - 0.4, fontFace: 'Consolas', fontSize: 15, color: 'E7F5F2', breakLine: false, margin: 0, fit: 'shrink', valign: 'mid' })
}

function addFooterNote(slide, text) {
  slide.addText(text, { x: 0.7, y: 6.35, w: 11.8, h: 0.3, fontSize: 10, italic: true, color: colors.muted, margin: 0, align: 'center' })
}

let slide = pptx.addSlide('MASTER')
slide.background = { color: colors.deep }
slide.addText('Suguna', { x: 0.85, y: 1.55, w: 5.7, h: 0.75, fontSize: 42, bold: true, color: colors.white, margin: 0 })
slide.addText('care+', { x: 5.25, y: 1.55, w: 2.0, h: 0.75, fontSize: 42, bold: true, color: 'F49B8B', margin: 0 })
slide.addText('Cardiac-care medication dashboard', { x: 0.9, y: 2.65, w: 8.5, h: 0.45, fontSize: 24, color: 'A9EEE0', margin: 0 })
slide.addText('Project presentation and code overview', { x: 0.92, y: 3.25, w: 7.8, h: 0.35, fontSize: 15, color: 'BDD4D2', margin: 0 })
slide.addShape(pptx.ShapeType.arc, { x: 9.0, y: 1.1, w: 3.1, h: 3.1, line: { color: 'F49B8B', width: 2, transparency: 10 }, adjustPoint: 0.25 })
slide.addText('+', { x: 9.95, y: 1.75, w: 1.1, h: 1.1, fontSize: 74, bold: true, color: 'F49B8B', align: 'center', margin: 0 })
addFooterNote(slide, 'Built with React, TypeScript, Vite, and responsive CSS')

slide = pptx.addSlide('MASTER'); addTitle(slide, '1. Project idea', 'A focused daily care workflow')
addBullets(slide, ['Manage medicines and daily dose completion.', 'Keep emergency contacts ready to call.', 'Read prevention guidance and simple report summaries.', 'Make the next care action visible and understandable.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '2. Technology stack')
addBullets(slide, ['React 19 builds the interface.', 'TypeScript defines safer medication, account, contact, and profile data.', 'Vite runs development and creates the production bundle.', 'CSS provides responsive dashboard layouts.', 'localStorage provides persistence for this browser-based prototype.', 'Browser Notification API schedules reminders while the app is open.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '3. Application structure', 'How the browser reaches the dashboard')
addCode(slide, 'index.html\n  -> src/main.tsx\n       -> src/App.tsx\n            -> src/App.css\n            -> src/index.css')
addFooterNote(slide, 'main.tsx mounts App; App owns the current application behavior')

slide = pptx.addSlide('MASTER'); addTitle(slide, '4. Typed medication data', 'One record can represent several daily dose slots')
addCode(slide, "{\n  name: 'Metformin',\n  timings: ['08:00', '13:00', '20:00'],\n  taken: [true, false, false]\n}")
addFooterNote(slide, 'The timings and taken arrays use matching indexes')

slide = pptx.addSlide('MASTER'); addTitle(slide, '5. Multiple doses and reminders')
addBullets(slide, ['The user selects one to four doses per day.', 'Each timing gets its own Take button.', 'Progress counts dose slots rather than medicine names.', 'Notifications are scheduled for every timing.', 'Editing a medicine preserves existing completion values where possible.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '6. 12-hour time handling')
addBullets(slide, ['Storage remains in reliable 24-hour HH:mm format.', 'The form presents hour, minute, and AM/PM selectors.', 'displayTime converts stored values to labels such as 8:00 AM.', 'timeParts and timeValue translate between the UI and stored value.', 'This keeps sorting and browser timers predictable.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '7. Add, edit, and delete medicines')
addBullets(slide, ['One form handles both add and edit modes.', 'editingMedicationId identifies the record being changed.', 'Edit loads the existing medication into the form.', 'Delete filters the selected medicine from state.', 'Medication changes are persisted to localStorage.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '8. Signup and login')
addBullets(slide, ['Signup stores a local demo account and returns to sign in.', 'Login compares the entered email and password with that account.', 'Invalid credentials show an error and do not open the dashboard.', 'A production system needs server-side authentication and password hashing.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '9. Emergency contacts')
addBullets(slide, ['Users can add personal contacts.', 'Users can edit names, roles, and phone numbers.', 'Contacts persist in localStorage.', 'Phone numbers render as tel: links for compatible devices.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '10. Guidance and reports')
addBullets(slide, ['Doctor guidance gives short prevention reminders.', 'Reports show status, plain-language summary, and future check date.', 'The content supports personal tracking.', 'It does not replace advice from a qualified clinician.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '11. State and persistence')
addBullets(slide, ['React state controls screens, forms, medications, contacts, and authentication feedback.', 'useEffect saves profile, account, medication, and contact changes.', 'Derived values calculate planned doses, completed doses, progress, and next reminder.', 'Derived totals reduce duplicated state and inconsistent dashboard values.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '12. Run and validate')
addCode(slide, 'npm install\nnpm run dev\n\n# Open http://localhost:5173/\n\nnpm run build\nnpm run lint\nnpm run deploy:check')

slide = pptx.addSlide('MASTER'); addTitle(slide, '13. Limitations and next steps')
addBullets(slide, ['The prototype supports one local account per browser.', 'Credentials are not securely hashed.', 'Notifications require the app to remain open.', 'Report content is sample content.', 'Next: secure backend, database, push notifications, report upload, and automated tests.'])

slide = pptx.addSlide('MASTER'); addTitle(slide, '14. Closing summary')
slide.addText('Make the next care action visible, understandable, and easy to complete.', { x: 1.0, y: 2.45, w: 11.2, h: 0.9, fontSize: 30, bold: true, color: colors.deep, align: 'center', valign: 'mid', margin: 0.1, fit: 'shrink' })
slide.addText('Sugunacare+ combines typed React state, multi-dose scheduling, local persistence, and care-oriented dashboard views.', { x: 1.3, y: 3.75, w: 10.7, h: 0.7, fontSize: 17, color: colors.muted, align: 'center', margin: 0.1, fit: 'shrink' })

await pptx.writeFile({ fileName: 'docs/Sugunacare-Plus-Presentation.pptx' })
