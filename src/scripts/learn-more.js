const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(".intro-card, .card, .vision-card, .cta-row")
  .forEach((el) => observer.observe(el));
