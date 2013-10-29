Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://cck2/CCK2.jsm");

(function () {
  var temp = {};
  Components.utils.import("resource://cck2/Preferences.jsm", temp);
  var Preferences = temp.Preferences;
  let scope = {};
  Services.scriptloader.loadSubScript("chrome://cck2/content/util.js", scope);
  let {E, hide, errorCritical} = scope;

  function startup()
  {
    try {
      window.removeEventListener("load", startup, false);
      var config = CCK2.getConfig();
      if (config && "extension" in config && config.extension.hide) {
	window.addEventListener("ViewChanged", function() {
	  var richlistitem = document.querySelector("richlistitem[value='" + config.extension.id + "']");
	  if (richlistitem)
	    richlistitem.hidden = true;
	} , false)
      }
      var showDiscoverPane = Preferences.get("extensions.getAddons.showPane", true);
      var xpinstallEnabled = Preferences.get("xpinstall.enabled", true);
      if (!showDiscoverPane || !xpinstallEnabled) {
	hide(gCategories.get("addons://discover/"));
	hide(E("#search-list-empty button"));
	hide(E("#addon-list-empty button"));
	if (E("view-port") && E("view-port").selectedIndex == 0)
	  gViewController.loadView("addons://list/extension");
      }
      if (!xpinstallEnabled) {
	hide(E("search-filter-remote"));
	if (E("search-filter-radiogroup"))
	  E("search-filter-radiogroup").selectedIndex = 0; // Search in local addons
	hide(E("utils-installFromFile-separator"));
	hide(E("utils-installFromFile"));
      }
    } catch (e) {
      errorCritical(e);
    }
  }

  function shutdown()
  {
    window.removeEventListener("unload", shutdown, false);
  }

  window.addEventListener("load", startup, false);
  window.addEventListener("unload", shutdown, false);
})();
