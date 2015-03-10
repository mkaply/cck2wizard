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

function setPersona(config) {
  if ("persona" in config) {
    document.getElementById("persona").value = JSON.stringify(config.persona, null, 2);
  }
}

function getPersona(config) {
  if (document.getElementById("persona").value) {
    config.persona = JSON.parse(document.getElementById("persona").value);
  }
  return config;
}

function resetPersona() {
  document.getElementById("persona").value = "";
}

function removePersona() {
  document.getElementById("persona").value = "";
}

function getPersonaInfo(args) {
  var retVals = { name: null, location: null};
  window.openDialog("chrome://cck2wizard/content/url-dialog.xul", "cck2wizard-persona", "modal,centerscreen", retVals);
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
  var splitPersonaURL = url.split("/");
  var personaSlug = null;
  for (var i = splitPersonaURL.length-1; i >=0; i--) {
    if (splitPersonaURL[i]) {
      personaSlug = splitPersonaURL[i];
      break;
    }
  }
  var request = new XMLHttpRequest();
  request.open("GET", "https://services.addons.mozilla.org/firefox/api/addon/" + personaSlug);
  request.onload = function() {
    var id = request.responseXML.documentElement.getAttribute("id");
    var personaRequest = new XMLHttpRequest();
    personaRequest.open("GET", "https://versioncheck.addons.mozilla.org/en-US/themes/update-check/" + id);
    personaRequest.onload = function() {
      document.getElementById("persona").value = JSON.stringify(JSON.parse(personaRequest.response), null, 2);
    }
    personaRequest.send();
  }
  request.send();
}