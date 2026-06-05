// ═══════════════ GLOBALS ═══════════════
let workspace = null;
let currentLesson =
  parseInt(localStorage.getItem("aceblocksLesson")) || 1;

// ═══════════════ HELPERS ═══════════════
function getCode() {
  return workspace ? Blockly.JavaScript.workspaceToCode(workspace) : "";
}

function runCode() {
  const outputDiv = document.getElementById("output");
  outputDiv.className = "";
  outputDiv.innerText = "";
  const orig = console.log;
  console.log = function(msg) {
    outputDiv.innerText += msg + "\n";
    orig(msg);
  };
  try {
    eval(getCode());
  } catch (e) {
    outputDiv.innerText += "Error: " + e.message;
  }
  console.log = orig;
}

function hasPrintWithValue() {
  return workspace
    ? workspace
      .getAllBlocks(false)
      .some(
        (b) => b.type === "text_print" && b.getInputTargetBlock("TEXT"),
      )
    : false;
}

function countValidPrints() {
  return workspace
    ? workspace
      .getAllBlocks(false)
      .filter(
        (b) => b.type === "text_print" && b.getInputTargetBlock("TEXT"),
      ).length
    : 0;
}

function getOutputText() {
  return document.getElementById("output").innerText || "";
}

// ═══════════════ TOAST ═══════════════
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast " + type + " show";
  setTimeout(() => {
    t.className = "toast " + type;
  }, 2800);
}

// ═══════════════ LESSONS ═══════════════
// Chapters: basics (1-3), numbers (4-6), math (7-9), challenge (10-12)
const lessons = {
  1: {
    chapter: "basics",
    chapterLabel: "Chapter 1 — Basics",
    title: 'Lesson 1 — Print "Hello World"',
    objective: 'Use the print block to display "Hello World".',
    hint: "Tip: Drag a Print block, connect a Text block to it, and type Hello World inside.",
    check: () => getCode().toLowerCase().includes("hello world"),
  },
  2: {
    chapter: "basics",
    chapterLabel: "Chapter 1 — Basics",
    title: "Lesson 2 — Print Anything",
    objective: "Print any message you like using the text print block.",
    hint: "Tip: Type anything into a Text block and connect it to a Print block.",
    check: () => hasPrintWithValue(),
  },
  3: {
    chapter: "basics",
    chapterLabel: "Chapter 1 — Basics",
    title: "Lesson 3 — Print Your Name",
    objective: "Use the print block to display your own name.",
    hint: "Tip: Type your name into a Text block, then connect it to a Print block.",
    check: () => {
      const code = getCode();
      // Must have a print with a non-empty text value, and it shouldn't be a default placeholder
      return hasPrintWithValue() && code.length > 20;
    },
  },
  4: {
    chapter: "numbers",
    chapterLabel: "Chapter 2 — Numbers",
    title: "Lesson 4 — Print the Number 5",
    objective: "Use the print block to show the number 5.",
    hint: "Tip: Use a Number block (not a Text block) set to 5, then connect it to Print.",
    check: () => {
      const code = getCode();
      return code.includes("5") && hasPrintWithValue();
    },
  },
  5: {
    chapter: "numbers",
    chapterLabel: "Chapter 2 — Numbers",
    title: "Lesson 5 — Print the Number 10",
    objective: "Print the number 10 using a number block.",
    hint: "Tip: Set a Number block to 10 and connect it to a Print block.",
    check: () => {
      const code = getCode();
      return code.includes("10") && hasPrintWithValue();
    },
  },
  6: {
    chapter: "numbers",
    chapterLabel: "Chapter 2 — Numbers",
    title: "Lesson 6 — Add 2 + 3",
    objective: "Print the result of 2 + 3.",
    hint: "Tip: Use a Math Arithmetic block set to ADD, plug in Number blocks for 2 and 3, then Print.",
    check: () => getCode().includes("2 + 3"),
  },
  7: {
    chapter: "math",
    chapterLabel: "Chapter 3 — Math",
    title: "Lesson 7 — Subtract 10 − 4",
    objective: "Print the result of 10 minus 4.",
    hint: "Tip: Use the Math Arithmetic block and switch it to MINUS. Set the numbers to 10 and 4.",
    check: () => getCode().includes("10 - 4"),
  },
  8: {
    chapter: "math",
    chapterLabel: "Chapter 3 — Math",
    title: "Lesson 8 — Multiply 3 × 6",
    objective: "Print the result of 3 multiplied by 6.",
    hint: "Tip: Switch the Math Arithmetic block to MULTIPLY (×). Set the numbers to 3 and 6.",
    check: () => getCode().includes("3 * 6"),
  },
  9: {
    chapter: "math",
    chapterLabel: "Chapter 3 — Math",
    title: "Lesson 9 — Print a Number Over 50",
    objective: "Print any number that is greater than 50.",
    hint: "Tip: Use a Number block set to any value larger than 50 (e.g. 99, 100, 77...).",
    check: () => {
      const code = getCode();
      const matches = code.match(/console\.log\((\d+(\.\d+)?)\)/);
      if (matches) {
        return parseFloat(matches[1]) > 50;
      }
      // Also allow math results
      const output = getOutputText();
      const numMatch = output.match(/^(\d+(\.\d+)?)/);
      if (numMatch) return parseFloat(numMatch[1]) > 50;
      return false;
    },
  },
  10: {
    chapter: "challenge",
    chapterLabel: "Chapter 4 — Challenge",
    title: "Lesson 10 — Print Two Things",
    objective: "Print at least two separate messages or numbers.",
    hint: "Tip: Add two Print blocks — each one can have different content.",
    check: () => countValidPrints() >= 2,
  },
  11: {
    chapter: "challenge",
    chapterLabel: "Chapter 4 — Challenge",
    title: "Lesson 11 — Print Three Lines",
    objective: "Print three separate messages, numbers, or calculations.",
    hint: "Tip: Add three Print blocks to the workspace, each with something connected.",
    check: () => countValidPrints() >= 3,
  },
  12: {
    chapter: "challenge",
    chapterLabel: "Chapter 4 — Challenge",
    title: 'Lesson 12 — Print "I Love Coding"',
    objective: 'Use the print block to display "I Love Coding".',
    hint: "Tip: Type I Love Coding exactly into a Text block (capitalisation doesn't matter).",
    check: () => getCode().toLowerCase().includes("i love coding"),
  },
};

