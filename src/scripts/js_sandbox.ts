// ── DEFAULT CODE ──────────────────────────────────────────────
const DEFAULTS = {
  js: `// Welcome to the AceBlocks JS Sandbox!
				// Write JavaScript below and hit Run.

				const greeting = "Hello, AceBlocks!"
				console.log(greeting)

				// Try some maths
				const nums = [1, 2, 3, 4, 5]
				const total = nums.reduce((a, b) => a + b, 0)
				console.log("Sum:", total)

				// Or manipulate the preview
				document.body.style.background = "#04060f"
				document.body.innerHTML = \`
				<div style="font-family:sans-serif;color:#e8eaf6;display:flex;align-items:center;
				justify-content:center;height:100vh;flex-direction:column;gap:12px;">
				<h1 style="font-size:2rem;">👋 Hello from JS!</h1>
				<p style="color:#7b83a6;">Edit the code and hit Run</p>
				</div>
				\``,

  html: `<!DOCTYPE html>
				<html>
				<head>
				<meta charset="UTF-8">
				<title>My Page</title>
				</head>
				<body>
				<h1>Hello, AceBlocks!</h1>
				<p>Edit this HTML and hit Run.</p>
				</body>
				</html>`,

  css: `/* Styles for your HTML */
				body {
					font-family: 'Segoe UI', sans-serif;
					background: #04060f;
					color: #e8eaf6;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					min-height: 100vh;
					margin: 0;
					padding: 2rem;
				}

				h1 {
					font-size: 2.5rem;
					background: linear-gradient(135deg, #5b6bff, #38f0c0);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
					margin-bottom: 1rem;
				}

				p {
					color: #7b83a6;
					font-size: 1.1rem;
					}`,

  htmljs: `// JavaScript for your HTML page
					console.log("Page loaded!")

					document.querySelector('h1').addEventListener('click', () => {
						console.log("Heading clicked!")
						})`,
};

// ── STATE ─────────────────────────────────────────────────────
let mode = "js"; // 'js' or 'html'
let activeFile = "html"; // for html mode: 'html', 'css', 'js'
let files = {
  html: DEFAULTS.html,
  css: DEFAULTS.css,
  js: DEFAULTS.htmljs,
};

const codeInput = document.getElementById("code-input");
const lineNumbers = document.getElementById("line-numbers");
const preview = document.getElementById("preview");
const consoleOutput = document.getElementById("console-output");
const fileTabs = document.getElementById("file-tabs");

// ── LINE NUMBERS ──────────────────────────────────────────────
function updateLineNumbers() {
  const lines = codeInput.value.split("\n").length;
  lineNumbers.innerHTML = Array.from(
    { length: lines },
    (_, i) => i + 1,
  ).join("<br>");
}

codeInput.addEventListener("input", updateLineNumbers);
codeInput.addEventListener("scroll", () => {
  lineNumbers.scrollTop = codeInput.scrollTop;
});

// Tab key inserts spaces
codeInput.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = codeInput.selectionStart;
    const end = codeInput.selectionEnd;
    codeInput.value =
      codeInput.value.substring(0, start) +
      "  " +
      codeInput.value.substring(end);
    codeInput.selectionStart = codeInput.selectionEnd = start + 2;
    updateLineNumbers();
  }
});

// ── MODE SWITCHING ────────────────────────────────────────────
document
  .getElementById("mode-js")
  .addEventListener("click", () => setMode("js"));
document
  .getElementById("mode-html")
  .addEventListener("click", () => setMode("html"));

function setMode(newMode) {
  // Save current editor content
  if (mode === "js") {
    DEFAULTS.js = codeInput.value;
  } else {
    files[activeFile] = codeInput.value;
  }

  mode = newMode;
  document
    .getElementById("mode-js")
    .classList.toggle("active", mode === "js");
  document
    .getElementById("mode-html")
    .classList.toggle("active", mode === "html");
  fileTabs.style.display = mode === "html" ? "flex" : "none";

  if (mode === "js") {
    codeInput.value = DEFAULTS.js;
  } else {
    activeFile = "html";
    setActiveFileTab("html");
    codeInput.value = files.html;
  }

  updateLineNumbers();
  clearConsole();
}

// ── FILE TABS (HTML mode) ─────────────────────────────────────
document.querySelectorAll(".file-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    files[activeFile] = codeInput.value;
    activeFile = tab.dataset.file;
    setActiveFileTab(activeFile);
    codeInput.value = files[activeFile];
    updateLineNumbers();
  });
});

function setActiveFileTab(file) {
  document.querySelectorAll(".file-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.file === file);
  });
}

