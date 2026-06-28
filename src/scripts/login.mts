// Import everything, in a way that TypeScript is happy with
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
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
// Importing types
import type { User } from "firebase/auth";

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
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ── Role helper ───────────────────────────────────────
async function getRedirectUrl(user: User) {
  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists() && snap.data()["role"] === "teacher")
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
function showMsg(text: string, type: string) {
  const authMessage = document.getElementById("auth-message");
  if (authMessage === null) throw new ReferenceError();
  authMessage.textContent = text;
  authMessage.className = "message " + type;
}

function setLoading(btnId: string, loading: true): void;
function setLoading(btnId: string, loading: false, defaultHTML: string): void;
function setLoading(
  btnId: string,
  loading: boolean,
  defaultHTML?: string,
): void {
  const btn = document.querySelector(`button#${btnId}`);
  if (!(btn instanceof HTMLButtonElement)) throw new ReferenceError();
  btn.disabled = loading;
  if (loading) {
    btn.textContent = "Please wait...";
  } else {
    if (defaultHTML === undefined) throw new TypeError();
    btn.innerHTML = defaultHTML;
  }
}

function friendlyError(code: string) {
  const map: Record<string, string> = {
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

// ── Tab switching ─────────────────────────────────────
const formLogin = document.getElementById("form-login") as HTMLElement;
if (formLogin === null) throw new ReferenceError();
function switchTab(tab: string) {
  const isLogin = tab === "login";
  // Getting elements
  const formSignup = document.getElementById("form-signup") as HTMLElement;
  const authMessage = document.getElementById("auth-message") as HTMLElement;
  if (formSignup === null || authMessage === null) throw new ReferenceError();
  formLogin.style.display = isLogin ? "block" : "none";
  formSignup.style.display = isLogin ? "none" : "block";
  document.getElementById("tab-login")?.classList.toggle("active", isLogin);
  document.getElementById("tab-signup")?.classList.toggle("active", !isLogin);
  authMessage.className = "message";
}

document
  .getElementById("tab-login")
  ?.addEventListener("click", () => switchTab("login"));
document
  .getElementById("tab-signup")
  ?.addEventListener("click", () => switchTab("signup"));

// ── Log In ────────────────────────────────────────────
const loginEmail = document.querySelector(
  "input#login-email",
) as HTMLInputElement;
if (!(loginEmail instanceof HTMLInputElement)) throw new ReferenceError();
async function handleLogin() {
  const loginPassword = document.querySelector(
    "input#login-password",
  ) as HTMLInputElement;
  if (!(loginPassword instanceof HTMLInputElement)) throw new ReferenceError();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email || !password)
    return showMsg("Please fill in all fields.", "error");

  setLoading("btn-login", true);
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    showMsg("Logged in! Redirecting...", "success");
    setTimeout(async () => {
      window.location.href = await getRedirectUrl(user);
    }, 700);
  } catch (e: any) {
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
const roleStudent = document.getElementById("role-student");
const roleTeacher = document.getElementById("role-teacher");
roleStudent?.addEventListener("click", () => {
  selectedRole = "student";
  roleStudent?.classList.add("active");
  roleTeacher?.classList.remove("active");
});
roleTeacher?.addEventListener("click", () => {
  selectedRole = "teacher";
  roleTeacher?.classList.add("active");
  roleStudent?.classList.remove("active");
});

// ── Sign Up ───────────────────────────────────────────
async function handleSignUp() {
  const signupName = document.querySelector(
    "input#signup-name",
  ) as HTMLInputElement;
  const signupEmail = document.querySelector(
    "input#signup-email",
  ) as HTMLInputElement;
  const signupPassword = document.querySelector(
    "input#signup-password",
  ) as HTMLInputElement;
  if (
    [signupName, signupEmail, signupPassword].some((element) => {
      return element === null;
    })
  )
    throw new ReferenceError();
  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
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
  } catch (e: any) {
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
    if (user.email === null) throw new TypeError();
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
  } catch (e: any) {
    showMsg(friendlyError(e.code), "error");
  }
}

// ── Forgot password ───────────────────────────────────
const forgotLink = document.getElementById("forgot-link");
forgotLink?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim();
  if (!email) return showMsg("Enter your email above first.", "error");
  try {
    await sendPasswordResetEmail(auth, email);
    showMsg("Password reset email sent! Check your inbox.", "success");
  } catch (e: any) {
    showMsg(friendlyError(e.code), "error");
  }
});

// ── Event listeners ───────────────────────────────────
const btnLogin = document.getElementById("btn-login");
const btnSignup = document.getElementById("btn-signup");
const btnGoogleLogin = document.getElementById("btn-google-login");
const btnGoogleSignup = document.getElementById("btn-google-signup");
btnLogin?.addEventListener("click", handleLogin);
btnSignup?.addEventListener("click", handleSignUp);
btnGoogleLogin?.addEventListener("click", handleGoogle);
btnGoogleSignup?.addEventListener("click", handleGoogle);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  formLogin.style.display !== "none" ? handleLogin() : handleSignUp();
});
