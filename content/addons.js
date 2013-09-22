var gAddonsListbox = null;

function onAddonsLoad() {
  gAddonsListbox = document.getElementById("addons-listbox");
  document.getElementById("addons-addurl").addEventListener("command", addAddonFromURL, false);
  document.getElementById("addons-addfile").addEventListener("command", addAddonFromFile, false);
}
window.addEventListener("load", onAddonsLoad, false);

function setAddons(config) {
  if ("addons" in config) {
    for (var i=0; i < config.addons.length; i++) {
      gAddonsListbox.appendItem(response.name, config.addons[i]);
    }
  }
}

function getAddons(config) {
  if (gAddonsListbox.itemCount > 0) {
    config.addons = [];
    for (var i=0; i < gAddonsListbox.itemCount; i++) {
      config.addons.push(gAddonsListbox.getItemAtIndex(i).label);
    }
  }
  return config;
}

function resetAddons() {
  while (gAddonsListbox.itemCount > 0) {
    gAddonsListbox.removeItemAt(0);
  }
}

function addAddonFromURL() {
  openDialog("cck2wizard-urldialog", "onAddonURLOK");  
}

function addAddonFromFile() {
  var addonfile = chooseFile(window);
  gAddonsListbox.appendItem(addonfile.path);
}

function onAddonURLOK() {
  var url = document.getElementById("cck2wizard-urldialog-url").value;
  try {
    Services.io.newURI(url, null, null);
  } catch (ex) {
    showErrorMessage("invalidurl");
    return false;
  }
  gAddonsListbox.appendItem(url);
  return true;
}
