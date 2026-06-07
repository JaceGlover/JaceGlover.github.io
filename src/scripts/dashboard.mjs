import { initializeApp }  from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics }   from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut }
                          from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp }
                          from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyA3PF0jklshcBZLm4Tm_-K10RUok15Mu3U",
  authDomain:        "aceblocks.firebaseapp.com",
  projectId:         "aceblocks",
  storageBucket:     "aceblocks.firebasestorage.app",
  messagingSenderId: "295224865929",
  appId:             "1:295224865929:web:d82a392b52d2c856c58258",
  measurementId:     "G-J0N2L9FGD9",
};

const app  = initializeApp(firebaseConfig);
getAnalytics(app);
const auth = getAuth(app);
const db   = getFirestore(app);
const TOTAL = 12;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // ── Avatar + name ─────────────────────────────────────
  const name     = user.displayName || user.email.split("@")[0];
  const initials = name.slice(0, 2).toUpperCase();
  const avatarEl = document.getElementById("user-avatar");
  if (user.photoURL) {
    avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${initials}">`;
  } else {
    avatarEl.textContent = initials;
  }
  document.getElementById("welcome-heading").textContent    = `Welcome back, ${name}.`;
  document.getElementById("user-email-display").textContent = user.email;

  // ── Load progress from Firestore ──────────────────────
  const userRef  = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const data     = userSnap.exists() ? userSnap.data() : {};

  // How many lessons completed — prefer Firestore, fall back to localStorage
  // (so progress isn't lost if they used the site before Firestore was added)
  const localLesson   = parseInt(localStorage.getItem("aceblocksLesson")) || 1;
  const localComplete = Math.max(0, localLesson - 1);
  const firestoreComplete = data.lessonsComplete ?? null;

  // Use whichever is higher so no progress is ever lost
  const completed = firestoreComplete !== null
    ? Math.max(firestoreComplete, localComplete)
    : localComplete;

  const pct = Math.round((completed / TOTAL) * 100);
  const xp  = completed * 50;

  // ── Update Firestore with latest progress ─────────────
  await setDoc(userRef, {
    uid:             user.uid,
    name,
    email:           user.email,
    photoURL:        user.photoURL || null,
    lessonsComplete: completed,
    xp,
    updatedAt:       serverTimestamp(),
  }, { merge: true });

  // Also keep localStorage in sync so lessons.html still works
  if (completed > 0) {
    localStorage.setItem("aceblocksLesson", String(completed + 1));
  }

  // ── Render stats ──────────────────────────────────────
  document.getElementById("stat-lessons").textContent = completed;
  document.getElementById("stat-xp").textContent      = xp;

  document.getElementById("course-progress-blocks").style.width = pct + "%";
  document.getElementById("course-label-blocks").textContent =
    pct === 100 ? "100% complete — Finished! 🎉" :
    pct === 0   ? "0% complete — Start now" :
                  pct + "% complete — Keep going!";

  // ── Streak tracking ───────────────────────────────────
  const today     = new Date().toDateString();
  const lastVisit = data.lastVisit || null;
  const streak    = data.streak    || 0;

  let newStreak = streak;
  if (lastVisit === today) {
    // Same day — streak stays the same
    newStreak = streak;
  } else if (lastVisit === new Date(Date.now() - 86400000).toDateString()) {
    // Visited yesterday — increment streak
    newStreak = streak + 1;
  } else {
    // Missed a day — reset streak
    newStreak = 1;
  }

  // Save streak + last visit
  await setDoc(userRef, {
    streak:    newStreak,
    lastVisit: today,
  }, { merge: true });

  document.getElementById("stat-streak") &&
    (document.getElementById("stat-streak").textContent = newStreak + " 🔥");

  // ── Badges ────────────────────────────────────────────
  if (completed >= 1) {
    document.getElementById("badge-first-lesson")?.classList.remove("locked");
  }
  if (completed >= TOTAL) {
    document.getElementById("badge-course-complete")?.classList.remove("locked");
  }
  if (newStreak >= 7) {
    document.getElementById("badge-streak")?.classList.remove("locked");
  }
});

document.getElementById("btn-logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});