// ── CONSOLE ───────────────────────────────────────────────────
function clearConsole() {
  consoleOutput.innerHTML =
    '<div class="console-empty">Run your code to see output here.</div>';
}

function addLog(msg, type = "log") {
  const empty = consoleOutput.querySelector(".console-empty");
  if (empty) empty.remove();

  const labels = {
    log: "LOG",
    error: "ERR",
    warn: "WARN",
    info: "INF",
    system: "···",
  };
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.innerHTML = `<span class="log-type">${labels[type] || "LOG"}</span><span class="log-msg">${escapeHtml(String(msg))}</span>`;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

document
  .getElementById("btn-clear-console")
  .addEventListener("click", clearConsole);

// Listen for messages from the iframe
window.addEventListener("message", (e) => {
  if (!e.data || !e.data.type) return;
  const { type, args } = e.data;
  if (["log", "error", "warn", "info"].includes(type)) {
    addLog(args.join(" "), type);
  }
});

// ── RUN ───────────────────────────────────────────────────────
document.getElementById("btn-run").addEventListener("click", runCode);

function runCode() {
  // Save current tab content
  if (mode === "html") files[activeFile] = codeInput.value;

  clearConsole();
  addLog("Running...", "system");

  // Intercept console in iframe via postMessage
  const interceptor = `
																	<script>
																	(function() {
																		const send = (type, args) => window.parent.postMessage({ type, args: args.map(a => {
																			try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a) } catch(e) { return String(a) }
																			})}, '*')
																			;['log','warn','info'].forEach(m => {
																				const orig = console[m]
																				console[m] = (...args) => { send(m, args); orig.apply(console, args) }
																				})
																				window.onerror = (msg, src, line, col) => {
																					send('error', [msg + ' (line ' + line + ')'])
																					return true
																				}
																				window.addEventListener('unhandledrejection', e => {
																					send('error', ['Unhandled promise rejection: ' + e.reason])
																					})
																					})()
																					<\/script>
																					`;

  let html = "";

  if (mode === "js") {
    const code = codeInput.value;
    html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
																						${interceptor}
																						<script>
																						try { ${code} } catch(e) { window.parent.postMessage({type:'error',args:[e.message]}, '*') }
																						<\/script>
																						</body></html>`;
  } else {
    // Inject CSS and JS into HTML
    const htmlCode = files.html;
    const cssCode = files.css;
    const jsCode = files.js;

    // Try to inject into <head> and before </body>
    let doc = htmlCode;
    const styleTag = `<style>${cssCode}</style>`;
    const scriptTag = `${interceptor}<script>try{${jsCode}}catch(e){window.parent.postMessage({type:'error',args:[e.message]},'*')}<\/script>`;

    if (doc.includes("</head>")) {
      doc = doc.replace("</head>", styleTag + "</head>");
    } else {
      doc = styleTag + doc;
    }

    if (doc.includes("</body>")) {
      doc = doc.replace("</body>", scriptTag + "</body>");
    } else {
      doc = doc + scriptTag;
    }

    html = doc;
  }

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  preview.src = url;
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ── RESET ─────────────────────────────────────────────────────
document.getElementById("btn-reset").addEventListener("click", () => {
  if (!confirm("Reset code to default?")) return;
  if (mode === "js") {
    codeInput.value = `// Welcome to the AceBlocks JS Sandbox!\n// Write JavaScript below and hit Run.\n\nconsole.log("Hello, AceBlocks!")`;
  } else {
    files = {
      html: DEFAULTS.html,
      css: DEFAULTS.css,
      js: DEFAULTS.htmljs,
    };
    codeInput.value = files[activeFile];
  }
  updateLineNumbers();
  clearConsole();
  preview.src = "about:blank";
});

// ── RESIZE HANDLE ─────────────────────────────────────────────
const handle = document.getElementById("resize-handle");
const editorPanel = document.getElementById("editor-panel");
let isResizing = false;

handle.addEventListener("mousedown", (e) => {
  isResizing = true;
  handle.classList.add("dragging");
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const workspace = document.querySelector(".workspace");
  const rect = workspace.getBoundingClientRect();
  const newWidth = Math.min(
    Math.max(e.clientX - rect.left, 200),
    rect.width - 200,
  );
  editorPanel.style.width = newWidth + "px";
  editorPanel.style.flex = "none";
});

document.addEventListener("mouseup", () => {
  if (!isResizing) return;
  isResizing = false;
  handle.classList.remove("dragging");
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
});

// ── INIT ──────────────────────────────────────────────────────
codeInput.value = DEFAULTS.js;
updateLineNumbers();
