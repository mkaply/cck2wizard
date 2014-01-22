var gHiddenUIListbox = null;

function onHiddenUILoad() {
  gHiddenUIListbox = document.getElementById("hiddenui-listbox");
}
window.addEventListener("load", onHiddenUILoad, false);

function setHiddenUI(config) {
  if ("hiddenUI" in config) {
    for (var i=0; i < config.hiddenUI.length; i++) {
      var listitem = gHiddenUIListbox.appendItem(config.hiddenUI[i]);
      listitem.setAttribute("context", "hiddenui-contextmenu")
    }
  }
}

function getHiddenUI(config) {
  if (gHiddenUIListbox.itemCount > 0) {
    config.hiddenUI = [];
    for (var i=0; i < gHiddenUIListbox.itemCount; i++) {
      config.hiddenUI.push(gHiddenUIListbox.getItemAtIndex(i).label);
    }
  }
  return config;
}

function resetHiddenUI() {
  while (gHiddenUIListbox.itemCount > 0) {
    gHiddenUIListbox.removeItemAt(0);
  }
}

function onAddHiddenUI() {
  var retVals = { name: null, location: null, folder: true};
  window.openDialog("chrome://cck2wizard/content/bookmarks-dialog.xul", "cck2wizard-bookmark", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  var listitem = gHiddenUIListbox.appendItem(retVals.name);
  listitem.setAttribute("context", "hiddenui-contextmenu")
}

function onDeleteHiddenUI() {
  if (gHiddenUIListbox.selectedIndex == -1) {
    return;
  }
  gHiddenUIListbox.removeChild(gHiddenUIListbox.selectedItem);
}


function onKeyPressHiddenUI(event) {
  if (event.keyCode == event.DOM_VK_DELETE ||
      event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeleteHiddenUI();
  }
}
