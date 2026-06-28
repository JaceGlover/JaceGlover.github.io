import type * as BlocklyTypes from "blockly";
declare const Blockly: typeof BlocklyTypes;
// ═══════════════ GLOBALS ═══════════════
let workspace: null | BlocklyTypes.WorkspaceSvg = null;
let currentLessonNum = parseInt(localStorage.getItem("aceblocksLesson") || "1");

// ═══════════════ HELPERS ═══════════════
function getCode(): string {
  return workspace !== null
    ? Blockly.JavaScript.workspaceToCode(workspace)
    : "";
}

function runCode() {
  const outputDiv = document.getElementById("output");
  if (outputDiv === null) {
    throw new ReferenceError();
  }
  outputDiv.className = "";
  outputDiv.innerText = "";
  const orig = console.log;
  console.log = function (msg) {
    outputDiv.innerText += msg + "\n";
    orig(msg);
  };
  try {
    eval(getCode());
  } catch (e: any) {
    outputDiv.innerText += "Error: " + e.message;
  }
  console.log = orig;
}

function hasPrintWithValue() {
  return workspace
    ? workspace
        .getAllBlocks(false)
        .some((b) => b.type === "text_print" && b.getInputTargetBlock("TEXT"))
    : false;
}

function countValidPrints() {
  return workspace
    ? workspace
        .getAllBlocks(false)
        .filter((b) => b.type === "text_print" && b.getInputTargetBlock("TEXT"))
        .length
    : 0;
}

function getOutputText() {
  const output = document.getElementById("output");
  return output === null ? "" : output.innerText;
}

// ═══════════════ TOAST ═══════════════
function showToast(msg: string, type = "success") {
  const t = document.getElementById("toast");
  if (t === null) {
    throw new ReferenceError();
  }
  t.textContent = msg;
  t.className = "toast " + type + " show";
  setTimeout(() => {
    t.className = "toast " + type;
  }, 2800);
}

