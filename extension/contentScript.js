function getSelectedEmailContent() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let text = "";
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement && window.getComputedStyle(node.parentElement).visibility !== "hidden") {
      text += node.textContent + " ";
    }
  }
  return text.trim().substring(0, 2000);
}

window.getSelectedEmailContent = getSelectedEmailContent; // Expose globally