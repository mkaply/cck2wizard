const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

var EXPORTED_SYMBOLS = ["CCK2"];

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
try {
  Cu.import("resource://gre/modules/Timer.jsm");  
} catch (ex) {
  Cu.import("resource://cck2/Timer.jsm");  
}
Cu.import("resource://cck2/Preferences.jsm");

XPCOMUtils.defineLazyServiceGetter(this, "bmsvc",
    "@mozilla.org/browser/nav-bookmarks-service;1", "nsINavBookmarksService");
XPCOMUtils.defineLazyServiceGetter(this, "annos",
    "@mozilla.org/browser/annotation-service;1", "nsIAnnotationService");
XPCOMUtils.defineLazyServiceGetter(this, "certdb",
    "@mozilla.org/security/x509certdb;1", "nsIX509CertDB");
XPCOMUtils.defineLazyServiceGetter(this, "certdb2",
    "@mozilla.org/security/x509certdb;1", "nsIX509CertDB2");
XPCOMUtils.defineLazyServiceGetter(this, "override",
    "@mozilla.org/security/certoverride;1", "nsICertOverrideService");
XPCOMUtils.defineLazyServiceGetter(this, "uuid",
    "@mozilla.org/uuid-generator;1", "nsIUUIDGenerator");

function alert(string) {
  Services.prompt.alert(Services.wm.getMostRecentWindow("navigator:browser"), "", string);
} 

