const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
var gAustralis = false;
try {
  Cu.import("resource://app/modules/CustomizableUI.jsm");
  gAustralis = true;
} catch (e) {}

const XMLHttpRequest = Components.Constructor("@mozilla.org/xmlextras/xmlhttprequest;1");

XPCOMUtils.defineLazyGetter(this, "sss", function () {
  return Cc["@mozilla.org/content/style-sheet-service;1"]
           .getService(Ci.nsIStyleSheetService);
});

var prefsPrefix = "extensions.cck2wizard.";
var idPrefix = "cck2wizard-";

function showInstallPanel(doc, callback) {
  var panel = doc.getElementById(idPrefix + "install-panel");
  if (panel) {
    callback(panel);
    return;
  }
  var panel = doc.createElement("panel");
  panel.setAttribute("id", idPrefix + "login-panel");
  panel.setAttribute("width", "300");
  panel.setAttribute("orient", "vertical");
  panel.setAttribute("type", "arrow");
  var popupset = doc.getElementById("mainPopupSet");
  popupset.appendChild(panel);
  var request = new XMLHttpRequest();
  request.mozBackgroundRequest = true;
  request.open("GET", "chrome://cck2wizard/content/install-panel.xul");
  request.onload = function() {
    var installDialog = doc.importNode(request.responseXML.documentElement, true);
    panel.appendChild(installDialog);
    callback(panel);
  };
  request.send();

}

function install(aData, aReason) {
  Services.prefs.setCharPref(prefsPrefix + "toolbarID", "nav-bar");
}

function uninstall(aData, aReason) {
  Services.prefs.clearUserPref(prefsPrefix + "toolbarID");
  Services.prefs.clearUserPref(prefsPrefix + "nextSiblingID");
  // CCK2 configs are NOT removed
}

function startup(aData, aReason) {
  sss.loadAndRegisterSheet(Services.io.newURI("chrome://cck2wizard/skin/toolbar.css", null, null), sss.USER_SHEET);
  var win = Services.wm.getMostRecentWindow("navigator:browser");
  var url;
  switch (aReason) {
    case 5: // ADDON_INSTALL
      showInstallPanel(win.document, function(panel) {
        panel.addEventListener("click", function(event) {
          win.document.getElementById(idPrefix + "button").click();
          win.document.getElementById(idPrefix + "install-panel").hidePopup();
        }, false);
        panel.openPopup(win.document.getElementById(idPrefix + "button"), "", 0, 0, false, false, null);
      });
      url = "http://mike.kaply.com/addons/cck2/install/";
      break;
    case 7: // ADDON_UPGRADE
      url = "http://mike.kaply.com/addons/cck2/upgrade/";
      break;
  }
  if (url) {
    win.openUILinkIn(url, "tab");
  }

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
  sss.unregisterSheet(Services.io.newURI("chrome://cck2wizard/skin/toolbar.css", null, null), sss.USER_SHEET);
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
  var buttonPlacement = null;
  if (gAustralis) {
    buttonPlacement = CustomizableUI.getPlacementOfWidget(idPrefix + "button");
  }
  if (!button || (gAustralis && !buttonPlacement)) {
    Services.prefs.clearUserPref(prefsPrefix + "toolbarID");
    Services.prefs.clearUserPref(prefsPrefix + "nextSiblingID");
    return;
  }
  if (buttonPlacement) {
    Services.prefs.setCharPref(prefsPrefix + "toolbarID", buttonPlacement.area);
  } else {
    Services.prefs.setCharPref(prefsPrefix + "toolbarID", button.parentNode.id);
  }
  Services.prefs.setCharPref(prefsPrefix + "nextSiblingID", button.nextSibling.id);
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
    button.setAttribute("class", "toolbarbutton-1");
    toolbox.palette.appendChild(button);
    if (Services.prefs.prefHasUserValue(prefsPrefix + "toolbarID")) {
      var toolbarID = Services.prefs.getCharPref(prefsPrefix + "toolbarID");
      var nextSibling = null;
      try {
        nextSibling = doc.getElementById(Services.prefs.getCharPref(prefsPrefix + "nextSiblingID"));
      } catch (ex) {}
      if (gAustralis) {
        var buttonPlacement = null;
        if (nextSibling) {
          buttonPlacement = CustomizableUI.getPlacementOfWidget(nextSibling.id);
        }
        if (!nextSibling || !buttonPlacement) {
          CustomizableUI.addWidgetToArea(idPrefix + "button", toolbarID);
        } else {
          CustomizableUI.addWidgetToArea(idPrefix + "button",  toolbarID, buttonPlacement.position);
         
        }
      } else {
        var toolbar = doc.getElementById(toolbarID);
        var nextSibling = null;
        try {
          nextSibling = doc.getElementById(Services.prefs.getCharPref(prefsPrefix + "nextSiblingID"));
        } catch (ex) {}
        toolbar.insertItem(idPrefix + "button", nextSibling);
      }
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
  if (button) {
    button.parentNode.removeChild(button);
  } else {
    var toolbox = doc.getElementById("navigator-toolbox");
    if (toolbox && toolbox.palette) {
      var element = toolbox.palette.querySelector("#" + buttonID);
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
  }
  let panel = doc.getElementById(idPrefix + "install-panel");
  if (panel) {
    panel.parentNode.removeChild(panel);
  }

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
