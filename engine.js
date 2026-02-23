document.addEventListener("DOMContentLoaded", () => {
  loadLesson();

  const workspace = document.getElementById("workspace");

  workspace.addEventListener("dragover", e => e.preventDefault());

  workspace.addEventListener("drop", e => {
    e.preventDefault();
    const code = e.dataTransfer.getData("text/plain");

    const block = document.createElement("div");
    block.className = "block";
    block.innerText = code;
    block.dataset.code = code;

    workspace.appendChild(block);
  });
});

function runCode() {
  const blocks = document.querySelectorAll("#workspace .block");
  let generatedCode = "";

  blocks.forEach(block => {
    generatedCode += block.dataset.code + "\n";
  });

  document.getElementById("output").innerText = generatedCode;

  if (lessons[currentLesson].validate(generatedCode)) {
    alert("Correct! Moving to next lesson.");
    currentLesson++;
    document.getElementById("workspace").innerHTML = "";
    if (currentLesson < lessons.length) {
      loadLesson();
    } else {
      alert("Course Complete!");
    }
  } else {
    alert("Not quite right. Try again.");
  }
}

function clearWorkspace() {
  document.getElementById("workspace").innerHTML = "";
}

function exportCode() {
  const code = document.getElementById("output").innerText;
  const blob = new Blob([code], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "script.lua";
  link.click();
}
