var gAddonsListbox = null;

function onAddonsLoad() {
  gAddonsListbox = document.getElementById("addons-listbox");
}
window.addEventListener("load", onAddonsLoad, false);

function setAddons(config) {
  if (config.hasOwnProperty("addons")) {
    for (var i=0; i < config.addons.length; i++) {
      gAddonsListbox.appendItem(config.addons[i]);
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

function onAddAddonFromURL() {
  var retVals = { name: null, location: null};
  window.openDialog("chrome://cck2wizard/content/url-dialog.xul", "cck2wizard-bookmark", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  var url = retVals.url;
  try {
    Services.io.newURI(url, null, null);
  } catch (ex) {
    showErrorMessage("invalidurl");
    return;
  }
  var listitem = gAddonsListbox.appendItem(url);
  listitem.setAttribute("context", "addons-contextmenu");
}

function onAddAddonFromFile() {
  var addonfile = chooseFile(window);
  if (!addonfile) {
    return;
  }
  var listitem = gAddonsListbox.appendItem(addonfile.path);
  listitem.setAttribute("context", "addons-contextmenu");
}

function onDeleteAddon() {
  if (gAddonsListbox.selectedIndex == -1) {
    return;
  }
  gAddonsListbox.removeChild(gAddonsListbox.selectedItem);
}

function onKeyPressAddon(event) {
  if (event.keyCode == event.DOM_VK_DELETE ||
             event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeleteAddon();
  }
}
