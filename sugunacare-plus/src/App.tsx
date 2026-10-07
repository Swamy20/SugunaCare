import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Medication = {
  id: number
  name: string
  dosage: string
  volume: string
  timings: string[]
  stock: number
  threshold: number
  color: string
  taken?: boolean[]
}

type UserProfile = { name: string; email: string }
type EmergencyContact = { id: number; name: string; role: string; phone: string }
type StoredAccount = { name: string; email: string; password: string }

const defaultMedications: Medication[] = [
  { id: 1, name: 'Amlodipine', dosage: '5 mg', volume: '1 tablet', timings: ['08:00'], stock: 18, threshold: 7, color: 'coral' },
  { id: 2, name: 'Metformin', dosage: '500 mg', volume: '1 tablet', timings: ['13:00'], stock: 26, threshold: 10, color: 'mint' },
  { id: 3, name: 'Vitamin D3', dosage: '1000 IU', volume: '1 capsule', timings: ['20:00'], stock: 4, threshold: 7, color: 'yellow' },
]

const defaultContacts: EmergencyContact[] = [
  { id: 1, name: 'Rahul Rao', role: 'Family caregiver', phone: '+91 98765 43210' },
  { id: 2, name: 'Dr. Meera Iyer', role: 'Cardiologist', phone: '+91 98123 45678' },
]
const emptyMedication = { name: '', dosage: '', volume: '1 tablet', timings: ['08:00'], stock: '30', threshold: '7' }
const defaultProfile: UserProfile = { name: 'Care user', email: '' }

function displayTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${suffix}`
}

function timeParts(value: string) {
  const [rawHours, minutes] = value.split(':')
  const hours = Number(rawHours)
  return { hour: String(hours % 12 || 12), minute: minutes, period: hours >= 12 ? 'PM' : 'AM' }
}

function timeValue(hour: string, minute: string, period: string) {
  let hours = Number(hour) % 12
  if (period === 'PM') hours += 12
  return `${String(hours).padStart(2, '0')}:${minute}`
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [activeView, setActiveView] = useState('Today')
  const [showMedicationForm, setShowMedicationForm] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sugunacare-profile')
    return saved ? JSON.parse(saved) : defaultProfile
  })
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('sugunacare-medications')
    if (!saved) return defaultMedications
    return (JSON.parse(saved) as Array<Medication & { timing?: string }>).map((medication) => ({
      ...medication,
      timings: medication.timings || [medication.timing || '08:00'],
      taken: Array.from({ length: medication.timings?.length || 1 }, (_, index) => medication.taken?.[index] || false),
    }))
  })
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('sugunacare-emergency-contacts')
    return saved ? JSON.parse(saved) : defaultContacts
  })
  const [contactForm, setContactForm] = useState({ name: '', role: '', phone: '' })
  const [editingContactId, setEditingContactId] = useState<number | null>(null)
  const [newMedication, setNewMedication] = useState(emptyMedication)
  const [editingMedicationId, setEditingMedicationId] = useState<number | null>(null)

  useEffect(() => {
    localStorage.setItem('sugunacare-medications', JSON.stringify(medications))
  }, [medications])

  useEffect(() => {
    localStorage.setItem('sugunacare-emergency-contacts', JSON.stringify(contacts))
  }, [contacts])

  useEffect(() => {
    const timers: number[] = []
    medications.forEach((medication) => {
      medication.timings.forEach((timing) => {
        const scheduleNext = () => {
        const [hours, minutes] = timing.split(':').map(Number)
        const next = new Date()
        next.setHours(hours, minutes, 0, 0)
        if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1)
        const timer = window.setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Time for ${medication.name}`, { body: `${medication.volume} - ${medication.dosage}` })
          }
          scheduleNext()
        }, next.getTime() - Date.now())
        timers.push(timer)
      }
      scheduleNext()
      })
    })
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [medications])

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationMessage('Notifications are not supported by this browser.')
      return
    }
    const permission = await Notification.requestPermission()
    setNotificationMessage(permission === 'granted' ? 'Daily medicine notifications are enabled.' : 'Notifications are blocked. Allow them in your browser settings to receive reminders.')
  }

  const handleAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const email = authForm.email.trim().toLowerCase()
    const savedAccount = localStorage.getItem('sugunacare-account')
    if (authMode === 'register') {
      const nextAccount: StoredAccount = { name: authForm.name.trim(), email, password: authForm.password }
      localStorage.setItem('sugunacare-account', JSON.stringify(nextAccount))
      setAuthMessage('Account created. Sign in with your new credentials.')
      setAuthMode('login')
      setAuthForm({ name: '', email, password: '' })
      return
    }
    const account = savedAccount ? JSON.parse(savedAccount) as StoredAccount : null
    if (!account || account.email !== email || account.password !== authForm.password) {
      setAuthMessage('No matching account found. Sign up first or check your credentials.')
      return
    }
    const nextProfile = { name: account.name || email.split('@')[0] || defaultProfile.name, email: account.email }
    setProfile(nextProfile)
    localStorage.setItem('sugunacare-profile', JSON.stringify(nextProfile))
    setAuthMessage('')
    setIsLoggedIn(true)
    if (localStorage.getItem('sugunacare-setup-complete') !== 'true') setShowSetup(true)
  }

  const saveMedication = (event: FormEvent<HTMLFormElement>, closeSetup = false) => {
    event.preventDefault()
    if (!newMedication.name.trim() || !newMedication.dosage.trim() || !newMedication.volume.trim()) return
    setMedications((current) => editingMedicationId ? current.map((medication) => medication.id === editingMedicationId ? {
      ...medication, name: newMedication.name.trim(), dosage: newMedication.dosage.trim(), volume: newMedication.volume.trim(), timings: newMedication.timings,
      stock: Number(newMedication.stock), threshold: Number(newMedication.threshold), taken: newMedication.timings.map((_, index) => medication.taken?.[index] || false),
    } : medication) : [...current, {
      id: Date.now(), name: newMedication.name.trim(), dosage: newMedication.dosage.trim(), volume: newMedication.volume.trim(),
      timings: newMedication.timings, stock: Number(newMedication.stock), threshold: Number(newMedication.threshold), color: 'blue', taken: newMedication.timings.map(() => false),
    }])
    setNewMedication(emptyMedication)
    setEditingMedicationId(null)
    if (closeSetup) {
      localStorage.setItem('sugunacare-setup-complete', 'true')
      setShowSetup(false)
      requestNotifications()
    } else setShowMedicationForm(false)
  }

  const editMedication = (medication: Medication) => {
    setEditingMedicationId(medication.id)
    setNewMedication({ name: medication.name, dosage: medication.dosage, volume: medication.volume, timings: medication.timings, stock: String(medication.stock), threshold: String(medication.threshold) })
    setShowMedicationForm(true)
  }

  const removeMedication = (id: number) => {
    setMedications((current) => current.filter((medication) => medication.id !== id))
  }

  const toggleTaken = (id: number, slot: number) => {
    setMedications((current) => current.map((medication) => {
      if (medication.id !== id) return medication
      const taken = [...(medication.taken || medication.timings.map(() => false))]
      const wasTaken = taken[slot]
      taken[slot] = !wasTaken
      return { ...medication, taken, stock: wasTaken ? medication.stock + 1 : Math.max(0, medication.stock - 1) }
    }))
  }

  const dosesPlanned = medications.reduce((total, medication) => total + medication.timings.length, 0)
  const dosesTaken = medications.reduce((total, medication) => total + (medication.taken || []).filter(Boolean).length, 0)
  const progress = dosesPlanned ? Math.round((dosesTaken / dosesPlanned) * 100) : 0
  const nextMedication = medications.flatMap((medication) => medication.timings.map((timing, slot) => ({ medication, timing, slot }))).filter(({ medication, slot }) => !medication.taken?.[slot]).sort((a, b) => a.timing.localeCompare(b.timing))[0]

  const saveContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!contactForm.name.trim() || !contactForm.phone.trim()) return
    const contact = { name: contactForm.name.trim(), role: contactForm.role.trim() || 'Personal contact', phone: contactForm.phone.trim() }
    setContacts((current) => editingContactId ? current.map((item) => item.id === editingContactId ? { ...item, ...contact } : item) : [...current, { id: Date.now(), ...contact }])
    setContactForm({ name: '', role: '', phone: '' })
    setEditingContactId(null)
  }

  const editContact = (contact: EmergencyContact) => {
    setEditingContactId(contact.id)
    setContactForm({ name: contact.name, role: contact.role, phone: contact.phone })
  }

  if (!isLoggedIn) return <main className="auth-page">
    <div className="pulse-background" aria-hidden="true"><span>+</span><i>ECG</i></div>
    <section className="auth-panel">
      <div className="brand-mark"><span>+</span></div>
      <p className="eyebrow">CARDIAC CARE, MADE SIMPLE</p>
      <h1>Suguna<span>care+</span></h1>
      <p className="auth-intro">A calm, clear place to manage your medicines, daily heart-health habits, and care reminders.</p>
      <div className="auth-switcher" role="tablist"><button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Create account</button><button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Sign in</button></div>
      <form className="auth-form" onSubmit={handleAuth}>
        {authMode === 'register' && <label>Full name<input required value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="e.g. Ananya Rao" /></label>}
        <label>Email address<input required type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@example.com" /></label>
        <label>Password<input required type="password" minLength={6} value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="At least 6 characters" /></label>
        <button className="primary-button" type="submit">{authMode === 'register' ? 'Create my care space' : 'Open my care space'} <span>-&gt;</span></button>
      </form>
      {authMessage && <p className="auth-message" role="status">{authMessage}</p>}
      <p className="privacy-note">Your health details stay private on this device.</p>
    </section>
  </main>

  if (activeView === 'Emergency') return <main className="app-shell"><section className="content-area standalone-view"><button className="text-button" onClick={() => setActiveView('Today')}>Back to dashboard</button><div className="section-heading"><div><p className="eyebrow">HELP WHEN IT MATTERS</p><h1>Emergency contacts</h1><p>Keep family and clinical support within one tap.</p></div></div><form className="contact-form" onSubmit={saveContact}><input required placeholder="Name" value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} /><input placeholder="Relationship or role" value={contactForm.role} onChange={(event) => setContactForm({ ...contactForm, role: event.target.value })} /><input required type="tel" placeholder="Phone number" value={contactForm.phone} onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })} /><button className="primary-button" type="submit">{editingContactId ? 'Update contact' : 'Add contact'}</button></form><div className="emergency-grid">{contacts.map((contact) => <div className="emergency-card" key={contact.id}><span>CALL</span><div><strong>{contact.name}</strong><small>{contact.role} - {contact.phone}</small></div><button className="text-button" onClick={() => editContact(contact)}>Edit</button><a href={`tel:${contact.phone.replace(/\s/g, '')}`}><b>CALL</b></a></div>)}</div></section></main>

  if (activeView === 'Doctor guidance') return <main className="app-shell"><section className="content-area standalone-view"><button className="text-button" onClick={() => setActiveView('Today')}>Back to dashboard</button><div className="section-heading"><div><p className="eyebrow">CARE TEAM NOTES</p><h1>Doctor guidance</h1><p>Simple prevention habits to discuss with your care team.</p></div></div><div className="guidance-grid"><article><span>01</span><h3>Keep blood pressure visible</h3><p>Check it at a consistent time and record unusual readings for your doctor.</p></article><article><span>02</span><h3>Choose steady movement</h3><p>Aim for gentle daily activity that fits your care plan. Stop if you feel unwell.</p></article><article><span>03</span><h3>Protect your routine</h3><p>Take medicines as prescribed, limit excess salt, and keep follow-up visits.</p></article></div></section></main>

  if (activeView === 'Lab reports') return <main className="app-shell"><section className="content-area standalone-view"><button className="text-button" onClick={() => setActiveView('Today')}>Back to dashboard</button><div className="section-heading"><div><p className="eyebrow">HEALTH RECORDS</p><h1>Lab reports</h1><p>Simple summaries and the next date to check in.</p></div></div><div className="report-grid"><article className="report-card"><span className="report-status good">IN RANGE</span><h3>Lipid profile</h3><p className="report-summary">Your cholesterol readings are currently in the expected range.</p><dl><div><dt>Next check</dt><dd>18 December 2026</dd></div></dl></article><article className="report-card"><span className="report-status watch">REVIEW</span><h3>Blood pressure panel</h3><p className="report-summary">The reading is slightly above ideal. Continue tracking and discuss it at your next visit.</p><dl><div><dt>Next check</dt><dd>11 October 2026</dd></div></dl></article><article className="report-card"><span className="report-status good">IN RANGE</span><h3>HbA1c</h3><p className="report-summary">Your average blood sugar result is below the review threshold.</p><dl><div><dt>Next check</dt><dd>01 December 2026</dd></div></dl></article></div><p className="report-note">Summaries support personal tracking. Share the original report with your doctor before changing treatment.</p></section></main>

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand-lockup"><div className="brand-mark small"><span>+</span></div><span>Suguna<span>care+</span></span></div>
      <div className="side-label">MY CARE</div>
      <nav>{['Today', 'Medications', 'Lab reports', 'Safety tips', 'Doctor guidance'].map((item) => <button key={item} className={activeView === item ? 'selected' : ''} onClick={() => setActiveView(item)}><span className="nav-icon">{item === 'Today' ? 'O' : item === 'Medications' ? 'M' : item === 'Lab reports' ? 'L' : item === 'Safety tips' ? 'T' : 'D'}</span>{item}</button>)}</nav>
      <div className="sidebar-bottom"><div className="side-label">QUICK ACCESS</div><button onClick={() => setActiveView('Emergency')}><span className="nav-icon">!</span>Emergency contacts</button><button onClick={() => setIsLoggedIn(false)}><span className="nav-icon">&lt;-</span>Sign out</button></div>
    </aside>
    <section className="content-area">
      <header className="topbar"><div><p className="eyebrow">THURSDAY, 18 SEPTEMBER 2026</p><h2>Good morning, {profile.name}</h2></div><div className="profile"><div className="avatar">{profile.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div><div><strong>{profile.name}</strong><small>{profile.email || 'Cardiac care profile'}</small></div></div></header>
      {activeView === 'Emergency' ? <section className="emergency-view"><div className="section-heading"><div><p className="eyebrow">HELP WHEN IT MATTERS</p><h1>Emergency contacts</h1><p>Keep family and clinical support within one tap.</p></div></div><div className="emergency-grid"><a className="emergency-card urgent" href="tel:+919876543210"><span>FAM</span><div><strong>Rahul Rao</strong><small>Family caregiver - +91 98765 43210</small></div><b>CALL</b></a><a className="emergency-card" href="tel:+919812345678"><span>DOC</span><div><strong>Dr. Meera Iyer</strong><small>Cardiologist - +91 98123 45678</small></div><b>CALL</b></a></div></section> : activeView === 'Lab reports' ? <section className="reports-view"><div className="section-heading"><div><p className="eyebrow">HEALTH RECORDS</p><h1>Lab reports</h1><p>Keep recent results together for your care team.</p></div><button className="outline-button">Upload report</button></div><div className="report-grid"><article className="report-card"><div><span className="report-status good">IN RANGE</span><h3>Lipid profile</h3><small>18 September 2026 - CityCare Labs</small></div><strong>View report -&gt;</strong><dl><div><dt>LDL cholesterol</dt><dd>98 mg/dL</dd></div><div><dt>HDL cholesterol</dt><dd>52 mg/dL</dd></div><div><dt>Triglycerides</dt><dd>134 mg/dL</dd></div></dl></article><article className="report-card"><div><span className="report-status watch">REVIEW</span><h3>Blood pressure panel</h3><small>11 September 2026 - CityCare Labs</small></div><strong>View report -&gt;</strong><dl><div><dt>Systolic</dt><dd>128 mmHg</dd></div><div><dt>Diastolic</dt><dd>82 mmHg</dd></div><div><dt>Heart rate</dt><dd>72 bpm</dd></div></dl></article><article className="report-card"><div><span className="report-status good">IN RANGE</span><h3>HbA1c</h3><small>01 September 2026 - CityCare Labs</small></div><strong>View report -&gt;</strong><dl><div><dt>Result</dt><dd>5.8%</dd></div><div><dt>Reference</dt><dd>Below 6.5%</dd></div><div><dt>Next check</dt><dd>Dec 2026</dd></div></dl></article></div><p className="report-note">These summaries are for personal tracking. Share the original report with your doctor before making treatment changes.</p></section> : <>
        <section className="welcome-banner"><div><p className="eyebrow">YOUR HEART HEALTH, IN RHYTHM</p><h1>Small steps.<br /><em>Steadier days.</em></h1><p>Track every dose and keep your care routine visible.</p></div><div className="pulse-graphic" aria-label="Heartbeat pulse illustration"><span>+</span><svg viewBox="0 0 240 100" aria-hidden="true"><path d="M0 52h40l16-1 12-34 15 68 16-43 12 10h25l12-1 14-33 16 67 16-33h46" /></svg></div></section>
        <section className="health-summary"><div><span className="summary-label">TODAY'S DOSES</span><strong>{dosesTaken}/{dosesPlanned}</strong><small>completed</small></div><div><span className="summary-label">NEXT REMINDER</span><strong>{nextMedication ? displayTime(nextMedication.timing) : 'Complete'}</strong><small>{nextMedication?.medication.name || 'All doses logged'}</small></div><div><span className="summary-label">LOW STOCK</span><strong>{medications.filter((medication) => medication.stock <= medication.threshold).length}</strong><small>medicines to refill</small></div></section>
        {notificationMessage && <div className="notification-banner" role="status">{notificationMessage}</div>}
        <section className="dashboard-grid"><div className="medication-section"><div className="section-heading"><div><p className="eyebrow">MEDICATION PLAN</p><h2>Today's medicines</h2></div><button className="text-button" onClick={() => { setEditingMedicationId(null); setNewMedication(emptyMedication); setShowMedicationForm(true) }}>+ Add medicine</button></div><div className="medication-list">{medications.map((medication) => <article className={`medication-card ${(medication.taken || []).every(Boolean) ? 'completed' : ''}`} key={medication.id}><div className={`med-icon ${medication.color}`}>+</div><div className="med-info"><h3>{medication.name}</h3><p>{medication.volume} <span>-</span> {medication.dosage}</p><div className="dose-slots">{medication.timings.map((timing, slot) => <button className="take-button" key={`${timing}-${slot}`} onClick={() => toggleTaken(medication.id, slot)}>{displayTime(timing)}: {medication.taken?.[slot] ? 'Taken' : 'Mark taken'}</button>)}</div></div><div className={`stock ${medication.stock <= medication.threshold ? 'low' : ''}`}><strong>{medication.stock}</strong><small>doses left</small></div><div className="medication-actions"><button className="text-button" onClick={() => editMedication(medication)}>Edit</button><button className="text-button danger-button" onClick={() => removeMedication(medication.id)}>Delete</button></div></article>)}</div></div><aside className="right-column"><div className="progress-card"><div className="progress-head"><div><p className="eyebrow">TODAY'S PROGRESS</p><h3>{dosesTaken} of {dosesPlanned} doses</h3></div><div className="progress-ring">{progress}%</div></div><div className="progress-bar"><span style={{ width: `${progress}%` }} /></div><p className="muted">{progress === 100 ? 'Every planned dose is complete.' : 'Keep your routine steady today.'}</p></div><div className="tips-card"><div className="tips-title"><span>+</span><div><p className="eyebrow">HEART HEALTH TIP</p><h3>Make reminders easier</h3></div></div><p>Keep your medicines beside your water bottle and take them at the same time each day.</p><button className="text-button" onClick={requestNotifications}>Enable reminders -&gt;</button></div></aside></section>
        <section className="refill-strip"><div className="refill-icon">!</div><div><p className="eyebrow">REFILL RADAR</p><h3>{medications.find((medication) => medication.stock <= medication.threshold)?.name || 'Your medicine cabinet is ready'}</h3><p>{medications.some((medication) => medication.stock <= medication.threshold) ? 'A medicine is below your refill threshold.' : 'All medicines have enough doses for now.'}</p></div><button className="outline-button" onClick={() => setActiveView('Medications')}>Review plan -&gt;</button></section>
      </>}
    </section>
    {(showMedicationForm || showSetup) && <div className="modal-backdrop"><form className="medication-form" onSubmit={(event) => saveMedication(event, showSetup)}><div className="section-heading"><div><p className="eyebrow">{showSetup ? 'FIRST STEP' : 'MEDICATION PLAN'}</p><h2>{showSetup ? 'Set your first reminder' : editingMedicationId ? 'Edit medicine' : 'Add a medicine'}</h2></div>{!showSetup && <button type="button" className="icon-button" onClick={() => { setShowMedicationForm(false); setEditingMedicationId(null) }}>X</button>}</div>{showSetup && <p className="modal-intro">Tell us what you take, how much, and when. We will remind you at those times each day.</p>}<label>Medicine name<input required value={newMedication.name} onChange={(event) => setNewMedication({ ...newMedication, name: event.target.value })} placeholder="e.g. Atorvastatin" /></label><label>Strength / dosage<input required value={newMedication.dosage} onChange={(event) => setNewMedication({ ...newMedication, dosage: event.target.value })} placeholder="e.g. 10 mg" /></label><label>Volume to take<input required value={newMedication.volume} onChange={(event) => setNewMedication({ ...newMedication, volume: event.target.value })} placeholder="e.g. 1 tablet or 5 ml" /></label><label>Number of doses per day<select value={newMedication.timings.length} onChange={(event) => { const count = Number(event.target.value); setNewMedication({ ...newMedication, timings: Array.from({ length: count }, (_, index) => newMedication.timings[index] || `${String(8 + index * 4).padStart(2, '0')}:00`) }) }}><option value="1">1 time</option><option value="2">2 times</option><option value="3">3 times</option><option value="4">4 times</option></select></label><div className="form-row">{newMedication.timings.map((timing, index) => { const parts = timeParts(timing); return <div className="time-field" key={index}><label>Time {index + 1}<div className="time-inputs"><select value={parts.hour} onChange={(event) => setNewMedication({ ...newMedication, timings: newMedication.timings.map((item, itemIndex) => itemIndex === index ? timeValue(event.target.value, parts.minute, parts.period) : item) })}>{Array.from({ length: 12 }, (_, hour) => <option key={hour + 1}>{hour + 1}</option>)}</select><span>:</span><select value={parts.minute} onChange={(event) => setNewMedication({ ...newMedication, timings: newMedication.timings.map((item, itemIndex) => itemIndex === index ? timeValue(parts.hour, event.target.value, parts.period) : item) })}>{['00', '15', '30', '45'].map((minute) => <option key={minute}>{minute}</option>)}</select><select value={parts.period} onChange={(event) => setNewMedication({ ...newMedication, timings: newMedication.timings.map((item, itemIndex) => itemIndex === index ? timeValue(parts.hour, parts.minute, event.target.value) : item) })}><option>AM</option><option>PM</option></select></div></label></div> })}<label>Doses available<input type="number" min="0" value={newMedication.stock} onChange={(event) => setNewMedication({ ...newMedication, stock: event.target.value })} /></label><label>Refill alert<input type="number" min="0" value={newMedication.threshold} onChange={(event) => setNewMedication({ ...newMedication, threshold: event.target.value })} /></label></div><button className="primary-button" type="submit">{showSetup ? 'Save and enable reminders' : editingMedicationId ? 'Update medicine' : 'Save medicine'} <span>-&gt;</span></button></form></div>}
  </main>
}

export default App
