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
                       config.preferences[preference].locked,
                       config.preferences[preference].userset)
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
    if (listitem.hasAttribute("userset")) {
      prefinfo.userset = true;
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
  addPreference(retVals.name, retVals.value, retVals.type, false, false);
}

function addPreference(name, value, type, locked, userset) {
  for (var i=0; i < gPreferencesListbox.itemCount; i++) {
    var listitem = gPreferencesListbox.getItemAtIndex(i);
    var label = listitem.firstChild.getAttribute("label");
    if (label == name) {
      Services.prompt.alert(window, "CCK2", "An entry for " + name + " already exists.")
      return;
    }
    if (label > name) {
      gPreferencesListbox.insertBefore(createPreferenceListItem(name, value, type, locked, userset),
                                       listitem);
      return;
    }
  }
  gPreferencesListbox.appendChild(createPreferenceListItem(name, value, type, locked, userset));
}

function createPreferenceListItem(name, value, type, locked, userset) {
  var listitem = document.createElement("listitem");
  listitem.setAttribute("equalsize", "always");
  listitem.setAttribute("tooltiptext", name + ": " + value);
  var nameCell = document.createElement("listcell");
  nameCell.setAttribute("flex", "1");
  nameCell.setAttribute("crop", "end");
  nameCell.setAttribute("label", name);
  var typeCell = document.createElement("listcell");
  typeCell.setAttribute("flex", "1");
  if (type == "number") {
    type = "integer";
  }
  typeCell.setAttribute("label", type);
  var statusCell = document.createElement("listcell");
  statusCell.setAttribute("flex", "1");
  if (locked) {
    statusCell.setAttribute("label", "locked");
    listitem.setAttribute("locked", "true");
  } else if (userset) {
    statusCell.setAttribute("label", "user set");
    listitem.setAttribute("userset", "true");
  } else {
    statusCell.setAttribute("label", "default");
  }
  var valueCell = document.createElement("listcell");
  valueCell.setAttribute("flex", "1");
  valueCell.setAttribute("label", value);
  listitem.appendChild(nameCell);
  listitem.appendChild(statusCell);
  listitem.appendChild(typeCell);
  listitem.appendChild(valueCell);
  listitem.setAttribute("context", "preferences-contextmenu");
  return listitem;
}

function updatePreferenceListItem(listitem, name, value, type) {
  listitem.childNodes[0].setAttribute("label", name);
  listitem.childNodes[2].setAttribute("label", type);
  listitem.childNodes[3].setAttribute("label", value);
  listitem.setAttribute("tooltiptext", name + ": " + value);
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

function onLockedPreference() {
  var listitem = gPreferencesListbox.selectedItem;
  listitem.setAttribute("locked", "true");
  listitem.childNodes[1].setAttribute("label", "locked");
  // Can't have user set and locked
  listitem.removeAttribute("userset");
}

function onUserSetPreference() {
  var listitem = gPreferencesListbox.selectedItem;
  listitem.setAttribute("userset", "true");
  listitem.childNodes[1].setAttribute("label", "user set");
  // Can't have user set and locked
  listitem.removeAttribute("locked");
}

function onDefaultPreference() {
  var listitem = gPreferencesListbox.selectedItem;
  listitem.childNodes[1].setAttribute("label", "default");
  // Can't have user set and locked
  listitem.removeAttribute("locked");
  listitem.removeAttribute("userset");
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
  updatePreferenceListItem(gPreferencesListbox.selectedItem, retVals.name, retVals.value, retVals.type);
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
