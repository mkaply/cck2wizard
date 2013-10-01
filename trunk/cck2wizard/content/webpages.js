function onWebPagesLoad() {
}
window.addEventListener("load", onWebPagesLoad, false);

function setWebPages(config) {
  if ("preferences" in config &&
      "browser.startup.homepage" in config.preferences) {
    document.getElementById("HomePageURL").value = config.preferences["browser.startup.homepage"].value;
    if (config.preferences["browser.startup.homepage"].locked) {
      document.getElementById("lockHomePage").checked = true;
    }
  }
}

function getWebPages(config) {
  if (document.getElementById("HomePageURL").value) {
    if (!config.preferences) {
      config.preferences = {};
    }
    var prefinfo = {};
    prefinfo.value = document.getElementById("HomePageURL").value;
    if (document.getElementById("lockHomePage").checked) {
      prefinfo.locked = true;
    }
    config.preferences["browser.startup.homepage"] = prefinfo;
  }
  return config;
}

function resetWebPages() {
}