var CCK2 = {
  config: null,
  firefoxFirstRun: false,
  firstrun: false,
  installedVersion: null,
  initialized: false,
  aboutFactories: [],
  init: function(in_config) {
    try {
      if (this.initialized) {
        return;
      }
      this.initialized = true;
      if (in_config) {
        this.config = in_config;
      } else {
        // Get config from somewhere else
        // Prefs, group policy, etc.        
      }    
      var config = this.config;
  
      // We don't handle in content preferences right now, so make sure they
      // can't be used
      Preferences.lock("browser.preferences.inContent", false);
      var aboutPreferences = {};
      aboutPreferences.classID = Components.ID(uuid.generateUUID().toString());
      aboutPreferences.factory = disableAbout(aboutPreferences.classID,
                                              "Disable about:preference - CCK",
                                              "preferences");
      CCK2.aboutFactories.push(aboutPreferences);

  
      // We want to know if this is the first run of Firefox. We do that by
      // testing for the existing of extensions.ini
      var profileDir = Services.dirsvc.get("ProfD", Ci.nsILocalFile);
      profileDir.append("extensions.ini");
      this.firefoxFirstRun = !profileDir.exists();
  
      if (!config)
        return;
      this.firstrun = Preferences.get("extensons.cck2." + config.id + ".firstrun", true);
      Preferences.set("extensons.cck2." + config.id + ".firstrun", false);
      if (!this.firstrun) {
        this.installedVersion = Preferences.get("extensons.cck2." + config.id + ".installedVersion");
      }
      Preferences.set("extensons.cck2." + config.id + ".installedVersion", config.version);
      if (config.permissions) {
        for (var i in config.permissions) {
          updatePermissions(i, config.permissions[i]);
        }
      }
      if (config.preferences) {
        for (var i in config.preferences) {
          if (config.preferences[i].locked) {
            Preferences.lock(i, config.preferences[i].value);
          } else {
            if (Preferences.defaults.has(i)) {
              try {
                // If it's a complex preference, we need to set it differently
                Services.prefs.getComplexValue(i, Ci.nsIPrefLocalizedString).data;
                Preferences.defaults.set(i, "data:text/plain," + i + "=" + config.preferences[i].value);
              } catch (ex) {
                Preferences.defaults.set(i, config.preferences[i].value);
              }
            } else {
              Preferences.defaults.set(i, config.preferences[i].value);
            }
          }
        }
      }
      if (config.registry && "@mozilla.org/windows-registry-key;1" in Cc) {
        for (var i in config.registry) {
          addRegistryKey(config.registry[i].rootkey,
                         config.registry[i].key,
                         config.registry[i].name,
                         config.registry[i].value,
                         config.registry[i].type);
        }
      }
      if (config.disablePrivateBrowsing) {
        Preferences.lock("browser.privatebrowsing.enabled", false);
        Preferences.lock("browser.taskbar.lists.tasks.enabled", false);
        Preferences.lock("browser.privatebrowsing.autostart", false);
        var aboutPrivateBrowsing = {};
        aboutPrivateBrowsing.classID = Components.ID(uuid.generateUUID().toString());
        aboutPrivateBrowsing.factory = disableAbout(aboutPrivateBrowsing.classID,
                                                "Disable about:privatebrowsing - CCK",
                                                "privatebrowsing");
        CCK2.aboutFactories.push(aboutPrivateBrowsing);
      }
      if (config.disableSync) {
        Preferences.lock("services.sync.enabled", false);
        var aboutSyncLog = {};
        aboutSyncLog.classID = Components.ID(uuid.generateUUID().toString());
        aboutSyncLog.factory = disableAbout(aboutSyncLog.classID,
                                                "Disable about:sync-log - CCK",
                                                "sync-log");
        CCK2.aboutFactories.push(aboutSyncLog);
        var aboutSyncProgress = {};
        aboutSyncProgress.classID = Components.ID(uuid.generateUUID().toString());
        aboutSyncProgress.factory = disableAbout(aboutSyncProgress.classID,
                                                "Disable about:sync-progress - CCK",
                                                "sync-progress");
        CCK2.aboutFactories.push(aboutSyncProgress);
        var aboutSyncTabs = {};
        aboutSyncTabs.classID = Components.ID(uuid.generateUUID().toString());
        aboutSyncTabs.factory = disableAbout(aboutSyncTabs.classID,
                                                "Disable about:sync-tabs - CCK",
                                                "sync-tabs");
        CCK2.aboutFactories.push(aboutSyncTabs);
      }
      var disableAboutConfigFactory = null;
      if (config.disableAboutConfig) {
        var aboutConfig = {};
        aboutConfig.classID = Components.ID(uuid.generateUUID().toString());
        aboutConfig.factory = disableAbout(aboutConfig.classID,
                                                "Disable about:config - CCK",
                                                "config");
        CCK2.aboutFactories.push(aboutConfig);
      }
      if (config.disableAddonsManager) {
        var aboutAddons = {};
        aboutAddons.classID = Components.ID(uuid.generateUUID().toString());
        aboutAddons.factory = disableAbout(aboutAddons.classID,
                                                "Disable about:addons - CCK",
                                                "addons");
        CCK2.aboutFactories.push(aboutAddons);
      }

      if (config.alwaysDefaultBrowser) {
        var shellSvc = Cc["@mozilla.org/browser/shell-service;1"].getService(Ci.nsIShellService);
        if (shellSvc)
          shellSvc.setDefaultBrowser(true, false);
      }
      if (config.removeSmartBookmarks) {
        Preferences.lock("browser.places.smartBookmarksVersion", -1);
      }
      if (config.removeDefaultBookmarks && this.firefoxFirstRun) {
        // If this is the first run of Firefox, we can prevent the creation
        // of the default bookmarks by putting a 0 length bookmarks.html file
        // in the profile directory
        var bookmarksFile = profileDir.clone();
        bookmarksFile.append("bookmarks.html");
        var fos = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
        fos.init(profileDir, -1, -1, false);
        fos.close();
      }
      if (config.disableCrashReporter) {
        Preferences.lock("toolkit.crashreporter.enabled", false);
        Cc["@mozilla.org/toolkit/crash-reporter;1"].
          getService(Ci.nsICrashReporter).submitReports = false;
        var aboutCrashes = {};
        aboutCrashes.classID = Components.ID(uuid.generateUUID().toString());
        aboutCrashes.factory = disableAbout(aboutCrashes.classID,
                                                "Disable about:crashes - CCK",
                                                "crashes");
        CCK2.aboutFactories.push(aboutCrashes);
      }
      if (config.disableTelemetry) {
        Preferences.lock("toolkit.telemetry.enabled", false);
        Preferences.lock("toolkit.telemetry.prompted", 2);
        var aboutTelemetry = {};
        aboutTelemetry.classID = Components.ID(uuid.generateUUID().toString());
        aboutTelemetry.factory = disableAbout(aboutTelemetry.classID,
                                                "Disable about:telemetry - CCK",
                                                "telemetry");
        CCK2.aboutFactories.push(aboutTelemetry);
      }
      if (config.disableDeveloperTools) {
        Preferences.lock("devtools.scratchpad.enabled", false);
        Preferences.lock("devtools.responsiveUI.enabled", false);
        Preferences.lock("devtools.toolbar.enabled", false);
        Preferences.lock("devtools.styleeditor.enabled", false);
        Preferences.lock("devtools.debugger.enabled", false);
        Preferences.lock("devtools.profiler.enabled", false);
        Preferences.lock("devtools.inspector.enabled", false);
        Preferences.lock("devtools.errorconsole.enabled", false);
      }
      if (config.noUpgradePage) {
        Preferences.lock("browser.startup.homepage_override.mstone", "ignore");
      }
      if (config.noWelcomePage) {
        Preferences.lock("startup.homepage_welcome_url", "");
      }
      if (config.dontShowRights) {
        Preferences.lock("browser.rights.3.shown", true);
      }
      if (config.certs) {
        if (config.certs.ca) {
          for (var i=0; i < config.certs.ca.length; i++) {
            if (config.certs.ca[i].url) {
              download(config.certs.ca[i].url, function(file) {
                var istream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
                istream.init(file, -1, -1, false);
                var bstream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
                bstream.setInputStream(istream);
                var cert = bstream.readBytes(bstream.available());
                if (/-----BEGIN CERTIFICATE-----/.test(cert)) {
                  certdb2.addCertFromBase64(fixupCert(cert), "C,C,C", "");
                } else {
                  certdb.addCert(cert, "C,C,C", "");
                }
              }, errorCritical);
            } else if (config.certs.ca[i].cert) {
              certdb2.addCertFromBase64(fixupCert(config.certs.ca[i].cert), "C,C,C", "");
            }
          }
        }
        if (config.certs.server) {
          for (var i=0; i < config.certs.server.length; i++) {
            download(config.certs.ca[i], function(file) {
              certdb.importCertsFromFile(null, file, Ci.nsIX509Cert.SERVER_CERT);
            }, errorCritical);
          }
        }
      }
    } catch (e) {
      errorCritical(e);
    }
  },
  getConfig: function() {
    return this.config;
  },
  observe: function observe(subject, topic, data) {
    switch (topic) {
      case "distribution-customization-complete":
        var config = this.config;
        if (!config || (!this.firstrun && this.installedVersion == config.version)) {
          return;
        }
        if (config.certs.override) {
          for (var i=0; i < config.certs.override.length; i++) {
            var xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
            try {
              xhr.open("GET", "https://" + config.certs.override[i], false);
              xhr.channel.notificationCallbacks = SSLExceptions;
              xhr.send(null);
            } catch (ex) {}
          }
        }
        if (config.removeSmartBookmarks) {
          var smartBookmarks = annos.getItemsWithAnnotation("Places/SmartBookmark", {});
          for (var i = 0; i < smartBookmarks.length; i++) {
            try {
              bmsvc.removeItem(smartBookmarks[i]);
            } catch (ex) {}
          }
        }
        // If this is an upgrade, remove the previous version's bookmarks
        if (this.installedVersion != config.version) {
          var oldBookmarks = annos.getItemsWithAnnotation(config.id + "/" + this.installedVersion, {});
          for (var i = 0; i < oldBookmarks.length; i++) {
            try {
              bmsvc.removeItem(oldBookmarks[i]);
            } catch (ex) {}
          }
        }
        if (config.bookmarks) {
          if (config.bookmarks.toolbar) {
            addBookmarks(config.bookmarks.toolbar, bmsvc.toolbarFolder, config.id + "/" + config.version);
          }
          if (config.bookmarks.folder) {
            addBookmarks(config.bookmarks.folder, bmsvc.bookmarksMenuFolder, config.id + "/" + config.version);
          }
        }
        // Should probably only be done on firstrun or installedVersion changed
        if (config.searchplugins || config.defaultSearchEngine) {
          searchInitRun(function() {
            // Stupid workaround needed until bug 493051 is fixed
            setTimeout(function(currentEngineName) {
              var defaultSearchEngine = Services.search.getEngineByName(currentEngineName);
              if (defaultSearchEngine)
                Services.search.currentEngine = defaultSearchEngine;
            }, 100, config.defaultSearchEngine ? config.defaultSearchEngine : Services.search.currentEngine.name);
            for (var i in config.searchplugins) {
              var engine = Services.search.getEngineByName(i);
              // Should we remove engines and readd?
              if (!engine) {
                Services.search.addEngine(config.searchplugins[i], Ci.nsISearchEngine.DATA_XML, null, false);
              }
            }
          });
        }
        break;
      case "final-ui-startup":
        var config = this.config;
        if (!config || (!this.firstrun && this.installedVersion == config.version)) {
          return;
        }
        if (config.addons) {
          Cu.import("resource://gre/modules/AddonManager.jsm");
          var numAddonsInstalled = 0;
          for (var i=0; i < config.addons.length; i++) {
            try {
            AddonManager.getInstallForURL(config.addons[i], function(addonInstall) {
              let listener = {
                onInstallEnded: function(addon) {
                  numAddonsInstalled++;
                  if (numAddonsInstalled == config.addons.length) {
                    Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit);
                  }
                }
              }
              addonInstall.addListener(listener);
              addonInstall.install();
            }, "application/x-xpinstall");
            } catch (e) {
              errorCritical(e);
            }
          }
        }
        break;
      case "quit-application":
        var registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
        for (var i=0; i < CCK2.aboutFactories.length; i++)
          registrar.unregisterFactory(CCK2.aboutFactories[i].classID, CCK2.aboutFactories[i].factory);
        break;
    }
  }
}