// ═══════════════ LESSONS ═══════════════
// Chapters: basics (1-3), numbers (4-6), math (7-9), challenge (10-12)
class Lesson {
  chapter: string;
  chapterLabel: string;
  title: string;
  objective: string;
  hint: string;
  check: () => boolean;
  constructor(
    chapter: string,
    chapterLabel: string,
    title: string,
    objective: string,
    hint: string,
    check: () => boolean,
  ) {
    this.chapter = chapter;
    this.chapterLabel = chapterLabel;
    this.title = title;
    this.objective = objective;
    this.hint = hint;
    this.check = check;
  }
}
const lessons: Record<number, Lesson> = {
  1: new Lesson(
    "basics",
    "Chapter 1 - Basics",
    'Lesson 1 — Print "Hello World"',
    'Use the print block to display "Hello World".',
    "Tip: Drag a Print block, connect a Text block to it, and type Hello World inside.",
    () => getCode().toLowerCase().includes("hello world"),
  ),
  2: new Lesson(
    "basics",
    "Chapter 1 - Basics",
    "Lesson 2 — Print Anything",
    "Print any message you like using the text print block.",
    "Tip: Type anything into a Text block and connect it to a Print block.",
    hasPrintWithValue,
  ),
  3: new Lesson(
    "basics",
    "Chapter 1 — Basics",
    "Lesson 3 — Print Your Name",
    "Use the print block to display your own name.",
    "Tip: Type your name into a Text block, then connect it to a Print block.",
    () => {
      const code = getCode();
      // Must have a print with a non-empty text value, and it shouldn't be a default placeholder
      return hasPrintWithValue() && code.length > 20;
    },
  ),
  4: new Lesson(
    "numbers",
    "Chapter 2 — Numbers",
    "Lesson 4 — Print the Number 5",
    "Use the print block to show the number 5.",
    "Tip: Use a Number block (not a Text block) set to 5, then connect it to Print.",
    () => {
      const code = getCode();
      return code.includes("5") && hasPrintWithValue();
    },
  ),
  5: new Lesson(
    "numbers",
    "Chapter 2 — Numbers",
    "Lesson 5 — Print the Number 10",
    "Print the number 10 using a number block.",
    "Tip: Set a Number block to 10 and connect it to a Print block.",
    () => {
      const code = getCode();
      return code.includes("10") && hasPrintWithValue();
    },
  ),
  6: new Lesson(
    "numbers",
    "Chapter 2 — Numbers",
    "Lesson 6 — Add 2 + 3",
    "Print the result of 2 + 3.",
    "Tip: Use a Math Arithmetic block set to ADD, plug in Number blocks for 2 and 3, then Print.",
    () => getCode().includes("2 + 3"),
  ),
  7: new Lesson(
    "math",
    "Chapter 3 — Math",
    "Lesson 7 — Subtract 10 − 4",
    "Print the result of 10 minus 4.",
    "Tip: Use the Math Arithmetic block and switch it to MINUS. Set the numbers to 10 and 4.",
    () => getCode().includes("10 - 4"),
  ),
  8: new Lesson(
    "math",
    "Chapter 3 — Math",
    "Lesson 8 — Multiply 3 × 6",
    "Print the result of 3 multiplied by 6.",
    "Tip: Switch the Math Arithmetic block to MULTIPLY (×). Set the numbers to 3 and 6.",
    () => getCode().includes("3 * 6"),
  ),
  9: new Lesson(
    "math",
    "Chapter 3 — Math",
    "Lesson 9 — Print a Number Over 50",
    "Print any number that is greater than 50.",
    "Tip: Use a Number block set to any value larger than 50 (e.g. 99, 100, 77...).",
    () => {
      const code = getCode();
      const matches = code.match(/console\.log\((\d+(\.\d+)?)\)/);
      if (matches !== null && matches.length > 1) {
        return parseFloat(matches[1] as string) > 50;
      } // Also allow math results
      const output = getOutputText();
      const numMatch = output.match(/^(\d+(\.\d+)?)/);
      if (numMatch !== null && numMatch[1] !== undefined)
        return parseFloat(numMatch[1]) > 50;
      return false;
    },
  ),
  10: new Lesson(
    "challenge",
    "Chapter 4 — Challenge",
    "Lesson 10 — Print Two Things",
    "Print at least two separate messages or numbers.",
    "Tip: Add two Print blocks — each one can have different content.",
    () => countValidPrints() >= 2,
  ),
  11: new Lesson(
    "challenge",
    "Chapter 4 — Challenge",
    "Lesson 11 — Print Three Lines",
    "Print three separate messages, numbers, or calculations.",
    "Tip: Add three Print blocks to the workspace, each with something connected.",
    () => countValidPrints() >= 3,
  ),
  12: new Lesson(
    "challenge",
    "Chapter 4 — Challenge",
    'Lesson 12 — Print "I Love Coding"',
    'Use the print block to display "I Love Coding".',
    "Tip: Type I Love Coding exactly into a Text block (capitalisation doesn't matter).",
    () => getCode().toLowerCase().includes("i love coding"),
  ),
};

const TOTAL = Object.keys(lessons).length;

const chapterClasses: Record<string, string> = {
  basics: "chapter-basics",
  numbers: "chapter-numbers",
  math: "chapter-logic",
  challenge: "chapter-challenge",
};

// ═══════════════ LOAD LESSON ═══════════════
function loadLesson() {
  if (!workspace) return;
  workspace.clear();
  // Getting elements
  const l = lessons[currentLessonNum] as Lesson;
  const chapterBadgeWrap = document.getElementById(
    "chapterBadgeWrap",
  ) as HTMLElement;
  const lessonTitle = document.getElementById("lessonTitle") as HTMLElement;
  const lessonObjective = document.getElementById(
    "lessonObjective",
  ) as HTMLElement;
  const lessonHint = document.getElementById("lessonHint") as HTMLElement;
  const outputDiv = document.getElementById("output") as HTMLElement;
  const progressBar = document.getElementById("progressBar") as HTMLElement;
  const progressText = document.getElementById("progressText") as HTMLElement;
  // Making sure that the elements exist
  if (
    [
      chapterBadgeWrap,
      l,
      lessonTitle,
      lessonObjective,
      lessonHint,
      outputDiv,
      progressBar,
      startBtn,
    ].some((element) => {
      return element === null || element === undefined;
    })
  )
    throw new ReferenceError();
  // Actual stuff
  chapterBadgeWrap.innerHTML = `<span class="chapter-badge ${chapterClasses[l.chapter]}">${l.chapterLabel}</span>`;
  lessonTitle.innerText = l.title;
  lessonObjective.innerText = l.objective;
  lessonHint.innerText = l.hint;
  outputDiv.innerText = "Ready — run your code to see results here.";
  outputDiv.className = "";
  localStorage.setItem("aceblocksLesson", currentLessonNum.toString());
  const pct = Math.min(((currentLessonNum - 1) / TOTAL) * 100, 100);
  progressBar.style.width = pct + "%";
  progressText.innerText = `Lesson ${currentLessonNum} of ${TOTAL}`;
}

