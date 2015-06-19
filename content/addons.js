var gAddonsListbox = null;

function onAddonsLoad() {
  gAddonsListbox = document.getElementById("addons-listbox");
}
window.addEventListener("load", onAddonsLoad, false);

function setAddons(config) {
  if (config.hasOwnProperty("addons")) {
    for (var i=0; i < config.addons.length; i++) {
      var listitem;
      if (/^https?:/.test(config.addons[i])) {
        listitem = gAddonsListbox.appendItem(config.addons[i], config.addons[i]);
      } else {
        var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        try {
          file.initWithPath(config.addons[i]);
        } catch (e) {
          file.initWithPath(config.outputDirectory + config.addons[i]);
        }
        listitem = gAddonsListbox.appendItem(file.leafName, file.path);
        listitem.setAttribute("tooltiptext", config.addons[i]);
      }
      listitem.setAttribute("tooltiptext", config.addons[i]);
      listitem.setAttribute("context", "addons-contextmenu");
    }
  }
}

function getAddons(config, relativePaths) {
  if (gAddonsListbox.itemCount > 0) {
    config.addons = [];
    for (var i=0; i < gAddonsListbox.itemCount; i++) {
      var addon = gAddonsListbox.getItemAtIndex(i).getAttribute("value");
      if (relativePaths) {
        addon = addon.replace(config.outputDirectory, "");
      }
      config.addons.push(addon);
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
  var listitem = gAddonsListbox.appendItem(url, url);
  listitem.setAttribute("context", "addons-contextmenu");
}

function onAddAddonFromFile() {
  var addonfile = chooseFile(window);
  if (!addonfile) {
    return;
  }
  var listitem = gAddonsListbox.appendItem(addonfile.leafName, addonfile.path);
  listitem.setAttribute("tooltiptext", addonfile.path);
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