const TOTAL = Object.keys(lessons).length;

const chapterClasses = {
  basics: "chapter-basics",
  numbers: "chapter-numbers",
  math: "chapter-logic",
  challenge: "chapter-challenge",
};

// ═══════════════ LOAD LESSON ═══════════════
function loadLesson() {
  if (!workspace) return;
  workspace.clear();
  const l = lessons[currentLesson];
  document.getElementById("chapterBadgeWrap").innerHTML =
    `<span class="chapter-badge ${chapterClasses[l.chapter]}">${l.chapterLabel}</span>`;
  document.getElementById("lessonTitle").innerText = l.title;
  document.getElementById("lessonObjective").innerText = l.objective;
  document.getElementById("lessonHint").innerText = l.hint;
  const outputDiv = document.getElementById("output");
  outputDiv.innerText = "Ready — run your code to see results here.";
  outputDiv.className = "";
  localStorage.setItem("aceblocksLesson", currentLesson);
  const pct = Math.min(((currentLesson - 1) / TOTAL) * 100, 100);
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressText").innerText =
    `Lesson ${currentLesson} of ${TOTAL}`;
}

// ═══════════════ START ═══════════════
document
  .getElementById("startBtn")
  .addEventListener("click", function() {
    document.getElementById("lessonIntro").style.display = "none";
    document.getElementById("lessonArea").style.display = "block";

    workspace = Blockly.inject("blocklyDiv", {
      toolbox: document.getElementById("toolbox"),
      theme: Blockly.Theme.defineTheme("aceblocks", {
        base: Blockly.Themes.Classic,
        componentStyles: {
          workspaceBackgroundColour: "#0d1120",
          toolboxBackgroundColour: "#0a0d18",
          toolboxForegroundColour: "#e8eaf6",
          flyoutBackgroundColour: "#0d1120",
          flyoutForegroundColour: "#e8eaf6",
          flyoutOpacity: 1,
          scrollbarColour: "#5b6bff",
        },
      }),
      scrollbars: true,
      trashcan: true,
    });

    Blockly.JavaScript["text_print"] = function(block) {
      const msg =
        Blockly.JavaScript.valueToCode(
          block,
          "TEXT",
          Blockly.JavaScript.ORDER_NONE,
        ) || '""';
      return "console.log(" + msg + ");\n";
    };

    loadLesson();
  });

// ═══════════════ RUN ═══════════════
document.getElementById("runBtn").addEventListener("click", function() {
  runCode();
  const outputDiv = document.getElementById("output");
  if (lessons[currentLesson].check()) {
    outputDiv.className = "success";
    outputDiv.innerText += "\n✅ Correct! Well done.";
    showToast("✅ Lesson " + currentLesson + " complete!", "success");
    currentLesson++;
    if (currentLesson > TOTAL) {
      document.getElementById("progressBar").style.width = "100%";
      document.getElementById("progressText").innerText =
        `All ${TOTAL} lessons done!`;
      setTimeout(showCertificate, 900);
    } else {
      setTimeout(loadLesson, 900);
    }
  } else {
    outputDiv.className = "error";
    outputDiv.innerText += "\n❌ Not quite — give it another try!";
    showToast("❌ Not quite. Try again!", "error");
  }
});

// ═══════════════ RESET ═══════════════
document
  .getElementById("resetProgress")
  .addEventListener("click", function() {
    if (confirm("Reset all progress and start from Lesson 1?")) {
      currentLesson = 1;
      localStorage.removeItem("aceblocksLesson");
      loadLesson();
      showToast("Progress reset to Lesson 1.", "error");
    }
  });

// ═══════════════ CERTIFICATE ═══════════════
function showCertificate() {
  const name = prompt(
    "🎉 You finished all 12 lessons!\n\nEnter your name for the certificate:",
  );
  document.getElementById("certName").innerText = name || "Student";
  const today = new Date();
  document.getElementById("certDate").innerText =
    "Issued on " +
    today.toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  document.getElementById("certificate").style.display = "block";
  localStorage.removeItem("aceblocksLesson");
}

// ═══════════════ DEV TOOLS ═══════════════
window.aceblocksSkipToCertificate = function() {
  showCertificate();
};
document.addEventListener("keydown", function(e) {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyC") showCertificate();
});
