function onLoad() {
  document.getElementById("original_config").value = JSON.stringify(window.arguments[0], null, 2);
  document.getElementById("original_config").selectionStart = 0;
  document.getElementById("original_config").selectionEnd = 0;
  document.getElementById("current_config").value = JSON.stringify(window.arguments[1], null, 2);
  document.getElementById("current_config").selectionStart = 0;
  document.getElementById("current_config").selectionEnd = 0;
}
