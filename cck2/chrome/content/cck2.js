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
      if (!doc.location) {
        return;
      }
      /* Remove the sync button from about:home */
      if ((config && config.disableSync) &&
         /^about:home/.test(doc.location.href)) {
        remove(E("sync", doc));
      }
      /* Remove the addons button from about:home */
      if ((config && config.disableAddonsManager) &&
         /^about:home/.test(doc.location.href)) {
        remove(E("addons", doc));
      }
      /* Remove the addons button from about:home */
      if ((config && config.removeSnippets) &&
         /^about:home/.test(doc.location.href)) {
        remove(E("snippets", doc));
      }
      /* Remove the reset button from about:support */
      if ((config && config.disableResetFirefox) &&
         /^about:support/.test(doc.location.href)) {
        remove(E("reset-box", doc));
      }

      /* If health reporter upload is locked, remove the activation widget */
      if (Preferences.locked("datareporting.healthreport.uploadEnabled", false)) {
        if (/^https:\/\/fhr.cdn.mozilla.net\//.test(doc.location.href)) {
          var activationWidget = event.target.querySelector(".activationWidget");
          if (activationWidget) {
            remove(activationWidget);
          }
        }
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
    var devtoolsKeyset = document.getElementById("devtoolsKeyset");
    for (var i = 0; i < devtoolsKeyset.childNodes.length; i++) {
      devtoolsKeyset.childNodes[i].removeAttribute("command");
    }
    try {
      document.getElementById("Tools:ResponsiveUI").removeAttribute("oncommand");
    } catch (e) {}
    try {
      document.getElementById("Tools:Scratchpad").removeAttribute("oncommand");
    } catch (e) {}
    try {
      document.getElementById("Tools:BrowserConsole").removeAttribute("oncommand");
    } catch (e) {}
    try {
      document.getElementById("Tools:BrowserToolbox").removeAttribute("oncommand");
    } catch (e) {}
    try {
      document.getElementById("Tools:DevAppsMgr").removeAttribute("oncommand");
    } catch (e) {}
    try {
      document.getElementById("Tools:DevToolbar").removeAttribute("oncommand");
    } catch (e) {}
    try {
      document.getElementById("Tools:DevToolbox").removeAttribute("oncommand");
    } catch (e) {}
    try {
      document.getElementById("Tools:DevToolbarFocus").removeAttribute("oncommand");
    } catch (e) {}
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

      config = CCK2.getConfig();
      if (!config)
        return;

      if (config.disablePrivateBrowsing &&
          PrivateBrowsingUtils.isWindowPrivate(window)) {
        window.setTimeout(function() {
          Services.prompt.alert(window, "Private Browsing", "Private Browsing has been disabled by your administrator");
          window.close();
        }, 0, false);
      }
      if (config.disablePrivateBrowsing) {
        disablePrivateBrowsing();
      }
      if (config.disableSync) {
        disableSync();
      }
      E("appcontent").addEventListener("DOMContentLoaded", onPageLoad, false);
  
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
      if (config.removeSafeModeMenu) {
        hide(E("helpSafeMode"));
        try {
          hide(E("appmenu_safeMode"));
        } catch (e) {}
      }
      if (config.titlemodifier) {
        document.getElementById("main-window").setAttribute("titlemodifier", config.titlemodifier);
      }
      if (config.removeSetDesktopBackground) {
        // Because this is on a context menu, we can't use "hidden"
        if (E("context-setDesktopBackground"))
          E("context-setDesktopBackground").setAttribute("style", "display: none;");
        }
      if (config.hiddenUI) {
        for (var i=0; i < config.hiddenUI.length; i++) {
          var uiElement = document.querySelector(config.hiddenUI[i]);
          if (!uiElement)
            continue;
          hide(uiElement);
          if (uiElement.nodeName == "menuitem") {
            uiElement.removeAttribute("key");
            uiElement.removeAttribute("oncommand");
            if (uiElement.hasAttribute("command")) {
              var commandId = uiElement.getAttribute("command");
              uiElement.removeAttribute("command");
              var command = document.getElementById(commandId);
              command.removeAttribute("oncommand");
              var keys = document.querySelectorAll("key[command='" + commandId + "']")
              for (var i=0; i < keys.length; i++) {
                keys[i].removeAttribute("command");
              }
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
          menuitem.addEventListener("command", function(event) {
            openUILink(this.getAttribute("url"), event, false, true);
          })
          menuitem.addEventListener("click", function(event) {
            checkForMiddleClick(this, event);
          }, false);
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
          menuitem.addEventListener("command", function(event) {
            openUILink(this.getAttribute("url"), event, false, true);
          })
          menuitem.addEventListener("click", function(event) {
            checkForMiddleClick(this, event);
          }, false);
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
