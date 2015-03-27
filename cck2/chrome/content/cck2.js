Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
Components.utils.import("resource://cck2/CCK2.jsm");
var gAustralis = false;
try {
  Components.utils.import("resource:///modules/CustomizableUI.jsm");
  gAustralis = true;
} catch(e) {}

(function () {
  var temp = {};
  Cu.import("resource://cck2/Preferences.jsm", temp);
  var Preferences = temp.Preferences;
  let scope = {};
  Services.scriptloader.loadSubScript("chrome://cck2/content/util.js", scope);
  let {E, hide, remove, disable, errorCritical} = scope;

  var config;

  function disableSync() {
    window.XULBrowserWindow.inContentWhitelist =
      window.XULBrowserWindow.inContentWhitelist.filter(function(element) {
        return element != "about:sync-progress";
      })
    if (gSyncUI) {
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
          hide(E("sync-setup"));
          hide(E("sync-syncnowitem"));
        }
      }
      gSyncUI = mySyncUI;
    }
    if (gAustralis) {
      CustomizableUI.destroyWidget("sync-button");
      CustomizableUI.removeWidgetFromArea("sync-button");
    }
    var toolbox = document.getElementById("navigator-toolbox");
    if (toolbox && toolbox.palette) {
      element = toolbox.palette.querySelector("#sync-button");
      if (element) {
        element.parentNode.removeChild(element);
      }
    }
    hide(E("sync-setup-state"));
    hide(E("sync-syncnow-state"));
    hide(E("sync-setup"));
    hide(E("sync-syncnowitem"));
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
    if (gAustralis) {
      CustomizableUI.destroyWidget("privatebrowsing-button")
    }
  }

  function disableAddonsManager() {
    window.XULBrowserWindow.inContentWhitelist =
      window.XULBrowserWindow.inContentWhitelist.filter(function(element) {
        return element != "about:addons";
      })
    hide(E("appmenu_addons"));
    hide(E("menu_openAddons"));
    disable(E("Tools:Addons"));
    if (gAustralis) {
      CustomizableUI.destroyWidget("add-ons-button")
    }
  }
  
  function removeDeveloperTools() {
    hide(E("developer-button"));
    hide(E("webDeveloperMenu"));
    // Need to delay this because devtools is created dynamically
    window.setTimeout(function() {
      var devtoolsKeyset = document.getElementById("devtoolsKeyset");
      if (devtoolsKeyset) {
        for (var i = 0; i < devtoolsKeyset.childNodes.length; i++) {
          devtoolsKeyset.childNodes[i].removeAttribute("command");
        }
      }
    }, 0);
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
    if (gAustralis) {
      CustomizableUI.destroyWidget("developer-button")
    }
  }

  function disableErrorConsole() {
    document.getElementById("Tools:ErrorConsole").removeAttribute("oncommand");
  }

  function onPanelShowing(event) {
    hide(E("PanelUI-fxa-status"));

  }

  function startup()
  {
    try {
      window.removeEventListener("load", startup, false);
      // Replace setReportPhishingMenu so we can catch errors
      var origSetReportPhishingMenu = gSafeBrowsing.setReportPhishingMenu;
      gSafeBrowsing.setReportPhishingMenu = function() {
        try {
          origSetReportPhishingMenu();
        } catch (e) {}
      }
      window.XULBrowserWindow.inContentWhitelist =
        window.XULBrowserWindow.inContentWhitelist.filter(function(element) {
          return element != "about:preferences";
        })

      var configs = CCK2.getConfigs();
      for (var id in configs) {
        config = configs[id];
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
        if (config.disableFirefoxHealthReport) {
          var healthReportMenu = document.getElementById("healthReport");
          if (healthReportMenu) {
            healthReportMenu.parentNode.removeChild(healthReportMenu);
          }
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
            var uiElements = document.querySelectorAll(config.hiddenUI[i]);
            // Don't use .hidden since it doesn't work sometimes
            var style = document.getElementById("cck2-hidden-style");
            if (!style) {
              style = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
              style.setAttribute("id", "cck2-hidden-style");
              style.setAttribute("type", "text/css");
              document.getElementById("main-window").appendChild(style);
            }
            style.textContent = style.textContent + config.hiddenUI[i] + "{display: none !important;}";
            if (!uiElements || uiElements.length == 0) {
              continue;
            }
            for (var j=0; j < uiElements.length; j++) {
              var uiElement = uiElements[j];
              if (uiElement.nodeName == "menuitem") {
                uiElement.removeAttribute("key");
                uiElement.removeAttribute("oncommand");
                if (uiElement.hasAttribute("command")) {
                  var commandId = uiElement.getAttribute("command");
                  uiElement.removeAttribute("command");
                  var command = document.getElementById(commandId);
                  command.removeAttribute("oncommand");
                  var keys = document.querySelectorAll("key[command='" + commandId + "']")
                  for (var k=0; k < keys.length; k++) {
                    keys[k].removeAttribute("command");
                  }
                }
              }
              // Horrible hack to work around the crappy Australis help menu
              // Items on the menu always show up in the Australis menu, so we have to remove them.
              if (uiElements[j].parentNode.id == "menu_HelpPopup") {
                uiElements[j].parentNode.removeChild(uiElements[j]);
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
            if ("accesskey" in config.helpMenu) {
              menuitem.setAttribute("accesskey", config.helpMenu.accesskey);
            }
            menuitem.setAttribute("oncommand", "openUILink('" + config.helpMenu.url + "');");
            menuitem.setAttribute("onclick", "checkForMiddleClick(this, event);");
            if (!E("aboutName") || E("aboutName").hidden) {
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
        if (config.firstrun || config.upgrade) {
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
            if (gAustralis) {
              CustomizableUI.setToolbarVisibility("toolbar-menubar", "true");
            }

          }
          config.firstrun = false;
          config.upgrade = false;
        }
      }
      var panelUIPopup = document.getElementById("PanelUI-popup");
      if (panelUIPopup) {
        document.getElementById("PanelUI-popup").addEventListener("popupshowing", onPanelShowing, false);
      }
    } catch (e) {
      errorCritical(e);
    }
  }

  function shutdown()
  {
    window.removeEventListener("unload", shutdown, false);
    var panelUIPopup = document.getElementById("PanelUI-popup");
    if (panelUIPopup) {
      document.getElementById("PanelUI-popup").removeEventListener("popupshowing", onPanelShowing, false);
    }
  }

  window.addEventListener("load", startup, false);
  window.addEventListener("unload", shutdown, false);
})();
