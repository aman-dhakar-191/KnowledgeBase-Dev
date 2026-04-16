# 📚 Personal Knowledge Base System

A **Firebase + GitHub Hybrid** personal knowledge management application built with React, Firebase Cloud Functions, Firestore, and GitHub API backup.

---

## 🏗️ Architecture

```
Frontend (React/Vite → Firebase Hosting)
        ↓
Cloud Functions (Express API Layer)
        ↓
 ┌──────────────────┬───────────────────┐
 │                  │                   │
Firestore DB    GitHub Repo        Security
Primary Store   Backup Store      (Admin SDK)
```

---

## ✨ Features

- 📝 **Create, Edit, Delete Notes** with Markdown support
- 📁 **Categories & Sections** for structured organization
- 🏷️ **Tags** with color-coded filtering
- 🔍 **Real-time Search** across all notes
- 🔄 **GitHub Backup** – every note is versioned in a GitHub repository
- 📱 **Responsive Design** – works on mobile, tablet, and desktop
- 🔢 **Version Tracking** – automatic version increment on updates
- ✅ **Sync Status** – SYNCED / PENDING / FAILED tracking

---

## 📁 Project Structure

```
KnowledgeBase-Dev/
├── frontend/                    # React + Vite application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Header.jsx       # Top navigation bar
│   │   │   ├── Sidebar.jsx      # Category/section navigation
│   │   │   ├── NoteCard.jsx     # Note preview card
│   │   │   ├── NoteEditor.jsx   # Markdown note editor
│   │   │   ├── SearchBar.jsx    # Search input
│   │   │   ├── Modal.jsx        # Reusable modal dialog
│   │   │   └── LoadingSpinner.jsx
│   │   ├── contexts/
│   │   │   └── AppContext.jsx   # Global state management
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # / — Overview with stats
│   │   │   ├── NotesList.jsx    # /notes — Browse & filter
│   │   │   ├── NoteView.jsx     # /note/:id — View & edit
│   │   │   └── NewNote.jsx      # /new — Create note
│   │   ├── services/
│   │   │   ├── api.js           # HTTP calls to Cloud Functions
│   │   │   └── firebase.js      # Firebase SDK initialization
│   │   ├── App.jsx              # Router + layout
│   │   └── App.css              # Global styles
│   ├── .env.example             # Environment variable template
│   └── package.json
│
├── functions/                   # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.js             # Express app + CORS + function export
│   │   ├── notes/
│   │   │   ├── index.js         # Notes CRUD routes
│   │   │   ├── categories.js    # Categories routes
│   │   │   ├── sections.js      # Sections routes
│   │   │   └── tags.js          # Tags routes
│   │   └── services/
│   │       ├── firestore.js     # Firestore admin setup
│   │       └── github.js        # GitHub API (Octokit) service
│   ├── .env.example             # Functions env template
│   └── package.json
│
├── firebase.json                # Firebase configuration
├── .firebaserc                  # Firebase project alias
├── firestore.rules              # Firestore security rules
└── firestore.indexes.json       # Firestore composite indexes
```

---

## ⚙️ Pre-Configuration Steps

### 1. Prerequisites

Ensure you have the following installed:

```bash
node --version    # v18 or later required
npm --version     # v8 or later
firebase --version  # Firebase CLI
```

Install Firebase CLI if not installed:

```bash
npm install -g firebase-tools
```

---

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → Enter project name → Continue
3. Enable **Google Analytics** (optional) → Create project

#### Enable Required Services:

**Firestore:**
- Firebase Console → Build → Firestore Database
- Click **Create database** → Start in **production mode** → Choose region → Done

**Firebase Hosting:**
- Firebase Console → Build → Hosting
- Click **Get started** → Follow the wizard

**Cloud Functions:**
- Firebase Console → Build → Functions
- Click **Get started** (requires Blaze plan for external network calls)

> ⚠️ **Note:** Cloud Functions with external APIs (GitHub) requires the **Blaze (pay-as-you-go)** Firebase plan.

---

### 3. Get Firebase Web Configuration

