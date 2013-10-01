function onWebPagesLoad() {
}
window.addEventListener("load", onWebPagesLoad, false);

function setWebPages(config) {
}

function getWebPages(config) {
  if (document.getElementById("HomePageURL").value) {
    if (!config.preferences) {
      config.preferences = {};
    }
    var prefinfo = {};
    prefinfo.value = document.getElementById("HomePageURL").value;
    config.preferences["browser.startup.homepage"] = prefinfo;
  }
  return config;
}

function resetWebPages() {
}