function addRegistryKey(RootKey, Key, Name, NameValue, Type) {
  const nsIWindowsRegKey = Ci.nsIWindowsRegKey;
  var key = null;

  try {
    key = Cc["@mozilla.org/windows-registry-key;1"]
                .createInstance(nsIWindowsRegKey);
    var rootKey;
    switch (RootKey) {
      case "HKEY_CLASSES_ROOT":
        rootKey = nsIWindowsRegKey.ROOT_KEY_CLASSES_ROOT;
        break;
      case "HKEY_CURRENT_USER":
        rootKey = nsIWindowsRegKey.ROOT_KEY_CURRENT_USER;
        break;
      default:
        rootKey = nsIWindowsRegKey.ROOT_KEY_LOCAL_MACHINE;
        break;
    }

    key.create(rootKey, Key, nsIWindowsRegKey.ACCESS_WRITE);

    switch (Type) {
      case "REG_DWORD":
        key.writeIntValue(Name, NameValue);
        break;
      case "REG_QWORD":
        key.writeInt64Value(Name, NameValue);
        break;
      case "REG_BINARY":
        key.writeBinaryValue(Name, NameValue);
        break;
      case "REG_SZ":
      default:
        key.writeStringValue(Name, NameValue);
        break;
    }
    key.close();
  } catch (ex) {
    /* This could fail if you don't have the right authority on Windows */
    if (key) {
      key.close();
    }
  }
}