// ═══════════════ START ═══════════════
const startBtn = document.getElementById("startBtn");
startBtn?.addEventListener("click", function () {
  // Getting elements
  const lessonIntro = document.getElementById("lessonIntro") as HTMLElement;
  const lessonArea = document.getElementById("lessonArea") as HTMLElement;
  const toolbox = document.getElementById("toolbox") as HTMLElement;
  // Making sure elements exist
  if (
    [lessonIntro, lessonArea, toolbox].some((element) => {
      return element === null;
    })
  )
    throw new ReferenceError();
  // The actual stuff
  lessonIntro.style.display = "none";
  lessonArea.style.display = "block";

  workspace = Blockly.inject("blocklyDiv", {
    toolbox: toolbox,
    theme: Blockly.Theme.defineTheme("aceblocks", {
      base: Blockly.Themes.Classic,
      name: "AceBlocks",
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

  Blockly.JavaScript["text_print"] = (block: BlocklyTypes.Block) => {
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
const runBtn = document.getElementById("runBtn");
runBtn?.addEventListener("click", function () {
  runCode();
  // Getting elements
  const outputDiv = document.getElementById("output") as HTMLElement;
  const progressBar = document.getElementById("progressBar") as HTMLElement;
  const progressText = document.getElementById("progressText") as HTMLElement;
  const currentLesson = lessons[currentLessonNum] as Lesson;
  // Making sure elements exist
  if (
    [outputDiv, currentLesson, progressBar, progressText].some(
      (thingToCheck) => {
        return thingToCheck === null || thingToCheck === undefined;
      },
    )
  )
    throw new ReferenceError();
  if (currentLesson.check()) {
    outputDiv.className = "success";
    outputDiv.innerText += "\n✅ Correct! Well done.";
    showToast("✅ Lesson " + currentLessonNum + " complete!", "success");
    currentLessonNum++;
    if (currentLessonNum > TOTAL) {
      progressBar.style.width = "100%";
      progressText.innerText = `All ${TOTAL} lessons done!`;
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
document.getElementById("resetProgress")?.addEventListener("click", () => {
  if (confirm("Reset all progress and start from Lesson 1?")) {
    currentLessonNum = 1;
    localStorage.removeItem("aceblocksLesson");
    loadLesson();
    showToast("Progress reset to Lesson 1.", "error");
  }
});

// ═══════════════ CERTIFICATE ═══════════════
function showCertificate() {
  // Getting vars
  const name = prompt(
    "🎉 You finished all 12 lessons!\n\nEnter your name for the certificate:",
  );
  const certName = document.getElementById("certName") as HTMLElement;
  const certDate = document.getElementById("certDate") as HTMLElement;
  const certificate = document.getElementById("certificate") as HTMLElement;
  const today = new Date();
  // Making sure elements exist
  if (
    [certName, certDate, certificate].some((element) => {
      return element === null;
    })
  )
    throw new ReferenceError();
  certName.innerText = name || "Student";
  certDate.innerText =
    "Issued on " +
    today.toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  certificate.style.display = "block";
  localStorage.removeItem("aceblocksLesson");
}

// ═══════════════ DEV TOOLS ═══════════════
(window as any).aceblocksSkipToCertificate = () => {
  showCertificate();
};
document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.shiftKey && e.code === "KeyC") showCertificate();
});
