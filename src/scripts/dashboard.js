import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

function main() {
  const firebaseConfig = {
    apiKey: "AIzaSyA3PF0jklshcBZLm4Tm_-K10RUok15Mu3U",
    authDomain: "aceblocks.firebaseapp.com",
    projectId: "aceblocks",
    storageBucket: "aceblocks.firebasestorage.app",
    messagingSenderId: "295224865929",
    appId: "1:295224865929:web:d82a392b52d2c856c58258",
    measurementId: "G-J0N2L9FGD9",
  };

  const app = initializeApp(firebaseConfig);
  getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const TOTAL = 12;

  onAuthStateChanged(auth, async (user) => {
    if (user === null) {
      window.location.href = "/login";
      return;
    }

    // ── Avatar + name ─────────────────────────────────────
    const name = user.displayName || user.email?.split("@")[0] || "Anon";
    const initials = name?.slice(0, 2).toUpperCase();
    const avatarEl = document.getElementById("user-avatar");
    if (!avatarEl || !initials) throw new ReferenceError();
    if (user.photoURL) {
      avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${initials}">`;
    } else {
      avatarEl.textContent = initials;
    }

    const welcome = document.getElementById("welcome-heading");
    const email = document.getElementById("user-email-display");
    if (!welcome || !email) throw new ReferenceError();

    welcome.textContent = `Welcome back, ${name}.`;
    email.textContent = user.email;

    // ── Load progress from Firestore ──────────────────────
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const data = userSnap.exists() ? userSnap.data() : {};

    const localLesson = parseInt(
      localStorage.getItem("aceblocksLesson") || "1",
    );
    const localComplete = Math.max(0, localLesson - 1);
    const firestoreComplete = data["lessonsComplete"] ?? null;

    const completed =
      firestoreComplete !== null
        ? Math.max(firestoreComplete, localComplete)
        : localComplete;

    const pct = Math.round((completed / TOTAL) * 100);
    const xp = completed * 50;

    // ── Update Firestore ──────────────────────────────────
    await setDoc(
      userRef,
      {
        uid: user.uid,
        name,
        email: user.email,
        photoURL: user.photoURL || null,
        lessonsComplete: completed,
        xp,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    if (completed > 0) {
      localStorage.setItem("aceblocksLesson", String(completed + 1));
    }

    // ── Render stats ──────────────────────────────────────
    const lessons = document.getElementById("stat-lessons");
    const stat_xp = document.getElementById("stat-xp");
    const progress = document.getElementById("course-progress-blocks");
    const label_blocks = document.getElementById("course-label-blocks");

    if (!lessons || !stat_xp || !progress || !label_blocks)
      throw new ReferenceError();

    lessons.textContent = completed.toString();
    stat_xp.textContent = xp.toString();

    progress.style.width = pct + "%";
    label_blocks.textContent =
      pct === 100
        ? "100% complete — Finished! 🎉"
        : pct === 0
          ? "0% complete — Start now"
          : pct + "% complete — Keep going!";

    // ── Streak tracking ───────────────────────────────────
    const today = new Date().toDateString();
    const lastVisit = data["lastVisit"] || null;
    const streak = data["streak"] || 0;

    let newStreak = streak;
    if (lastVisit === today) {
      newStreak = streak;
    } else if (lastVisit === new Date(Date.now() - 86400000).toDateString()) {
      newStreak = streak + 1;
    } else {
      newStreak = 1;
    }

    await setDoc(
      userRef,
      {
        streak: newStreak,
        lastVisit: today,
      },
      { merge: true },
    );

    const statStreak = document.getElementById("stat-streak");
    statStreak && (statStreak.textContent = newStreak + " 🔥");

    // ── Badges ────────────────────────────────────────────
    if (completed >= 1)
      document.getElementById("badge-first-lesson")?.classList.remove("locked");
    if (completed >= TOTAL)
      document.getElementById("badge-course-complete")?.classList.remove("locked");
    if (newStreak >= 7)
      document.getElementById("badge-streak")?.classList.remove("locked");
  });

  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login";
  });
}

main();
