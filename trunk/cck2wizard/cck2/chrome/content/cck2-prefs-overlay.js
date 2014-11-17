Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://cck2/CCK2.jsm");

(function () {
  var temp = {};
  Components.utils.import("resource://cck2/Preferences.jsm", temp);
  var Preferences = temp.Preferences;
  let scope = {};
  Services.scriptloader.loadSubScript("chrome://cck2/content/util.js", scope);
  let {E, hide, disable, errorCritical} = scope;

  function paneload(event) {
    var configs = CCK2.getConfigs();
    for (var id in configs) {
      config = configs[id];
      if (config.hiddenUI) {
        for (var i=0; i < config.hiddenUI.length; i++) {
          var uiElement = document.querySelector(config.hiddenUI[i]);
          if (!uiElement)
            continue;
          hide(uiElement);
        }
      }
      if (event.target.id == "panePrivacy" &&
        config.disablePrivateBrowsing) {
        hide(E("privateBrowsingAutoStart"));
        var privateBrowsingMenu = document.querySelector("menuitem[value='dontremember']");
        hide(privateBrowsingMenu);
      }
      if (event.target.id == "paneAdvanced" &&
        config.disableCrashReporter) {
        disable(E("submitCrashesBox"));
      }
      if (event.target.id == "paneAdvanced" &&
        Preferences.locked("datareporting.healthreport.uploadEnabled", false)) {
        disable(E("submitHealthReportBox"));
      }
      if (event.target.id == "paneSecurity" &&
        config.noMasterPassword == true) {
        hide(E("useMasterPassword"));
        hide(E("changeMasterPassword"));
      }
    }
  }

  function startup()
  {
    try {
      window.removeEventListener("load", startup, false);
      if (!config.disableSync)
        return;
      var prefWindow = E("BrowserPreferences");
      var paneSyncRadio = document.getAnonymousElementByAttribute(prefWindow, "pane", "paneSync");
      hide(paneSyncRadio);
      var paneDeck = document.getAnonymousElementByAttribute(prefWindow, "anonid", "paneDeck");
      var paneSync = E("paneSync");
      paneSync.removeAttribute("helpTopic");
      var weavePrefsDeck = E("weavePrefsDeck");
      if (weavePrefsDeck)
        weavePrefsDeck.parentNode.removeChild(weavePrefsDeck);
      if (prefWindow.currentPane == E("paneSync"))
        prefWindow.showPane(E("paneMain"));
    } catch (e) {
      errorCritical(e);
    }
  }

  function shutdown()
  {
    window.removeEventListener("unload", shutdown, false);
    window.removeEventListener("paneload", paneload, false);
  }

  window.addEventListener("load", startup, false);
  window.addEventListener("unload", shutdown, false);
  window.addEventListener("paneload", paneload, false);
})();
