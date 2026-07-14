# ES Course Platform — Firebase Setup

Your data (users, courses, enrollments, attendance, absences, materials,
student directory) now saves to **Firebase Firestore** instead of the browser,
so nothing is lost when you clear cache, switch devices, or when multiple
people (admin/teacher/students) use the app at the same time. Changes also
sync live — no page refresh needed.

If Firebase isn't configured yet, the app still runs using the browser's
localStorage as a fallback (per-device only) — so you can preview it before
finishing setup below.

---

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project** → give it a name → finish the wizard (Google Analytics is optional, you can skip it).

## 2. Register a Web App

1. In your new project, click the **</>** (Web) icon → give it a nickname → **Register app**.
2. Firebase shows you a `firebaseConfig` object like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
   };
   ```
   Keep this tab open — you'll copy these values in step 6.

## 3. Enable Firestore Database

1. Left sidebar → **Build → Firestore Database** → **Create database**.
2. Choose a region close to your users (e.g. `asia-east1` for Taiwan).
3. Start in **production mode** (we'll set proper rules in step 4).

## 4. Set Firestore Security Rules

Left sidebar → **Firestore Database → Rules**, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appData/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This requires a signed-in session (including anonymous) to read/write —
prevents randoms on the internet from wiping your data, while your app still
works exactly as before with its own username/password login screen.

Click **Publish**.

## 5. Enable Anonymous Authentication

1. Left sidebar → **Build → Authentication → Get started**.
2. **Sign-in method** tab → **Anonymous** → enable it → **Save**.

(This is separate from your app's own login screen — it just lets the app
talk to Firestore under the security rules above. Your students/teachers
still log in with the usernames/passwords you set up in 帳號管理.)

## 6. Add your config values

Copy `.env.example` to `.env` and fill in the values from step 2:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

`.env` is gitignored — it will NOT be committed to GitHub.

## 7. Add the same values to Vercel

Vercel Dashboard → your project → **Settings → Environment Variables** →
add all 6 `VITE_FIREBASE_*` keys with the same values → **Save**.

Then **redeploy** (Deployments tab → ⋯ → Redeploy) so the build picks them up.

---

## Verify it worked

Open your deployed site → browser DevTools (F12) → Console tab. You should see:

```
[Firebase] Connected — all data now syncs to Firestore in real time.
```

If you instead see a yellow warning about missing env vars, double-check
step 6/7 and redeploy.

You can also check **Firestore Database → Data** in the Firebase Console —
after logging in and using the app, you'll see documents like `cp3_users`,
`cp3_courses`, `cp3_enrollments` etc. appear under the `appData` collection.

---

## Important notes

- **Data model**: each storage key (e.g. `cp3_courses`) is stored as ONE
  Firestore document holding the entire array as JSON. This matches how the
  app already worked with localStorage — simple and reliable for a small
  school (< 50 accounts as originally scoped). If you outgrow this (e.g. many
  admins editing simultaneously) the next step would be splitting each entity
  (each course, each student) into its own document — ask if you want that.
- **Free tier**: Firestore's free "Spark" plan easily covers a small course
  platform's usage (50k reads/20k writes per day). No credit card required
  to get started.
- **Backups**: Firebase Console → Firestore → you can manually export data,
  or set up scheduled backups on the paid plan if you want extra safety.