function addBookmarks(bookmarks, destination, annotation) {
  for (var i in bookmarks) {
    if (typeof bookmarks[i] === "object") {
      var newFolderId = bmsvc.createFolder(destination, i, bmsvc.DEFAULT_INDEX);
      annos.setItemAnnotation(newFolderId, annotation, "true", 0, annos.EXPIRE_NEVER);
      addBookmarks(bookmarks[i], newFolderId, annotation);
    } else {
      //bmsvc.insertSeparator(destination, bmsvc.DEFAULT_INDEX);
      var newBookmarkId = bmsvc.insertBookmark(destination, NetUtil.newURI(bookmarks[i]), bmsvc.DEFAULT_INDEX, i);
      annos.setItemAnnotation(newBookmarkId, annotation, "true", 0, annos.EXPIRE_NEVER);
    }
  }
}

/**
 * Update the permissions with the given info
 *
 * @param {String} type of permission - popup, cookie, plugin
 * @returns {Object} object with the allow/deny for given domains
 */
function updatePermissions(type, permissions) {
  if (permissions.allow) {
    for (var i=0; i < permissions.allow.length; i++) {
      try {
        Services.perms.add(NetUtil.newURI("http://" + permissions.allow[i]),
                           type, Services.perms.ALLOW_ACTION);
      } catch (ex) {}
    }
  }
  if (permissions.deny) {
    for (var i=0; i < permissions.deny.length; i++) {
      try {
        Services.perms.add(NetUtil.newURI("http://" + permissions.deny[i]),
                           type, Services.perms.DENY_ACTION);
      } catch (ex) {}
    }
  }        
}

function errorCritical(e) {
  Services.prompt.alert(null, "CCK2", e + "\n\n" + e.stack);
}

/**
 * If the search service is not available, passing function
 * to search service init
 */
function searchInitRun(func)
{
  if (Services.search.init && !Services.search.isInitialized)
    Services.search.init(func);
  else
    func();
}

