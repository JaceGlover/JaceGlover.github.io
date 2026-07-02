// ── TYPEWRITER ──
let i = 0;
const text = "AceBlocks";
function typeWriter() {
  const typeEl = document.getElementById("typeText");
  if (!typeEl) return;
  if (i < text.length) {
    typeEl.insertBefore(
      document.createTextNode(text.charAt(i)),
      typeEl.querySelector(".cursor"),
    );
    i++;
    setTimeout(typeWriter, 110);
  } else {
    setTimeout(() => {
      document.getElementById("codeSymbol")?.classList.add("show");
      setTimeout(() => {
        document.getElementById("introScreen")?.classList.add("hide");
      }, 900);
    }, 300);
  }
}

// ── SMOOTH SCROLL DOWN ──
function goDown() {
  const targetEl = document.getElementById("deepSection");
  if (!targetEl) return;
  const target = targetEl.offsetTop;
  const start = window.scrollY;
  const distance = target - start;
  const duration = 1800;
  let startTime = null;
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }
  function animate(currentTime) {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    window.scrollTo(0, ease(elapsed, start, distance, duration));
    if (elapsed < duration) {
      requestAnimationFrame(animate);
    }
  }
  requestAnimationFrame(animate);
}

// ── SCROLL REVEAL + INIT ──
function init() {
  typeWriter();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 },
  );
  document
    .querySelectorAll(".info-card, .cta-block")
    .forEach((el) => observer.observe(el));
}

init();
window.goDown = goDown;
