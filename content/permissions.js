// Other permissions:
// cookie: 1 - Allow, 8 - Allow for Session, 9 - Allow First Party Only, 2 - Block
// password: 1 - Allow, 2 - Block
// geo: 0 - Always Ask, 1 - Allow, 2 - Block
// indexedDB: 0 - Always Ask, 1 - Allow, 2 - Block
// fullscreen: 0 - Always Ask, 1 - Allow, 2 - Block
// plugins : 0 - Always Ask, 1 - Allow, 2 - Block

var gPermissionsListbox = null;

function onPermissionsLoad() {
  gPermissionsListbox = document.getElementById("permissions-listbox");
}
window.addEventListener("load", onPermissionsLoad, false);

function onPermissionsUnload() {
}
window.addEventListener("unload", onPermissionsUnload, false);

function setPermissions(config) {
  if ("permissions" in config) {
    for (var item in config.permissions) {
      addPermissionsItem(config.permissions[item], item);
    }
  }
}

function getPermissions(config) {
  if (gPermissionsListbox.itemCount > 0) {
    config.permissions = {};
  }
  for (var i=0; i < gPermissionsListbox.itemCount; i++) {
    var permissionsitem = {};
    var listitem = gPermissionsListbox.getItemAtIndex(i);
    var permissionsitem = convertListItemToPermissionsItem(listitem);
    var host = permissionsitem.host;
    delete(permissionsitem.host);
    config.permissions[host] = permissionsitem;
  }
  return config;
}

function resetPermissions() {
  while (gPermissionsListbox.itemCount > 0) {
    gPermissionsListbox.removeItemAt(0);
  }
}

function onAddPermissionsItem() {
  var retVals = { host: null, popup: null, install: null, cookie: null, plugins: null };
  window.openDialog("chrome://cck2wizard/content/permissions-dialog.xul", "cck2wizard-permissions", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  addPermissionsItem(retVals, retVals.host);
}

function addPermissionsItem(permissionsitem, host) {
  for (var i=0; i < gPermissionsListbox.itemCount; i++) {
    var listitem = gPermissionsListbox.getItemAtIndex(i);
    var label = listitem.firstChild.getAttribute("label");
    if (host && label == host) {
      Services.prompt.alert(window, "CCK2", "An entry for " + host + " already exists.")
      return;
    }
  }
  gPermissionsListbox.appendChild(createPermissionsListItem(permissionsitem, host));
}

function createPermissionsListItem(permissionsitem, host) {
  var listitem = document.createElement("listitem");
  listitem.setAttribute("equalsize", "always");
  listitem.setAttribute("tooltiptext", host ? host : permissionsitem.host);
  if (host) {
    listitem.appendChild(createListCell(host));
  } else {
    listitem.appendChild(createListCell(permissionsitem.host));
  }
  listitem.appendChild(createListCell(convertValueToLabel(permissionsitem.popup),
                       permissionsitem.popup));
  listitem.appendChild(createListCell(convertValueToLabel(permissionsitem.install),
                       permissionsitem.install));
  listitem.appendChild(createListCell(convertValueToLabel(permissionsitem.cookie),
                       permissionsitem.cookie));
  listitem.appendChild(createListCell(convertValueToLabel(permissionsitem.plugins),
                       permissionsitem.plugins));
  listitem.setAttribute("context", "permissions-contextmenu");
  return listitem;
}

function updatePermissionsListItem(listitem, permissionsitem) {
  listitem.childNodes[0].setAttribute("label", permissionsitem.host);
  listitem.childNodes[1].setAttribute("label", convertValueToLabel(permissionsitem.popup));
  listitem.childNodes[1].setAttribute("value", permissionsitem.popup);
  listitem.childNodes[2].setAttribute("label", convertValueToLabel(permissionsitem.install));
  listitem.childNodes[2].setAttribute("value", permissionsitem.install);
  listitem.childNodes[3].setAttribute("label", convertValueToLabel(permissionsitem.cookie));
  listitem.childNodes[3].setAttribute("value", permissionsitem.cookie);
  listitem.childNodes[4].setAttribute("label", convertValueToLabel(permissionsitem.plugins));
  listitem.childNodes[4].setAttribute("value", permissionsitem.plugins);
  listitem.setAttribute("tooltiptext", permissionsitem.host);
  return listitem;
}

function convertValueToLabel(value) {
  switch (parseInt(value, 10)) {
    case Services.perms.ALLOW_ACTION:
      return "Allow";
    case Services.perms.DENY_ACTION:
      return "Block";
    case 3:
      return "Remove";
  }
  return "";
}

function onDeletePermissionsItem() {
  if (gPermissionsListbox.selectedIndex == -1) {
    return;
  }
  gPermissionsListbox.removeChild(gPermissionsListbox.selectedItem);
}

function convertListItemToPermissionsItem(listitem) {
  var permissionsitem = {};
  permissionsitem.host = listitem.childNodes[0].getAttribute("label");
  if (listitem.childNodes[1].hasAttribute("value")) {
    permissionsitem.popup = parseInt(listitem.childNodes[1].getAttribute("value"), 10);
  }
  if (listitem.childNodes[2].hasAttribute("value")) {
    permissionsitem.install = parseInt(listitem.childNodes[2].getAttribute("value"), 10);
  }
  if (listitem.childNodes[3].hasAttribute("value")) {
    permissionsitem.cookie = parseInt(listitem.childNodes[3].getAttribute("value"), 10);
  }
  if (listitem.childNodes[4].hasAttribute("value")) {
    permissionsitem.plugins = parseInt(listitem.childNodes[4].getAttribute("value"), 10);
  }
  return permissionsitem;
}

function onEditPermissionsItem() {
  if (gPermissionsListbox.selectedIndex == -1) {
    return;
  }
  var retVals = convertListItemToPermissionsItem(gPermissionsListbox.selectedItem);
  window.openDialog("chrome://cck2wizard/content/permissions-dialog.xul", "cck2wizard-permissions", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  updatePermissionsListItem(gPermissionsListbox.selectedItem, retVals);
}

function checkToEnableOKButton() {
  
}

function onKeyPressPermissions(event) {
  if (event.keyCode == event.DOM_VK_ENTER ||
      event.keyCode == event.DOM_VK_RETURN) {
    onEditPermissionsItem();
  } else if (event.keyCode == event.DOM_VK_DELETE ||
             event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeletePermissionsItem();
  }
}