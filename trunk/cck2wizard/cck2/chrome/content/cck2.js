Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
Components.utils.import("resource://cck2/CCK2.jsm");  

(function () {
  var temp = {};
  Cu.import("resource://cck2/Preferences.jsm", temp);
  var Preferences = temp.Preferences;
  let scope = {};
  Services.scriptloader.loadSubScript("chrome://cck2/content/util.js", scope);
  let {E, hide, remove, disable, errorCritical} = scope;

  var config;

  function onPageLoad(event) {
    try {
      var doc = event.target;
      var win = doc.defaultView;
      // ignore frame loads
      if (win != win.top) {
	return;
      }
      if (!doc.location || (!/^about:/.test(doc.location.href) && !/^chrome:/.test(doc.location.href))) {
	return;
      }
      /* If chrome://browser/content/preferences/in-content/preferences.xul is loaded explicitly,
	just make it blank */
      if (/^chrome:\/\/browser\/content\/preferences\/in-content\/preferences\.xul/.test(doc.location.href)) {
	doc.documentElement.innerHTML = "";
      }

      /* If chrome://global/content/aboutTelemetry.xhtml is loaded explicitly,
	just make it blank */
      if ((config && config.disableTelemetry) &&
	  /^chrome:\/\/global\/content\/aboutTelemetry.xhtml/.test(doc.location.href)) {
	doc.documentElement.innerHTML = "";
      }
      /* If chrome://global/content/config.xul is loaded explicitly,
	just make it blank */
      if ((config && config.disableAboutConfig) &&
	  /^chrome:\/\/global\/content\/config.xul/.test(doc.location.href)) {
	doc.documentElement.innerHTML = "";
      }
      /* If chrome://browser/content/aboutPrivateBrowsing.xhtml is loaded explicitly,
	just make it blank */
      if (!Preferences.get("browser.privatebrowsing.enabled", true) &&
	  /^chrome:\/\/browser\/content\/aboutPrivateBrowsing.xhtml/.test(doc.location.href)) {
	doc.documentElement.innerHTML = "";
      }
      /* If chrome://mozapps/content/extensions/extensions.xul is loaded explicitly,
	just make it blank */
      if ((config && config.disableAddonsManager) &&
	  /^chrome:\/\/mozapps\/content\/extensions\/extensions.xul/.test(doc.location.href)) {
	doc.documentElement.innerHTML = "";
      }
      /* Remove the sync button from about:home */
      if (!Preferences.get("services.sync.enabled", true) &&
	 (/^about:home/.test(doc.location.href) ||
	  /^chrome:\/\/browser\/content\/abouthome\/aboutHome.xhtml/.test(doc.location.href))) {
	remove(E("sync", doc));
      }
      /* Remove the addons button from about:home */
      if ((config && config.disableAddonsManager) &&
         (/^about:home/.test(doc.location.href) ||
          /^chrome:\/\/browser\/content\/abouthome\/aboutHome.xhtml/.test(doc.location.href))) {
        remove(E("addons", doc));
      }

      /* If health reporter upload is locked, remove the activation widget */
      if (Preferences.locked("datareporting.healthreport.uploadEnabled", false) &&
	 (/^about:healthreport/.test(doc.location.href) ||
	  /^https:\/\/fhr.cdn.mozilla.net\//.test(doc.location.href))) {
	var remoteReport = doc.getElementById("remote-report");
	remoteReport.addEventListener("load", function(event) {
	  var activationWidget = event.target.contentDocument.querySelector(".activationWidget");
	  if (activationWidget) {
	    remove(activationWidget);
	    event.target.removeEventListener("load", arguments.callee, false);
	  }
	}, false);
      }
    } catch (e) {
      errorCritical(e);
    }
  }

  function disableSync() {
    window.XULBrowserWindow.inContentWhitelist =
      window.XULBrowserWindow.inContentWhitelist.filter(function(element) {
	return element != "about:sync-progress";
      })
    var mySyncUI = {
      init: function() {
	return;
      },
      initUI: function() {
	return;
      },
      updateUI: function() {
	hide(E("sync-setup-state"));
	hide(E("sync-syncnow-state"));
      }
    }
    gSyncUI = mySyncUI;
    remove(E("sync-button"));
  }

  function disablePrivateBrowsing() {
    disable(E("Tools:PrivateBrowsing"));
    hide(E("menu_newPrivateWindow"));
    // Because this is on a context menu, we can't use "hidden"
    if (E("context-openlinkprivate"))
      E("context-openlinkprivate").setAttribute("style", "display: none;");
    hide(E("appmenu_privateBrowsing"));
    hide(E("appmenu_newPrivateWindow"));
    hide(E("privateBrowsingItem"));
  }

  function disableAddonsManager() {
    window.XULBrowserWindow.inContentWhitelist =
      window.XULBrowserWindow.inContentWhitelist.filter(function(element) {
	return element != "about:addons";
      })
    hide(E("appmenu_addons"));
    hide(E("menu_openAddons"));
    disable(E("Tools:Addons"));
  }

  function removeDeveloperTools() {
    hide(E("webDeveloperMenu"));
    document.getElementById("Tools:webconsole").removeAttribute("oncommand");
    document.getElementById("Tools:timeline").removeAttribute("oncommand");
  }

  function disableErrorConsole() {
    document.getElementById("Tools:ErrorConsole").removeAttribute("oncommand");
  }

  function startup()
  {
    try {
      window.removeEventListener("load", startup, false);
      window.XULBrowserWindow.inContentWhitelist =
        window.XULBrowserWindow.inContentWhitelist.filter(function(element) {
          return element != "about:preferences";
        })

      if (!Preferences.get("browser.privatebrowsing.enabled", true) &&
	  PrivateBrowsingUtils.isWindowPrivate(window)) {
	window.setTimeout(function() {
	  Services.prompt.alert(window, "Private Browsing", "Private Browsing has been disabled by your administrator");
  	window.close();
	}, 0, false);
      }
      if (!Preferences.get("browser.privatebrowsing.enabled", true)) {
	disablePrivateBrowsing();
      }
      if (!Preferences.get("services.sync.enabled", true)) {
	disableSync();
      }
      var appcontent = E("appcontent");
      if (appcontent) {
	 appcontent.addEventListener("DOMContentLoaded", onPageLoad, false);
      }
  
      config = CCK2.getConfig();
      if (!config)
        return;
      if (config.disableAddonsManager) {
	disableAddonsManager();
      }
      if (config.removeDeveloperTools) {
        Services.tm.mainThread.dispatch(function() {
	  removeDeveloperTools();
        }, Ci.nsIThread.DISPATCH_NORMAL);
      }
      if (config.disableErrorConsole) {
	disableErrorConsole();
      }
      if (config.titlemodifier) {
	document.getElementById("main-window").setAttribute("titlemodifier", config.titlemodifier);
      }
      if (config.removeSetDesktopBackground) {
	// Because this is on a context menu, we can't use "hidden"
	if (E("context-setDesktopBackground"))
	  E("context-setDesktopBackground").setAttribute("style", "display: none;");
      }
      if (config.hideMenus) {
	for (var i=0; i < config.hideMenus.length; i++) {
	  var menu = document.querySelector(config.hideMenus[i]);
	  if (!menu)
	    continue;
	  hide(menu);
	  menu.removeAttribute("key");
	  menu.removeAttribute("oncommand");
	  if (menu.hasAttribute("command")) {
	    var commandId = menu.getAttribute("command");
	    menu.removeAttribute("command");
	    var command = document.getElementById(commandId);
	    command.removeAttribute("oncommand");
	    var keys = document.querySelectorAll("key[command='" + commandId + "']")
	    for (var i=0; i < keys.length; i++) {
	      keys[i].removeAttribute("command");
	    }
	  }
	}
      }
      if (config.helpMenu) {
	// We need to run this function on a delay, because we won't know
	// if the about menu is hidden for mac until after it is run.
        Services.tm.mainThread.dispatch(function() {
	  var helpMenuPopup = document.getElementById("menu_HelpPopup");
	  var menuitem = document.createElement("menuitem");
	  menuitem.setAttribute("label", config.helpMenu.label);
	  menuitem.setAttribute("url", config.helpMenu.url);
	  menuitem.setAttribute("accesskey", config.helpMenu.accesskey);
	  menuitem.setAttribute("oncommand", "openUILink(this.getAttribute('url'), event, false, true)")
	  menuitem.setAttribute("onclick", "checkForMiddleClick(this, event);");
	  if (E("aboutName").hidden) {
	    // Mac
	    helpMenuPopup.appendChild(menuitem);
	  } else {
	    helpMenuPopup.insertBefore(menuitem, E("aboutName"));
	    helpMenuPopup.insertBefore(document.createElement("menuseparator"),
					      E("aboutName"));
	  }
        }, Ci.nsIThread.DISPATCH_NORMAL);
	var appMenuHelpMenuPopup = document.getElementById("appmenu_helpMenupopup");
	if (appMenuHelpMenuPopup) {
	  var menuitem = document.createElement("menuitem");
	  menuitem.setAttribute("label", config.helpMenu.label);
	  menuitem.setAttribute("url", config.helpMenu.url);
	  menuitem.setAttribute("oncommand", "openUILink(this.getAttribute('url'), event, false, true)")
	  menuitem.setAttribute("onclick", "checkForMiddleClick(this, event);");
	  appMenuHelpMenuPopup.insertBefore(menuitem, E("appmenu_about"));
	  appMenuHelpMenuPopup.insertBefore(document.createElement("menuseparator"),
					    E("appmenu_about"));
	}
      }
      if (CCK2.firstrun) {
	if (config.displayBookmarksToolbar || (config.bookmarks && config.bookmarks.toolbar)) {
	  E("PersonalToolbar").collapsed = false;
	  E("PersonalToolbar").setAttribute("collapsed", "false");
	  document.persist("PersonalToolbar", "collapsed");
	}
	if (config.displayMenuBar) {
	  if (typeof updateAppButtonDisplay != "undefined") {
	    E("toolbar-menubar").setAttribute("autohide", "false");
	    document.persist("toolbar-menubar", "autohide")
	    updateAppButtonDisplay();
	  }
	}
	CCK2.firstrun = false;
      }
    } catch (e) {
      errorCritical(e);
    }
  }

  function shutdown()
  {
    window.removeEventListener("unload", shutdown, false);
    var appcontent = E("appcontent");
    if (appcontent) {
       appcontent.removeEventListener("DOMContentLoaded", onPageLoad, false);
    }
  }

  window.addEventListener("load", startup, false);
  window.addEventListener("unload", shutdown, false);
})();
