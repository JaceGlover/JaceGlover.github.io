import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ── Role helper ───────────────────────────────────────
async function getRedirectUrl(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists() && snap.data().role === "teacher")
    return "teacher-dashboard.html";
  // Also check teachers collection (for Google sign-in teachers)
  const tsnap = await getDoc(doc(db, "teachers", user.uid));
  if (tsnap.exists()) return "teacher-dashboard.html";
  return "dashboard.html";
}

// Redirect already-logged-in users to the right dashboard
onAuthStateChanged(auth, async (user) => {
  if (user) window.location.href = await getRedirectUrl(user);
});

// ── Helpers ──────────────────────────────────────────
function showMsg(text, type) {
  const el = document.getElementById("auth-message");
  el.textContent = text;
  el.className = "message " + type;
}

function setLoading(btnId, loading, defaultHTML) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
  if (loading) {
    btn.textContent = "Please wait...";
  } else {
    btn.innerHTML = defaultHTML;
  }
}

function friendlyError(code) {
  const map = {
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use":
      "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user":
      "Sign-in popup was closed. Please try again.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

// ── Tab switching ─────────────────────────────────────
function switchTab(tab) {
  const isLogin = tab === "login";
  document.getElementById("form-login").style.display = isLogin
    ? "block"
    : "none";
  document.getElementById("form-signup").style.display = isLogin
    ? "none"
    : "block";
  document
    .getElementById("tab-login")
    .classList.toggle("active", isLogin);
  document
    .getElementById("tab-signup")
    .classList.toggle("active", !isLogin);
  document.getElementById("auth-message").className = "message";
}

document
  .getElementById("tab-login")
  .addEventListener("click", () => switchTab("login"));
document
  .getElementById("tab-signup")
  .addEventListener("click", () => switchTab("signup"));

// ── Log In ────────────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password)
    return showMsg("Please fill in all fields.", "error");

  setLoading("btn-login", true);
  try {
    const { user } = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    showMsg("Logged in! Redirecting...", "success");
    setTimeout(async () => {
      window.location.href = await getRedirectUrl(user);
    }, 700);
  } catch (e) {
    showMsg(friendlyError(e.code), "error");
    setLoading(
      "btn-login",
      false,
      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> Log In`,
    );
  }
}

// ── Role toggle ───────────────────────────────────────
let selectedRole = "student";
document.getElementById("role-student").addEventListener("click", () => {
  selectedRole = "student";
  document.getElementById("role-student").classList.add("active");
  document.getElementById("role-teacher").classList.remove("active");
});
document.getElementById("role-teacher").addEventListener("click", () => {
  selectedRole = "teacher";
  document.getElementById("role-teacher").classList.add("active");
  document.getElementById("role-student").classList.remove("active");
});

// ── Sign Up ───────────────────────────────────────────
async function handleSignUp() {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  if (!name || !email || !password)
    return showMsg("Please fill in all fields.", "error");
  if (password.length < 6)
    return showMsg("Password must be at least 6 characters.", "error");

  setLoading("btn-signup", true);
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(user, { displayName: name });

    // Save role + profile to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role: selectedRole,
      photoURL: null,
      lessonsComplete: 0,
      xp: 0,
    });

    // If teacher, also create teachers doc
    if (selectedRole === "teacher") {
      await setDoc(doc(db, "teachers", user.uid), {
        uid: user.uid,
        name,
        email,
      });
    }

    showMsg("Account created! Redirecting...", "success");
    setTimeout(() => {
      window.location.href =
        selectedRole === "teacher"
          ? "teacher-dashboard.html"
          : "dashboard.html";
    }, 700);
  } catch (e) {
    showMsg(friendlyError(e.code), "error");
    setLoading(
      "btn-signup",
      false,
      `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Create Account`,
    );
  }
}

// ── Google ────────────────────────────────────────────
async function handleGoogle() {
  try {
    const { user } = await signInWithPopup(auth, provider);
    // Save to Firestore if first time (merge so existing role isn't overwritten)
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        photoURL: user.photoURL || null,
      },
      { merge: true },
    );
    showMsg("Signed in! Redirecting...", "success");
    setTimeout(async () => {
      window.location.href = await getRedirectUrl(user);
    }, 700);
  } catch (e) {
    showMsg(friendlyError(e.code), "error");
  }
}

// ── Forgot password ───────────────────────────────────
document
  .getElementById("forgot-link")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    if (!email) return showMsg("Enter your email above first.", "error");
    try {
      await sendPasswordResetEmail(auth, email);
      showMsg("Password reset email sent! Check your inbox.", "success");
    } catch (e) {
      showMsg(friendlyError(e.code), "error");
    }
  });

// ── Event listeners ───────────────────────────────────
document
  .getElementById("btn-login")
  .addEventListener("click", handleLogin);
document
  .getElementById("btn-signup")
  .addEventListener("click", handleSignUp);
document
  .getElementById("btn-google-login")
  .addEventListener("click", handleGoogle);
document
  .getElementById("btn-google-signup")
  .addEventListener("click", handleGoogle);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  document.getElementById("form-login").style.display !== "none"
    ? handleLogin()
    : handleSignUp();
});
