Components.utils.import("resource://gre/modules/Services.jsm");

(function () {
  var temp = {};
  Components.utils.import("resource://cck2/Preferences.jsm", temp);
  var Preferences = temp.Preferences;
  let scope = {};
  Services.scriptloader.loadSubScript("chrome://cck2/content/util.js", scope);
  let {E, hide, disable, errorCritical} = scope;

  function paneload(event) {
    if (event.target.id == "panePrivacy" &&
	!Preferences.get("browser.privatebrowsing.enabled", true)) {
      hide(E("privateBrowsingAutoStart"));
      var privateBrowsingMenu = document.querySelector("menuitem[value='dontremember']");
      hide(privateBrowsingMenu);
    }
    if (event.target.id == "paneAdvanced" &&
	Preferences.locked("toolkit.crashreporter.enabled", false)) {
      disable(E("submitCrashesBox"));
    }
    if (event.target.id == "paneAdvanced" &&
	Preferences.locked("datareporting.healthreport.uploadEnabled", false)) {
      disable(E("submitHealthReportBox"));
    }
  }

  function startup()
  {
    try {
      window.removeEventListener("load", startup, false);
      if (Preferences.get("services.sync.enabled", true))
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
