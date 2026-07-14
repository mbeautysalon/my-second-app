// ─── Firebase Integration ───────────────────────────────────────────────────
// This file connects the app's storage layer to Firebase Firestore so that
// ALL data (users, courses, enrollments, attendance, absences, materials,
// student directory) is saved to the cloud instead of the browser only.
//
// IMPORTANT: This file MUST be imported before "./App.jsx" in main.jsx.
// It assigns `window.storage` synchronously at module load time, so App.jsx's
// own localStorage fallback (which only activates `if (!window.storage)`)
// is skipped once Firebase is configured correctly.
//
// If the VITE_FIREBASE_* environment variables are missing, this file does
// nothing and the app safely falls back to localStorage (see App.jsx) —
// so you can still develop/preview locally before setting up Firebase.

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // The app's own login system (username/password stored in Firestore) is
  // separate from Firebase Auth. We sign in anonymously purely so that
  // Firestore Security Rules can require `request.auth != null` — this
  // keeps the database from being wide open to the entire internet while
  // requiring ZERO changes to the app's existing login screen.
  let resolveAuthReady;
  const authReady = new Promise((resolve) => { resolveAuthReady = resolve; });
  onAuthStateChanged(auth, (user) => { if (user) resolveAuthReady(); });
  signInAnonymously(auth).catch((err) => {
    console.error("[Firebase] Anonymous sign-in failed:", err);
    resolveAuthReady(); // don't block the app forever if auth fails
  });

  const COLLECTION = "appData"; // one Firestore document per storage key (e.g. "cp3_courses")

  window.storage = {
    async get(key) {
      await authReady;
      const snap = await getDoc(doc(db, COLLECTION, key));
      if (!snap.exists()) return null;
      return { key, value: snap.data().value };
    },
    async set(key, value) {
      await authReady;
      await setDoc(doc(db, COLLECTION, key), { value, updatedAt: Date.now() });
      return { key, value };
    },
    async delete(key) {
      await authReady;
      await deleteDoc(doc(db, COLLECTION, key));
      return { key, deleted: true };
    },
    async list(prefix) {
      await authReady;
      const snap = await getDocs(collection(db, COLLECTION));
      const keys = snap.docs.map((d) => d.id).filter((k) => !prefix || k.startsWith(prefix));
      return { keys };
    },
    // Real-time subscription: App.jsx's useStorage hook uses this automatically
    // when present, so changes made by one admin/teacher/student show up live
    // for everyone else without needing to refresh the page.
    subscribe(key, callback) {
      let unsub = null;
      let cancelled = false;
      authReady.then(() => {
        if (cancelled) return;
        unsub = onSnapshot(
          doc(db, COLLECTION, key),
          (snap) => { if (snap.exists()) callback(snap.data().value); },
          (err) => console.error(`[Firebase] Live sync error for "${key}":`, err)
        );
      });
      return () => { cancelled = true; if (unsub) unsub(); };
    },
  };

  console.log("[Firebase] Connected — all data now syncs to Firestore in real time.");
} else {
  console.warn(
    "[Firebase] No VITE_FIREBASE_* environment variables found.\n" +
    "The app will fall back to browser localStorage — data will stay on this " +
    "device only and will NOT be shared between students, teachers, and admin.\n" +
    "See README.md for setup instructions."
  );
}
