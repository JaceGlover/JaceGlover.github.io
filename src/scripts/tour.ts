/**
 * AceBlocks Guided Tour
 * Add to both index.html and lessons.html just before </body>:
 *   <script src="scripts/tour.js" defer></script>
 */

class Tour {
  selector: string;
  title: string;
  text: string;
  position: string;
  last: boolean;
  constructor(
    selector: string,
    title: string,
    text: string,
    position: string,
    last?: boolean,
  ) {
    this.selector = selector;
    this.title = title;
    this.text = text;
    this.position = position;
    last === undefined ? (this.last = false) : (this.last = last);
  }
}
(function () {
  const TOURS: Record<string, Array<Tour>> = {
    index: [
      new Tour(
        ".logo",
        "👋 Welcome to AceBlocks!",
        "This is AceBlocks — a beginner-friendly visual coding platform. Let's show you around.",
        "bottom",
      ),
      new Tour(
        "nav .nav-cta",
        "🚀 Start Learning",
        "Click here anytime to jump straight into the coding lessons.",
        "bottom",
      ),
      new Tour(
        ".hero h1",
        "🧱 Build Code Visually",
        "No typing complex syntax — drag and drop blocks to write real programs.",
        "bottom",
      ),
      new Tour(
        "#features",
        "⚡ Core Features",
        "Scroll down to explore everything AceBlocks offers — lessons, sandboxes, and more.",
        "top",
      ),
      new Tour(
        "#team",
        "🤝 Meet the Team",
        "We're a small team building tools to make coding accessible for everyone.",
        "top",
      ),
      new Tour(
        ".cta-banner",
        "🎉 You're all set!",
        "That's the tour! Hit Start Learning whenever you're ready. Good luck!",
        "top",
        true,
      ),
    ],
    lessons: [
      new Tour(
        ".logo",
        "📚 AceBlocks Lessons",
        "Welcome to lessons! Here you'll learn to code step by step using visual blocks.",
        "bottom",
      ),
      new Tour(
        "#startBtn",
        "▶ Start Here",
        "Click this button to begin the lessons. You can pick up where you left off anytime.",
        "top",
      ),
      new Tour(
        ".lesson-preview",
        "🗺️ What You'll Learn",
        "These are all the topics covered across 12 lessons — from Hello World to real logic.",
        "top",
      ),
      new Tour(
        "#startBtn",
        "🎉 Ready to code!",
        "That's it — hit Start Lessons and begin your first challenge. Have fun!",
        "top",
        true,
      ),
    ],
  };

  function getPageKey() {
    const path = window.location.pathname;
    if (path.includes("lessons")) return "lessons";
    return "index";
  }

  function hasSeenTour(key: string) {
    try {
      return localStorage.getItem("aceblocks_tour_" + key) === "done";
    } catch (e) {
      return false;
    }
  }

  function markTourDone(key: string) {
    try {
      localStorage.setItem("aceblocks_tour_" + key, "done");
    } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById("ab-tour-styles")) return;
    const style = document.createElement("style");
    style.id = "ab-tour-styles";
    style.textContent = `
      #ab-tour-overlay {
        position: fixed;
        inset: 0;
        z-index: 89998;
        pointer-events: none;
      }
      .ab-tour-highlight {
        position: relative;
        z-index: 89999 !important;
        border-radius: 8px;
        box-shadow: 0 0 0 4px rgba(91,107,255,0.6), 0 0 0 9999px rgba(4,6,15,0.75) !important;
        transition: box-shadow 0.3s ease;
      }
      #ab-tour-tooltip {
        position: fixed;
        z-index: 90000;
        max-width: 300px;
        background: #0d1120;
        border: 1px solid rgba(99,120,255,0.35);
        border-radius: 14px;
        padding: 18px 20px 16px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        animation: abTooltipIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        font-family: 'Space Grotesk', sans-serif;
      }
      #ab-tour-tooltip::before {
        content: '';
        position: absolute;
        width: 100%; height: 2px;
        top: 0; left: 0;
        border-radius: 14px 14px 0 0;
        background: linear-gradient(90deg, #5b6bff, #38f0c0);
      }
      #ab-tour-tooltip .ab-arrow {
        position: absolute;
        width: 10px; height: 10px;
        background: #0d1120;
        border: 1px solid rgba(99,120,255,0.35);
      }
      #ab-tour-tooltip .ab-arrow.top    { top:-6px; left:50%; transform:translateX(-50%) rotate(45deg); border-bottom:none; border-right:none; }
      #ab-tour-tooltip .ab-arrow.bottom { bottom:-6px; left:50%; transform:translateX(-50%) rotate(45deg); border-top:none; border-left:none; }
      #ab-tour-tooltip .ab-tour-step { font-size:0.68rem; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#38f0c0; margin-bottom:6px; }
      #ab-tour-tooltip .ab-tour-title { font-family:'Syne',sans-serif; font-size:1rem; font-weight:800; color:#e8eaf6; margin-bottom:8px; line-height:1.3; }
      #ab-tour-tooltip .ab-tour-text { font-size:0.86rem; color:#7b83a6; line-height:1.65; margin-bottom:16px; }
      #ab-tour-tooltip .ab-tour-actions { display:flex; align-items:center; justify-content:space-between; gap:8px; }
      #ab-tour-tooltip .ab-skip { background:none; border:none; color:#7b83a6; font-size:0.78rem; font-weight:600; font-family:'Space Grotesk',sans-serif; cursor:pointer; padding:0; transition:color 0.2s; }
      #ab-tour-tooltip .ab-skip:hover { color:#ef4444; }
      #ab-tour-tooltip .ab-next { padding:8px 18px; background:#5b6bff; color:#fff; border:none; border-radius:8px; font-size:0.85rem; font-weight:700; font-family:'Space Grotesk',sans-serif; cursor:pointer; transition:background 0.2s,transform 0.2s; }
      #ab-tour-tooltip .ab-next:hover { background:#6e7dff; transform:translateY(-1px); }
      #ab-tour-tooltip .ab-dots { display:flex; gap:5px; align-items:center; }
      #ab-tour-tooltip .ab-dot { width:6px; height:6px; border-radius:50%; background:rgba(91,107,255,0.25); transition:background 0.2s,transform 0.2s; }
      #ab-tour-tooltip .ab-dot.active { background:#5b6bff; transform:scale(1.3); }
      #ab-tour-relaunch {
        position:fixed; bottom:28px; right:28px; z-index:89997;
        padding:10px 18px; background:rgba(13,17,32,0.9);
        border:1px solid rgba(91,107,255,0.3); border-radius:100px;
        color:#7b83a6; font-size:0.8rem; font-weight:700;
        font-family:'Space Grotesk',sans-serif; cursor:pointer;
        display:flex; align-items:center; gap:7px;
        backdrop-filter:blur(12px);
        transition:border-color 0.2s,color 0.2s,transform 0.2s;
        box-shadow:0 4px 20px rgba(0,0,0,0.4);
      }
      #ab-tour-relaunch:hover { border-color:rgba(91,107,255,0.6); color:#e8eaf6; transform:translateY(-2px); }
      @keyframes abTooltipIn {
        from { opacity:0; transform:scale(0.88) translateY(8px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  function createTooltip() {
    const el = document.createElement("div");
    el.id = "ab-tour-tooltip";
    document.body.appendChild(el);
    return el;
  }

  function removeTooltip() {
    const el = document.getElementById("ab-tour-tooltip");
    if (el) el.remove();
  }

  function positionTooltip(
    tooltip: HTMLDivElement,
    target: Element,
    position: string,
  ) {
    const tr = target.getBoundingClientRect();
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const margin = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top, left;
    if (position === "bottom") {
      top = tr.bottom + margin;
      left = tr.left + tr.width / 2 - tw / 2;
    } else {
      top = tr.top - th - margin;
      left = tr.left + tr.width / 2 - tw / 2;
    }
    left = Math.max(12, Math.min(left, vw - tw - 12));
    top = Math.max(80, Math.min(top, vh - th - 12));
    tooltip.style.top = top + "px";
    tooltip.style.left = left + "px";
    const arrow = tooltip.querySelector(".ab-arrow");
    if (arrow) {
      arrow.className =
        "ab-arrow " + (position === "bottom" ? "top" : "bottom");
    }
  }

  function runTour(steps: Tour[], pageKey: string) {
    injectStyles();

    const overlay = document.createElement("div");
    overlay.id = "ab-tour-overlay";
    document.body.appendChild(overlay);

    // Mark as done IMMEDIATELY so even if they close the tab mid-tour it won't repeat
    markTourDone(pageKey);

    function showStep(index: number) {
      document
        .querySelectorAll(".ab-tour-highlight")
        .forEach((el) => el.classList.remove("ab-tour-highlight"));
      removeTooltip();

      if (index >= steps.length) {
        endTour();
        return;
      }

      const step = steps[index];
      if (step === undefined) throw new ReferenceError();
      const target = document.querySelector(step.selector);
      if (!target) {
        showStep(index + 1);
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        target.classList.add("ab-tour-highlight");

        const tooltip = createTooltip();
        tooltip.innerHTML = `
          <div class="ab-arrow top"></div>
          <div class="ab-tour-step">Step ${index + 1} of ${steps.length}</div>
          <div class="ab-tour-title">${step.title}</div>
          <div class="ab-tour-text">${step.text}</div>
          <div class="ab-tour-actions">
            <button class="ab-skip">Skip tour</button>
            <div class="ab-dots">
              ${steps.map((_, i) => `<div class="ab-dot${i === index ? " active" : ""}"></div>`).join("")}
            </div>
            <button class="ab-next">${step.last ? "Finish 🎉" : "Next →"}</button>
          </div>`;

        requestAnimationFrame(() => {
          positionTooltip(tooltip, target, step.position || "bottom");
        });

        tooltip
          .querySelector(".ab-next")
          ?.addEventListener("click", () => showStep(index + 1));
        tooltip.querySelector(".ab-skip")?.addEventListener("click", endTour);
      }, 400);
    }

    function endTour() {
      document
        .querySelectorAll(".ab-tour-highlight")
        .forEach((el) => el.classList.remove("ab-tour-highlight"));
      removeTooltip();
      overlay.remove();
      addRelaunchButton(steps, pageKey);
    }

    showStep(0);
  }

  function addRelaunchButton(steps: Tour[], pageKey: string) {
    if (document.getElementById("ab-tour-relaunch")) return;
    const btn = document.createElement("button");
    btn.id = "ab-tour-relaunch";
    btn.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Tour`;
    btn.addEventListener("click", () => {
      btn.remove();
      runTour(steps, pageKey);
    });
    document.body.appendChild(btn);
  }

  function init() {
    const pageKey = getPageKey();
    const steps = TOURS[pageKey];
    if (!steps) return;

    if (hasSeenTour(pageKey)) {
      injectStyles();
      addRelaunchButton(steps, pageKey);
      return;
    }

    setTimeout(() => runTour(steps, pageKey), 800);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
