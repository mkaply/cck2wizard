const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyGetter(this, "sss", function () {
  return Cc["@mozilla.org/content/style-sheet-service;1"]
           .getService(Ci.nsIStyleSheetService);
});

var prefsPrefix = "extensions.cck2wizard.";
var idPrefix = "cck2wizard-";

function install(aData, aReason) {
  Services.prefs.setCharPref(prefsPrefix + "toolbarID", "nav-bar");
  var win = Services.wm.getMostRecentWindow("navigator:browser");
  if (win) {
    win.openUILinkIn("LANDINGPAGEFORCCK", "tab");
  }
}

function uninstall(aData, aReason) {
  Services.prefs.clearUserPref(prefsPrefix + "toolbarID");
  Services.prefs.clearUserPref(prefsPrefix + "nextSiblingID");
}

function startup(data, reason) {
  sss.loadAndRegisterSheet(Services.io.newURI("chrome://cck2wizard/skin/cck2wizard.css", null, null), sss.AUTHOR_SHEET);
  let enumerator = Services.wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    if (win.document.readyState === "complete")
      loadIntoWindow(win);
    else
      win.addEventListener("load", function() {
        win.removeEventListener("load", arguments.callee, false);
        loadIntoWindow(win);
      })
  }
  Services.wm.addListener(windowListener);
}

function shutdown(data, reason) {
  sss.unregisterSheet(Services.io.newURI("chrome://cck2wizard/skin/cck2wizard.css", null, null), sss.AUTHOR_SHEET);
  Services.wm.removeListener(windowListener);

  let enumerator = Services.wm.getEnumerator("navigator:browser");
  while (enumerator.hasMoreElements()) {
    let win = enumerator.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(win);
  }
}

/* Save the current toolbarbutton position in preferences
*/
function saveButtonPosition(event) {
  var button = event.target.ownerDocument.getElementById(idPrefix + "button");
  if (button) {
    Services.prefs.setCharPref(prefsPrefix + "toolbarID", button.parentNode.id);
    Services.prefs.setCharPref(prefsPrefix + "nextSiblingID", button.nextSibling.id);
  } else {
    Services.prefs.clearUserPref(prefsPrefix + "toolbarID");
    Services.prefs.clearUserPref(prefsPrefix + "nextSiblingID");
  }
}

function onCommand(event) {
  if (event.target.id != idPrefix + "button")
    return;
  var win = Services.ww.getWindowByName("cck2wizard", null);
  if (win) {
    win.focus();
    return;
  }
  Services.ww.openWindow(null, "chrome://cck2wizard/content/cck2wizard.xul", "cck2wizard", "chrome=yes,resizable=yes,dialog,centerscreen", null);
}

function loadIntoWindow(window) {
  if (!window || window.document.documentElement.getAttribute("windowtype") != "navigator:browser")
    return;

  let doc = window.document;
  let toolbox = doc.getElementById("navigator-toolbox");
  if (toolbox) {
    let button = doc.createElement("toolbarbutton");
    button.setAttribute("id", idPrefix + "button");
    button.setAttribute("label", "CCK2 Wizard");
    button.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
    toolbox.palette.appendChild(button);
    if (Services.prefs.prefHasUserValue(prefsPrefix + "toolbarID")) {
      var toolbar = doc.getElementById(Services.prefs.getCharPref(prefsPrefix + "toolbarID"));
      var nextSibling = null;
      try {
        nextSibling = doc.getElementById(Services.prefs.getCharPref(prefsPrefix + "nextSiblingID"));
      } catch (ex) {}
      toolbar.insertItem(idPrefix + "button", nextSibling);
    }
    window.addEventListener("aftercustomization", saveButtonPosition, false);
    window.addEventListener("command", onCommand, false);
  }
}

function unloadFromWindow(window) {
  var doc = window.document;
  if (!window || doc.documentElement.getAttribute("windowtype") != "navigator:browser")
    return;
  let button = doc.getElementById(idPrefix + "button");
  if (button)
    button.parentNode.removeChild(button);
  // TODO REMOVE FRMO PALETTE
  window.removeEventListener("aftercustomization", saveButtonPosition, false);
  window.removeEventListener("command", onCommand, false);
}

var windowListener = {
  onOpenWindow: function(window) {
    let domWindow = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  onCloseWindow: function(window) {
    let domWindow = window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  },
  onWindowTitleChange: function(window) {}
};
