let currentLesson = 0;

const lessons = [
  {
    title: "Lesson 1: Print Output",
    objective: "Use a print block to print 'Hello Player'",
    blocks: [
      { type: "print", label: "print('Hello Player')" }
    ],
    validate: code => code.includes("print('Hello Player')")
  },
  {
    title: "Lesson 2: Change WalkSpeed",
    objective: "Set Humanoid WalkSpeed to 32",
    blocks: [
      { type: "speed", label: "Humanoid.WalkSpeed = 32" }
    ],
    validate: code => code.includes("WalkSpeed = 32")
  }
];

function loadLesson() {
  const lesson = lessons[currentLesson];

  document.getElementById("lessonTitle").innerText = lesson.title;
  document.getElementById("objective").innerText = lesson.objective;

  const panel = document.getElementById("blockPanel");
  panel.innerHTML = "";

  lesson.blocks.forEach(block => {
    const div = document.createElement("div");
    div.className = "block";
    div.draggable = true;
    div.innerText = block.label;
    div.dataset.code = block.label;

    div.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", block.label);
    });

    panel.appendChild(div);
  });
}
