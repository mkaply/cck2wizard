function onWebPagesLoad() {
}
window.addEventListener("load", onWebPagesLoad, false);

function setWebPages(config) {
  if (!config.hasOwnProperty("preferences")) {
    return;
  }
  if (config.preferences.hasOwnProperty("browser.startup.homepage")) {
    $("HomePageURL").value = config.preferences["browser.startup.homepage"].value;
    if (config.preferences["browser.startup.homepage"].locked) {
      $("lockHomePage").checked = true;
    }
  }
  if (config.preferences.hasOwnProperty("startup.homepage_welcome_url")) {
    if (config.preferences["startup.homepage_welcome_url"].value) {
      $("HomePageWelcomeURL").value = config.preferences["startup.homepage_welcome_url"].value;
    } else {
      $("noWelcomePage").checked = true;
      $("HomePageWelcomeURL").disabled = true;
    }
  }
  if (config.preferences.hasOwnProperty("browser.startup.homepage_override.mstone")) {
    if (config.preferences["browser.startup.homepage_override.mstone"].value != "ignore") {
      $("HomePageOverrideURL").value = config.preferences["browser.startup.homepage_override.mstone"].value;
    } else {
      $("noOverridePage").checked = true;
      $("HomePageOverrideURL").disabled = true;
    }
  }
}

function getWebPages(config) {
  if ($("HomePageURL").value) {
    if (!config.preferences) {
      config.preferences = {};
    }
    var prefinfo = {};
    prefinfo.value = $("HomePageURL").value;
    if ($("lockHomePage").checked) {
      prefinfo.locked = true;
    }
    config.preferences["browser.startup.homepage"] = prefinfo;
  }
  if ($("noWelcomePage").checked) {
    if (!config.preferences) {
      config.preferences = {};
    }
    var prefinfo = {};
    prefinfo.value = "";
    prefinfo.locked = true;
    config.preferences["startup.homepage_welcome_url"] = prefinfo;
  } else if ($("HomePageWelcomeURL").value) {
    if (!config.preferences) {
      config.preferences = {};
    }
    var prefinfo = {};
    prefinfo.value = $("HomePageWelcomeURL").value;
    config.preferences["startup.homepage_welcome_url"] = prefinfo;
  }
  if ($("noOverridePage").checked) {
    if (!config.preferences) {
      config.preferences = {};
    }
    var prefinfo = {};
    prefinfo.value = "ignore";
    prefinfo.locked = true;
    config.preferences["browser.startup.homepage_override.mstone"] = prefinfo;
  } else if ($("HomePageOverrideURL").value) {
    if (!config.preferences) {
      config.preferences = {};
    }
    var prefinfo = {};
    prefinfo.value = $("HomePageOverrideURL").value;
    config.preferences["startup.homepage_override_url"] = prefinfo;
  }
  return config;
}

function resetWebPages() {
}

function enableDisableWelcomePage(disabled) {
  document.getElementById("HomePageWelcomeURL").disabled = disabled;
}
