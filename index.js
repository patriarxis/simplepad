/* Save on LocalStorage */

var notes = document.querySelector('.textarea');
var storedNotes = localStorage.getItem('notes');

notes.addEventListener('input', () => {
  localStorage.setItem('notes', notes.innerHTML);
});

window.addEventListener('load', () => {
  notes.innerHTML = storedNotes;
});


/* Paste As Plain Text */

notes.addEventListener('paste', e => {
  e.preventDefault();
  const text = e.clipboardData
    ? (e.originalEvent || e).clipboardData.getData('text/plain')
    :
    window.clipboardData
      ? window.clipboardData.getData('Text')
      : '';

  if (document.queryCommandSupported('insertText')) {
    document.execCommand('insertText', false, text);
  } else {
    const range = document.getSelection().getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.selectNodeContents(textNode);
    range.collapse(false);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
});

let c = document.querySelectorAll('.btn');
let link = document.querySelector("a");

document.addEventListener("keydown", event => {
  if (event.ctrlKey && event.key === "b") {
    event.preventDefault();
    document.execCommand('bold', false, null);
  }
  if (event.ctrlKey && event.key === "i") {
    event.preventDefault();
    document.execCommand('italic', false, null);
  }
  if (event.ctrlKey && event.key === "k") {
    event.preventDefault();
    let x;
    if (x = window.prompt("Add hyperlink", "https://example.com")) {
      document.execCommand('createLink', false, x);
    }
  }
});