1. Firebase Console → Project Settings (gear icon) → General tab
2. Scroll to **Your apps** → Click web app icon (`</>`)
3. Register app with a nickname → Continue
4. Copy the config values (you'll need these for `.env.local`)

---

### 4. GitHub Personal Access Token (PAT)

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scopes: **`repo`** (Full control of private repositories)
4. Generate and **copy the token** (shown only once!)

---

## 🚀 Installation & Setup

### Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/aman-dhakar-191/KnowledgeBase-Dev.git
cd KnowledgeBase-Dev

# Install frontend dependencies
cd frontend
npm install

# Install functions dependencies
cd ../functions
npm install
```

---

### Frontend Environment Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# For local development with Firebase Emulator:
VITE_FUNCTIONS_URL=http://localhost:5001/your-project-id/us-central1/api
```

---

### Functions Environment Setup

```bash
cd functions
cp .env.example .env
```

Edit `functions/.env`:

```env
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_OWNER=your-github-username
GITHUB_REPO=KnowledgeBase-Dev
GITHUB_BRANCH=main
```

---

### Firebase Project Configuration

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the project root
firebase use --add
# Select your project, alias it as "default"
```

Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

---

## 🧪 Local Development

### Option 1: Firebase Emulator (Recommended)

```bash
# From project root
firebase emulators:start

# In a separate terminal - start frontend dev server
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

### Option 2: Frontend Only (Mock API)

```bash
cd frontend
npm run dev
```

> When running without the emulator, API calls will fail. The UI renders but data won't load.

---

## 🏗️ Build

```bash
# Build the React frontend
cd frontend
npm run build
# Output: frontend/dist/
```

---

## 🚀 Post-Configuration & Deployment

### 1. Set Functions Environment Variables (Production)

```bash
firebase functions:config:set \
  github.token="ghp_your_token" \
  github.owner="your-github-username" \
  github.repo="KnowledgeBase-Dev" \
  github.branch="main"
```

Then update `functions/src/services/github.js` to read from `functions.config()` if using the older config approach, OR set the `.env` variables in your CI/CD pipeline.

---

### 2. Deploy Cloud Functions

```bash
cd /path/to/KnowledgeBase-Dev
firebase deploy --only functions
```

After deployment, note the function URL from the output, e.g.:
```
Function URL (api): https://us-central1-your-project-id.cloudfunctions.net/api
```

---

### 3. Update Frontend with Production URL

Edit `frontend/.env.local`:

```env
VITE_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net/api
```

Rebuild:

```bash
cd frontend
npm run build
```

---

### 4. Deploy Frontend to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

---

### 5. Deploy Everything at Once

```bash
firebase deploy
```

---

## 📊 Firestore Data Model

### Collections

#### `categories`
```json
{
  "id": "salesforce",
  "name": "Salesforce",
  "description": "All SF knowledge",
  "createdAt": "timestamp"
}
```

#### `sections`
```json
{
  "id": "salesforce-flows",
  "name": "Flows",
  "categoryId": "salesforce",
  "order": 1,
  "createdAt": "timestamp"
}
```

#### `notes`
```json
{
  "id": "auto-generated-id",
  "title": "After Save Flow Limitation",
  "content": "## Markdown content...",
  "categoryId": "salesforce",
  "sectionId": "salesforce-flows",
  "tags": ["flow", "automation"],
  "version": 2,
  "syncStatus": "SYNCED",
  "githubPath": "data/salesforce/salesforce-flows/note-id.json",
  "isDeleted": false,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### `tags`
```json
{
  "id": "flow",
  "name": "Flow",
  "color": "#4CAF50"
}
```

---

## 🌿 GitHub Backup Structure

Notes are backed up as JSON files in the following structure:

```
data/
└── {categoryId}/
    └── {sectionId}/
        └── {noteId}.json
```

Example:
```
data/
└── salesforce/
    └── salesforce-flows/
        └── abc123def456.json
```

---

## 🔒 Security Notes

- **Firestore rules** block direct client access — all reads/writes go through Cloud Functions (Admin SDK bypasses rules)
- **GitHub PAT** is stored only as environment variables — never in frontend code
- **CORS** is restricted to Firebase Hosting domains and localhost
- **Input validation** is performed in every Cloud Function route

---

## 🛠️ API Reference

Base URL: `https://us-central1-{project-id}.cloudfunctions.net/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/notes` | List notes (supports `?categoryId=`, `?sectionId=`, `?tags=`, `?search=`) |
| GET | `/notes/:id` | Get note by ID |
| POST | `/notes` | Create note |
| PUT | `/notes/:id` | Update note |
| DELETE | `/notes/:id` | Soft-delete note |
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| DELETE | `/categories/:id` | Delete category |
| GET | `/sections` | List sections (supports `?categoryId=`) |
| POST | `/sections` | Create section |
| DELETE | `/sections/:id` | Delete section |
| GET | `/tags` | List tags |
| POST | `/tags` | Create tag |

---

## 📱 Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Stats, categories, sections, recent notes |
| `/notes` | Notes List | Browse, search, and filter all notes |
| `/note/:id` | Note View | Read and edit a specific note |
| `/new` | New Note | Create a new note |

---

## 🔧 Troubleshooting

### "API request failed" on frontend
- Ensure Firebase Emulator is running: `firebase emulators:start`
- Check `VITE_FUNCTIONS_URL` in `.env.local` matches emulator URL

### GitHub sync failing
- Verify `GITHUB_TOKEN` has `repo` scope
- Check `GITHUB_OWNER` and `GITHUB_REPO` are correct
- Ensure the target repo exists

### Firestore permission denied
- Cloud Functions use Admin SDK which bypasses Firestore rules
- If getting errors, check Firebase project billing (Blaze plan for external calls)

### Build errors
- Run `npm install` in both `frontend/` and `functions/` directories
- Ensure Node.js v18+ is installed

---

## 🚀 Future Enhancements

- Full-text search with Algolia
- Firebase Authentication
- AI-assisted note generation
- Note linking / graph view
- Offline-first sync
- Multi-device support
- Export notes as PDF/Markdown
