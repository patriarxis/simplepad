var notes = document.querySelector('.textarea');
var storedNotes = localStorage.getItem('notes');

notes.addEventListener('input', () => {
  localStorage.setItem('notes', notes.textContent);
});

window.addEventListener('load', () => {
  notes.textContent = storedNotes;
});