const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.12 },
);

document
  .querySelectorAll(".feature-card, .team-card, .stat")
  .forEach((el) => observer.observe(el));

window.addEventListener("scroll", () => {
  const grid = document.querySelector(".grid-lines");
  if (grid)
    grid.style.transform = `translateY(${window.scrollY * 0.15}px)`;
});
