import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Name — prefer displayName, fall back to email prefix
  const name = user.displayName || user.email.split("@")[0];
  const initials = name.slice(0, 2).toUpperCase();

  // Avatar — use Google photo if available, else initials
  const avatarEl = document.getElementById("user-avatar");
  if (user.photoURL) {
    avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${initials}">`;
  } else {
    avatarEl.textContent = initials;
  }

  document.getElementById("welcome-heading").textContent =
    `Welcome back, ${name}.`;
  document.getElementById("user-email-display").textContent = user.email;

  // Pull lesson progress from localStorage (set by lessons.html)
  const lessonNum =
    parseInt(localStorage.getItem("aceblocksLesson")) || 1;
  const TOTAL = 12;
  const completed = Math.max(0, lessonNum - 1);
  const pct = Math.round((completed / TOTAL) * 100);
  const xp = completed * 50;

  document.getElementById("stat-lessons").textContent = completed;
  document.getElementById("stat-xp").textContent = xp;

  document.getElementById("course-progress-blocks").style.width =
    pct + "%";
  document.getElementById("course-label-blocks").textContent =
    pct === 100
      ? "100% complete — Finished! 🎉"
      : pct === 0
        ? "0% complete — Start now"
        : pct + "% complete — Keep going!";

  // Unlock badges based on progress
  if (completed >= 1) {
    document
      .getElementById("badge-first-lesson")
      .classList.remove("locked");
  }
  if (completed >= TOTAL) {
    document
      .getElementById("badge-course-complete")
      .classList.remove("locked");
  }
});

document
  .getElementById("btn-logout")
  .addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
