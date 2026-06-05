const chatBox = document.getElementById("chat-box");

function sendMessage() {
  const input = document.getElementById("user-input");
  const userText = input.value.toLowerCase();

  if (userText === "") return;

  addMessage("user", userText);

  let response = getBotResponse(userText);
  setTimeout(() => addMessage("bot", response), 500);

  input.value = "";
}

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);

  chatBox.scrollTop = chatBox.scrollHeight;
}

function getBotResponse(input) {
  if (input.includes("what is aceblocks") || input.includes("about")) {
    return "AceBlocks is your awesome project platform 😎";
  }
  //keep help inputs ALPHABETICAL.
  if (input.includes("help")) {
    return "About: What AceBlocks is about. \n Help: Shows availible commands.";
  }

  if (input.includes(""))
    return "Hmm... I don't know that yet 🤔 try asking something else!";
}
