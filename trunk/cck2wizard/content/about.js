var gName = null;
var gID = null;

function onAboutLoad() {
  gName = document.getElementById("name");
  gID = document.getElementById("id");
}
window.addEventListener("load", onAboutLoad, false);

function setAbout(config) {
  gName.setAttribute("value", config.name);
  gID.setAttribute("value", config.id);
}

function getAbout(config) {
  if (gName.value) {
    config.name = gName.value;
  }
  if (gID.value) {
    config.id = gID.value;
  }
  return config;
}