/**
 * Check to see if a given cert exists so we don't readd.
 * I'm not convinced this is actually needed, since we don't get errors
 * adding the same cert twice...
 */
function certExists(cert) {
  return false;
  var actualCert = certdb.constructX509FromBase64(fixupCert(cert));
  try {
    var installedCert = certdb.findCertByNickname(null, actualCert.commonName + " - " + actualCert.organization);
    if (installedCert)
      return true;
  } catch(ex) {}
  return false;
}

/**
 * Remove all extraneous info from a certificates. addCertFromBase64 requires
 * just the cert with no whitespace or anything.
 *
 * @param {String} certificate text
 * @returns {String} certificate text cleaned up
 */
function fixupCert(cert) {
  var beginCert = "-----BEGIN CERTIFICATE-----";
  var endCert = "-----END CERTIFICATE-----";

  cert = cert.replace(/[\r\n]/g, "");
  var begin = cert.indexOf(beginCert);
  var end = cert.indexOf(endCert);
  return cert.substring(begin + beginCert.length, end);
}

/**
 * Download the given URL to the user's download directory
 *
 * @param {String} URL of the file
 * @param {function} Function to call on success - called with nsIFile
 * @param {String} Function to call on failure
 * @returns {nsIFile} Downloaded file
 */
function download(url, successCallback, errorCallback) {
  var uri = Services.io.newURI(url, null, null);
  uri.QueryInterface(Ci.nsIURL);
  var file = Services.downloads.userDownloadsDirectory;
  file.append(uri.fileName);
  if (file.exists()) {
    file.remove(false);
  }

  var channel = Services.io.newChannelFromURI(uri);

  var downloader = Cc["@mozilla.org/network/downloader;1"].createInstance(Ci.nsIDownloader);
  var listener = {
    onDownloadComplete: function(downloader, request, ctxt, status, result) {
      if (Components.isSuccessCode(status)) {
        result.QueryInterface(Ci.nsIFile);
        if (result.exists() && result.fileSize > 0) {
          successCallback(result);
          return;
        }
      }
      errorCallback(new Error("Download failed"));
    }
  }
  downloader.init(listener, file);
  channel.asyncOpen(downloader, null);
}

/**
 * Used to allow the overriding of certificates
 */
var SSLExceptions = {
  getInterface: function(uuid) {
    return this.QueryInterface(uuid);
  },
  QueryInterface: function(uuid) {
    if (uuid.equals(Ci.nsIBadCertListener2) ||
        uuid.equals(Ci.nsISupports))
      return this;
    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  notifyCertProblem: function (socketInfo, status, targetSite) {
    status.QueryInterface(Ci.nsISSLStatus);

    let flags = 0;

    if (status.isUntrusted)
      flags |= override.ERROR_UNTRUSTED;
    if (status.isDomainMismatch)
      flags |= override.ERROR_MISMATCH;
    if (status.isNotValidAtThisTime)
      flags |= override.ERROR_TIME;

    var hostInfo = targetSite.split(":");

    override.rememberValidityOverride(
      hostInfo[0],
      hostInfo[1],
      status.serverCert,
      flags,
      false);
    return true; // Don't show error UI
  }
};

/**
 * Register a component that replaces an about page
 *
 * @param {String} The ClassID of the class being registered.
 * @param {String} The name of the class being registered.
 * @param {String} The type of about to be disabled (config/addons/privatebrowsing)
 * @returns {Object} The factory to be used to unregister
 */
function disableAbout(aClass, aClassName, aboutType) {
  var gAbout = {
    newChannel : function (aURI) {
      var url = "chrome://cck2/content/about.xhtml?aboutType";
      var channel = Services.io.newChannel(url, null, null);
      channel.originalURI = aURI;
      return channel;
    },
    getURIFlags : function getURIFlags(aURI) {
      return Ci.nsIAboutModule.HIDE_FROM_ABOUTABOUT;
    },

    QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),

    createInstance: function(outer, iid) {
       return this.QueryInterface(iid);
    },
  };

  var registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  registrar.registerFactory(aClass, aClassName, "@mozilla.org/network/protocol/about;1?what=" + aboutType, gAbout);
  return gAbout;
}

Services.obs.addObserver(CCK2, "distribution-customization-complete", false);
Services.obs.addObserver(CCK2, "final-ui-startup", false);