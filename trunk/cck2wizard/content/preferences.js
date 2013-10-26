Cu.import("resource://gre/modules/XPCOMUtils.jsm");

var prefAutoCompleteFactory = null;

var gPreferencesListbox = null;

function onPreferencesLoad() {
  gPreferencesListbox = document.getElementById("preferences-listbox");
}
window.addEventListener("load", onPreferencesLoad, false);

function onPreferencesUnload() {
}
window.addEventListener("unload", onPreferencesUnload, false);

//boolean, integer, string

function setPreferences(config) {
  if ("preferences" in config) {
    for (var preference in config.preferences) {
      addPreference(preference, config.preferences[preference].value,
                       typeof config.preferences[preference].value,
                       config.preferences[preference].locked)
    }
  }
}

function getPreferences(config) {
  if (gPreferencesListbox.itemCount > 0) {
    if (!config.preferences) {
      config.preferences = {};
    }
  }
  for (var i=0; i < gPreferencesListbox.itemCount; i++) {
    var prefinfo = {};
    var listitem = gPreferencesListbox.getItemAtIndex(i);
    var name = listitem.childNodes[0].getAttribute("label");
    var type = listitem.childNodes[2].getAttribute("label");
    prefinfo.value = listitem.childNodes[3].getAttribute("label");
    switch (type) {
      case "integer":
        prefinfo.value = parseInt(prefinfo.value);
        break;
      case "boolean":
        prefinfo.value = JSON.parse(prefinfo.value);
        break;
    }
    if (listitem.hasAttribute("locked")) {
      prefinfo.locked = true;
    }
    config.preferences[name] = prefinfo;
  }
  return config;
}

function resetPreferences() {
  while (gPreferencesListbox.itemCount > 0) {
    gPreferencesListbox.removeItemAt(0);
  }
}

function onAddPreference() {
  var retVals = { name: null, value: null, type: null };
  var confirm = window.openDialog("chrome://cck2wizard/content/preferences-dialog.xul", "cck2wizard-preference", "modal,centerscreen", retVals);
  if ("cancel" in retVals) {
    return;
  }
  addPreference(retVals.name, retVals.value, retVals.type, false);
}

function addPreference(name, value, type, locked) {
  for (var i=0; i < gPreferencesListbox.itemCount; i++) {
    var listitem = gPreferencesListbox.getItemAtIndex(i);
    var label = listitem.firstChild.getAttribute("label");
    if (label == name) {
      alert("duplicate");
      return;
    }
    if (label > name) {
      gPreferencesListbox.insertBefore(createPreferenceListItem(name, value, type, locked),
                                       listitem);
      return;
    }
  }
  gPreferencesListbox.appendChild(createPreferenceListItem(name, value, type, locked));
}

function createPreferenceListItem(name, value, type, locked) {
  var listitem = document.createElement("listitem");
  var nameCell = document.createElement("listcell");
  nameCell.setAttribute("label", name);
  var typeCell = document.createElement("listcell");
  if (type == "number") {
    type = "integer";
  }
  typeCell.setAttribute("label", type);
  var statusCell = document.createElement("listcell");
  if (locked) {
    statusCell.setAttribute("label", "locked");
    listitem.setAttribute("locked", "true");
  } else {
    statusCell.setAttribute("label", "default");
  }
  var valueCell = document.createElement("listcell");
  valueCell.setAttribute("label", value);
  listitem.appendChild(nameCell);
  listitem.appendChild(statusCell);
  listitem.appendChild(typeCell);
  listitem.appendChild(valueCell);
  listitem.setAttribute("context", "preferences-contextmenu");
  return listitem;
}

function updatePreferenceListItem(listitem, name, value, type, locked) {
  listitem.childNodes[0].setAttribute("label", name);
  listitem.childNodes[2].setAttribute("label", type);
  listitem.childNodes[3].setAttribute("label", value);
}

function onDeletePreference() {
  if (gPreferencesListbox.selectedIndex == -1) {
    return;
  }
  gPreferencesListbox.removeChild(gPreferencesListbox.selectedItem);
}

function convertListItemToPreference(listitem) {
  var preference = {};
  preference.name = listitem.childNodes[0].getAttribute("label");
  preference.type = listitem.childNodes[2].getAttribute("label");
  var value = listitem.childNodes[3].getAttribute("label");
  switch (preference.type) {
    case "integer":
      value = parseInt(value);
      break;
    case "boolean":
      value = JSON.parse(value);
      break;
  }
  preference.value = value;
//    var locked = listitem.childNodes[3].getAttribute("label");
  return preference;
}

function onLockUnlockPreference() {
  var listitem = gPreferencesListbox.selectedItem;
  if (listitem.getAttribute("locked")) {
    listitem.removeAttribute("locked");
    listitem.childNodes[1].setAttribute("label", "default");
  } else {
    listitem.setAttribute("locked", "true");
    listitem.childNodes[1].setAttribute("label", "locked");
  }
}

function onPreferencesPopup(event) {
  var listitem = gPreferencesListbox.selectedItem;
  if (listitem.hasAttribute("locked")) {
    document.getElementById("preferences-lock").hidden = true;
    document.getElementById("preferences-unlock").hidden = false;
  } else {
    document.getElementById("preferences-lock").hidden = false;
    document.getElementById("preferences-unlock").hidden = true;
  }
}

function onEditPreference() {
  if (gPreferencesListbox.selectedIndex == -1) {
    return;
  }
  var retVals = convertListItemToPreference(gPreferencesListbox.selectedItem);
  window.openDialog("chrome://cck2wizard/content/preferences-dialog.xul", "cck2wizard-preference", "modal,centerscreen", retVals);
  if ("cancel" in retVals) {
    return;
  }
  updatePreferenceListItem(listitem, retVals.name, retVals.value, retVals.type, false);
}


function onKeyPressPreference(event) {
  if (event.keyCode == event.DOM_VK_ENTER ||
      event.keyCode == event.DOM_VK_RETURN) {
    onEditPreference();
  } else if (event.keyCode == event.DOM_VK_DELETE ||
             event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeletePreference();
  }
}