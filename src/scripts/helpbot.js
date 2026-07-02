function sendMessage() {
  const input = document.getElementById("user-input");
  if (!(input instanceof HTMLInputElement)) throw new ReferenceError();
  const userText = input.value.toLowerCase();
  if (userText === "") return;
  addMessage("user", userText);
  let response = getBotResponse(userText);
  setTimeout(() => addMessage("bot", response), 500);
  input.value = "";
}

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  if (chatBox === null) throw new ReferenceError();
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function getBotResponse(input) {
  if (input.includes("what is aceblocks") || input.includes("about")) {
    return "AceBlocks is your awesome project platform 😎";
  } else if (input.includes("help")) {
    //keep help inputs ALPHABETICAL.
    return "About: What AceBlocks is about. \n Help: Shows availible commands.";
  } else return "Hmm... I don't know that yet 🤔 try asking something else!";
}
