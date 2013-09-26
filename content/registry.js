var gRegistryListbox = null;

function onRegistryLoad() {
  gRegistryListbox = document.getElementById("registry-listbox");
}
window.addEventListener("load", onRegistryLoad, false);

function onRegistryUnload() {
}
window.addEventListener("unload", onRegistryUnload, false);

function setRegistry(config) {
  if ("registry" in config) {
    for (var item in config.registry) {
      addRegistryItem(config.registry[item]);
    }
  }
}

function getRegistry(config) {
  if (gRegistryListbox.itemCount > 0) {
    config.registry = [];
  }
  for (var i=0; i < gRegistryListbox.itemCount; i++) {
    var registryitem = {};
    var listitem = gRegistryListbox.getItemAtIndex(i);
    config.registry.push(convertListItemToRegistryItem(listitem));
  }
  return config;
}

function resetRegistry() {
  while (gRegistryListbox.itemCount > 0) {
    gRegistryListbox.removeItemAt(0);
  }
}

function onAddRegistryItem() {
  var retVals = { rootkey: null, key: null, name: null, value: null, type: null };
  var confirm = window.openDialog("chrome://cck2wizard/content/registry-dialog.xul", "cck2wizard-registry", "modal", retVals);
  if (confirm) {
    addRegistryItem(retVals, false);
  }
}

function addRegistryItem(registryitem, update) {
  //for (var i=0; i < gRegistryListbox.itemCount; i++) {
  //  var listitem = gRegistryListbox.getItemAtIndex(i);
  //  var label = listitem.firstChild.getAttribute("label");
  //  if (label == name) {
  //    if (!update) {
  //      alert("duplicate");
  //      return;
  //    }
  //    updateListItem(listitem, name, value, type, locked);
  //    return;
  //  }
  //  if (label > name) {
  //    gRegistryListbox.insertBefore(createListItem(name, value, type, locked),
  //                                     listitem);
  //    return;
  //  }
  //}
  gRegistryListbox.appendChild(createListItem(registryitem));
}

function createListCell(label) {
  var listcell = document.createElement("listcell");
  listcell.setAttribute("label", label);
  return listcell;
}

function createListItem(registryitem) {
  var listitem = document.createElement("listitem");
  listitem.appendChild(createListCell(registryitem.rootkey));
  listitem.appendChild(createListCell(registryitem.key));
  listitem.appendChild(createListCell(registryitem.name));
  listitem.appendChild(createListCell(registryitem.value));
  listitem.appendChild(createListCell(registryitem.type));
  listitem.setAttribute("context", "registry-contextmenu");
  return listitem;
}

function updateListItem(registryitem) {
  listitem.childNodes[0].setAttribute("label", rootkey);
  listitem.childNodes[1].setAttribute("label", key);
  listitem.childNodes[2].setAttribute("label", name);
  listitem.childNodes[3].setAttribute("label", value);
  listitem.childNodes[4].setAttribute("label", type);
}

function onDeleteRegistryItem() {
  gRegistryListbox.removeChild(gRegistryListbox.selectedItem);
}

function convertListItemToRegistryItem(listitem) {
  var registryitem = {};
  registryitem.rootkey = listitem.childNodes[0].getAttribute("label");
  registryitem.key = listitem.childNodes[1].getAttribute("label");
  registryitem.name = listitem.childNodes[2].getAttribute("label");
  registryitem.value = listitem.childNodes[3].getAttribute("label");
  registryitem.type = listitem.childNodes[4].getAttribute("label");
  return registryitem;
}

function onEditRegistryItem() {
  var retVals = convertListItemToRegistryItem(gRegistryListbox.selectedItem);
  window.openDialog("chrome://cck2wizard/content/registry-dialog.xul", "cck2wizard-registry", "modal", retVals);
  addPreference(retVals, true);
}
