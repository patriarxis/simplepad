var textarea = document.querySelector(".textarea");

textarea.addEventListener("paste", function (e) {
  e.preventDefault();
  var text = (e.originalEvent || e).clipboardData.getData('text/plain');
  document.execCommand("insertHTML", false, text);
});

var notes = document.querySelector('.textarea');
var storedNotes = localStorage.getItem('notes');

notes.addEventListener('input', () => {
  localStorage.setItem('notes', notes.textContent);
});

window.addEventListener('load', () => {
  notes.textContent = storedNotes;
});