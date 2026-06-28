// ── TYPEWRITER ──
let i = 0;
const text = "AceBlocks";
function typeWriter() {
  const typeEl = document.getElementById("typeText");
  if (i < text.length) {
    // Insert char before the cursor span
    typeEl?.insertBefore(
      document.createTextNode(text.charAt(i)),
      typeEl.querySelector(".cursor"),
    );
    i++;
    setTimeout(typeWriter, 110);
  } else {
    // Done typing — show subtitle
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
  const target = document.getElementById("deepSection")?.offsetTop;
  if (target === undefined) throw new ReferenceError();
  const start = window.scrollY;
  const distance = target - start;
  const duration = 1800;
  let startTime: null | DOMHighResTimeStamp = null;
  function ease(t: number, b: number, c: number, d: number) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }
  function animate(currentTime: DOMHighResTimeStamp) {
    if (startTime === null) startTime = currentTime;
    const elapsed = currentTime - startTime;
    window.scrollTo(0, ease(elapsed, start, distance, duration));
    if (elapsed < duration) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

// ── SCROLL REVEAL ──

function main() {
  typeWriter();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.1 },
  );
  document
    .querySelectorAll(".info-card, .cta-block")
    .forEach((el) => observer.observe(el));
}
main();
