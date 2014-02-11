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

function validateSelector(selector) {
  try {
    document.querySelector(selector);
    return true;
  } catch (e) {
    return false;
  }
}

function onAddHiddenUI() {
  var cssSelector = {value: null};
  var check = {value: null};
  var result = Services.prompt.prompt(window, "CCK2", "Enter a CSS selector:", cssSelector, null, check);
  if (!result) {
    return;
  }
  if (!validateSelector(cssSelector.value)) {
    Services.prompt.alert(window, "CCK2", "Invalid CSS Selector")
    return;
  }
  var listitem = gHiddenUIListbox.appendItem(cssSelector.value);
}

function onEditHiddenUI() {
  if (gHiddenUIListbox.selectedIndex == -1) {
    return;
  }
  var cssSelector = {value: gHiddenUIListbox.selectedItem.label};
  var check = {value: null};
  var result = Services.prompt.prompt(window, "CCK2", "Enter a CSS selector:", cssSelector, null, check);
  if (!result) {
    return;
  }
  if (!validateSelector(cssSelector.value)) {
    Services.prompt.alert(window, "CCK2", "Invalid CSS Selector")
    return;
  }
  gHiddenUIListbox.selectedItem.label = retVals.name;
}

function onDeleteHiddenUI() {
  if (gHiddenUIListbox.selectedIndex == -1) {
    return;
  }
  gHiddenUIListbox.removeChild(gHiddenUIListbox.selectedItem);
}


function onKeyPressHiddenUI(event) {
  if (event.keyCode == event.DOM_VK_ENTER ||
      event.keyCode == event.DOM_VK_RETURN) {
    onEditHiddenUI();
  } else if (event.keyCode == event.DOM_VK_DELETE ||
      event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeleteHiddenUI();
  }
}
