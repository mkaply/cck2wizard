const cck2Files = [
  "chrome.manifest",
  "chrome/content/cck2-prefs-overlay.js",
  "chrome/content/cck2.xul",
  "chrome/content/cck2-extensions-overlay.js",
  "chrome/content/cck2-prefs-overlay.xul",
  "chrome/content/cck2-extensions-overlay.xul",
  "chrome/content/cck2.js",
  "chrome/content/util.js",
  "components/CCK2FileBlockService.js",
  "modules/CCK2.jsm",
  "modules/Preferences.jsm",
  "modules/Timer.jsm",
  "modules/Utils.jsm",
  "modules/CTPPermissions.jsm",
  "modules/CAPSClipboard.jsm",
  "modules/CAPSCheckLoadURI.jsm",
  "modules/CCK2AboutDialogOverlay.jsm"
]

const disablesafemodeFiles = [
  "chrome.manifest",
  "chrome/content/safeMode.xul"
]

const installRDFTemplate = [
'<RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#"',
'     xmlns:em="http://www.mozilla.org/2004/em-rdf#">',
'    <Description about="urn:mozilla:install-manifest">',
'        <em:id>%extid%</em:id>',
'        <em:name>%extname%</em:name>',
'        <em:version>%version%</em:version>',
'        <em:description>%description%</em:description>',
'        <em:creator>CCK2 Wizard (http://mike.kaply.com/cck2)</em:creator>',
'        <em:homepageURL>%homepageURL%</em:homepageURL>',
'        <em:updateURL>%updateURL%</em:updateURL>',
'        <em:updateKey>%updateKey%</em:updateKey>',
'        <em:targetApplication>',
'            <Description>',
'                <em:id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</em:id>',
'                <em:minVersion>17.0</em:minVersion>',
'                <em:maxVersion>24.*</em:maxVersion>',
'            </Description>',
'        </em:targetApplication>',
'    </Description>',
'</RDF>',
''].join("\n");

const chromeManifestTemplate = [
'resource %packagename% resources/',
'content %packagename% resources/',
'manifest cck2/chrome.manifest',
''].join("\n");

const chromeManifestComponentTemplate = [
'',
'component %uuid% components/CCK2Service.js',
'contract @kaply.com/cck2-%id-nospecialchars%-service;1 %uuid%',
'category profile-after-change CCK2%id-nospecialchars%Service @kaply.com/cck2-%id-nospecialchars%-service;1',
''].join("\n");

const CCK2ServiceTemplate = [
'const {classes: Cc, interfaces: Ci, utils: Cu} = Components;',
'',
'Cu.import("resource://gre/modules/Services.jsm");',
'Cu.import("resource://gre/modules/XPCOMUtils.jsm");',
'',
'var config = %config%;',
'',
'function CCK2%id-nospecialchars%Service() {}',
'',
'CCK2%id-nospecialchars%Service.prototype = {',
'  observe: function(aSubject, aTopic, aData) {',
'    switch(aTopic) {',
'      case "profile-after-change":',
'        Components.utils.import("resource://cck2/CCK2.jsm");',
'        CCK2.init(config);',
'        break;',
'    }',
'  },',
'  classDescription: "CCK2 %id% Service",',
'  contractID: "@kaply.com/cck2-%id-nospecialchars%-service;1",',
'  classID: Components.ID("%uuid%"),',
'  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),',
'  _xpcom_categories: [{category: "profile-after-change"}]',
'}',
'',
'var NSGetFactory = XPCOMUtils.generateNSGetFactory([CCK2%id-nospecialchars%Service]);',
''].join("\n");

const defaultPrefsTemplate = [
'pref("extensions.cck2.config", "%config%");',
''].join("\n");

const overrideINI = [
'[XRE]',
'EnableProfileMigrator=0',
''].join("\n");

const autoconfigPrefs = [
'pref("general.config.filename", "cck2.cfg");',
'pref("general.config.obscure_value", 0);',
''].join("\n");

const autoconfigTemplate = [
'var config = %config%;',
'',
'Components.utils.import("resource://cck2/CCK2.jsm");',
'CCK2.init(config);',
'',
''].join("\n");

function onFinishAutoconfig() {
  packageCCK2("distribution");
}

function onFinishExtension() {
  packageCCK2("extension");
}

var zipwriter;

function packageCCK2(type) {
  var config = getConfig();
  if (!config.version) {
    showErrorMessage("noversion");
    selectPane("about");
    return;
  }
  if (type == "extension" &&
      (!config.extension || !config.extension.id)) {
    showErrorMessage("noextensionid");
    selectPane("extension");
    return;
  }
  
  var numFilesToWrite = 0;

  var basedir;
  if (config.outputDirectory) {
    basedir = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    basedir.initWithPath(config.outputDirectory);
  } else {
    basedir = chooseDir(window, config.outputDirectory);
    if (!basedir) {
      return;
    }
  }
  if (config.outputDirectory) {
    delete(config.outputDirectory);
  } else {
    document.querySelector('textbox[config="outputDirectory"]').value = basedir.path;
  }
  var dir = basedir.clone();
  if (type == "distribution") {
    dir.append("firefox");
  } else {
    dir.append("xpi");
  }
  if (dir.exists()) {
    try {
      dir.remove(true);
    }  catch (ex) {
      Services.prompt.alert(window, "CC2", "Unable to remove directory. It might be in use.");
      return;
    }
  }

  // SAVE CONFIG
  onSave();

  try {
    dir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
  } catch (e) {
    Services.prompt.alert(window, "CC2", "Unable to create directory. You might not have the proper permissions.");
  }
  var zipwritera = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
  zipwriter = new zipwritera();
  var zipfile = basedir.clone();
  if (type == "distribution") {
    zipfile.append("autoconfig.zip");
  } else {
    if (config.extension && config.extension.filename) {
      zipfile.append(config.extension.filename + ".xpi");
    } else {
      zipfile.append(config.id + ".xpi");
    }
  }
  if (zipfile.exists()) {
    zipfile.remove(false);
  }
  zipwriter.open(zipfile, 0x04 | 0x08 | 0x20);

  // These characters are not allowed in the packagename for chrome.manifest
  var packageName = config.id.replace("@", "").replace("#", "").replace(";", "")
                             .replace(":", "").replace("?", "").replace("/", "");

  // These characters are not allowed in Windows paths (NTFS and FAT)
  var packagePath = config.id.replace("/", "").replace("?", "").replace("<", "")
                             .replace(">", "").replace("\\", "").replace(":", "")
                             .replace("*", "").replace("|", "").replace("\"", "")
                             .replace("^", "");

  var configfile = basedir.clone();
  configfile.append("cck2.config.json")
  if (!configfile.exists()) {
    configfile.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
  }
  writeFile(configfile, JSON.stringify(getConfig(), null, 2));

  if (type != "distribution") {
    var installRDF = installRDFTemplate.replace("%extid%", config.extension.id);
    installRDF = installRDF.replace("%extname%", encodeXML(config.extension.name));
    installRDF = installRDF.replace("%version%", config.version);
    if ("description" in config.extension) {
      installRDF = installRDF.replace("%description%", encodeXML(config.extension.description));
    } else {
      installRDF = installRDF.split("\n").filter(function(element) {
        return !/%description%/.test(element);
      }).join("\n");
    }
    if ("homepageURL" in config.extension) {
      installRDF = installRDF.replace("%homepageURL%", encodeXML(config.extension.homepageURL));
    } else {
      installRDF = installRDF.split("\n").filter(function(element) {
        return !/%homepageURL%/.test(element);
      }).join("\n");
    }
    if ("updateURL" in config.extension) {
      installRDF = installRDF.replace("%updateURL%", encodeXML(config.extension.updateURL));
    } else {
      installRDF = installRDF.split("\n").filter(function(element) {
        return !/%updateURL%/.test(element);
      }).join("\n");
    }
    if ("updateKey" in config.extension) {
      installRDF = installRDF.replace("%updateKey%", config.extension.updateKey);
    } else {
      installRDF = installRDF.split("\n").filter(function(element) {
        return !/%updateKey%/.test(element);
      }).join("\n");
    }
    var installRDFFile = dir.clone();
    installRDFFile.append("install.rdf");
    numFilesToWrite += 1;
    writeFile(installRDFFile, installRDF, addFileToZip(zipwriter));
    var configFile = dir.clone();
    configFile.append("cck2.config.json");
    numFilesToWrite += 1;
    writeFile(configFile, JSON.stringify(getConfig(), null, 2), addFileToZip(zipwriter));
  }
  var uuidGenerator = Cc["@mozilla.org/uuid-generator;1"].getService(Ci.nsIUUIDGenerator);
  var uuid = uuidGenerator.generateUUID().toString();
  var chromeManifest = chromeManifestTemplate;
  if (type == "extension") {
    chromeManifest += chromeManifestComponentTemplate;
  }
  chromeManifest = chromeManifest.replace(/%packagename%/g, packageName);
  // Remove all special characters from ID so it can be used for JavaScript
  chromeManifest = chromeManifest.replace(/%id-nospecialchars%/g, config.id.replace(/[^A-Za-z0-9_]/gi, ''));
  chromeManifest = chromeManifest.replace(/%uuid%/g, uuid);
  
  var chromeManifestFile = dir.clone();
  if (type == "distribution") {
    chromeManifestFile.append("distribution");
    chromeManifestFile.append("bundles");
    chromeManifestFile.append(packagePath);
    if (!chromeManifestFile.exists()) {
      chromeManifestFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    }
    chromeManifest = chromeManifest.split("\n").filter(function(element) {
      return !/chrome\.manifest/.test(element);
    }).join("\n");
  }
  chromeManifestFile.append("chrome.manifest");
  numFilesToWrite += 1;
  writeFile(chromeManifestFile, chromeManifest, addFileToZip(zipwriter));
  
  var cck2Dir = dir.clone();
  if (type == "distribution") {
    cck2Dir.append("distribution");
    cck2Dir.append("bundles");
  }
  cck2Dir.append("cck2");
  cck2Dir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
  numFilesToWrite += cck2Files.length;
  for (var i=0; i < cck2Files.length; i++) {
    var data = readChromeFile("chrome://cck2files/content/" + cck2Files[i]);
    var destfile = cck2Dir.clone();
    var splitpath = cck2Files[i].split('/');
    for (var j=0; j < splitpath.length; j++) {
      destfile.append(splitpath[j]);
    }
    destfile.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
    writeFile(destfile, data, addFileToZip(zipwriter));
  }

  if (type == "distribution") {  
    if ("autoconfig" in config && config.autoconfig.disableSafeMode) {
      var disablesafemodeDir = dir.clone();
      if (type == "distribution") {
        disablesafemodeDir.append("distribution");
        disablesafemodeDir.append("bundles");
      }
      disablesafemodeDir.append("disablesafemode");
      disablesafemodeDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
      numFilesToWrite += disablesafemodeFiles.length;
      for (var i=0; i < disablesafemodeFiles.length; i++) {
        var data = readChromeFile("chrome://disablesafemodefiles/content/" + disablesafemodeFiles[i]);
        var destfile = disablesafemodeDir.clone();
        var splitpath = disablesafemodeFiles[i].split('/');
        for (var j=0; j < splitpath.length; j++) {
          destfile.append(splitpath[j]);
        }
        destfile.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
        writeFile(destfile, data, addFileToZip(zipwriter));
      }
    }
    if (config.removeDefaultBookmarks) {
      var blankBookmarksFile = dir.clone();
      blankBookmarksFile.append("browser");
      try {
        blankBookmarksFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
      } catch (e) {}
      blankBookmarksFile.append("defaults");
      try {
        blankBookmarksFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
      } catch (e) {}
      blankBookmarksFile.append("profile");
      try {
        blankBookmarksFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
      } catch (e) {}
      blankBookmarksFile.append("bookmarks.html");
      blankBookmarksFile.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
      numFilesToWrite += 1;
      writeFile(blankBookmarksFile, "", addFileToZip(zipwriter));
    }
  }
  if ("icon" in config.extension) {
    var iconFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    try {
      iconFile.initWithPath(config.extension.icon);
      copyAndAddFileToZip(zipwriter, iconFile, dir, "icon.png");
      // Since icon gives away local path, remove it
      delete(config.extension.icon);
    } catch (e) {
      copyFileError(config.extension.icon);
    }
  }
  if ("plugins" in config) {
    var pluginsDir = dir.clone();
    if (type == "distribution") {
      pluginsDir.append("distribution");
      pluginsDir.append("bundles");
      pluginsDir.append(packagePath);
    }
    pluginsDir.append("plugins");
    pluginsDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    for (var i=0; i < config.plugins.length; i++) {
      var pluginFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      try {
        pluginFile.initWithPath(config.plugins[i]);
        copyAndAddFileToZip(zipwriter, pluginFile, pluginsDir, null);
      } catch (e) {
        copyFileError(config.plugins[i]);
      }
    }
    delete(config.plugins);
  }
  var resourceDir = dir.clone();
  if (type == "distribution") {
    resourceDir.append("distribution");
    resourceDir.append("bundles");
    resourceDir.append(packagePath);
  }
  resourceDir.append("resources");
  resourceDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
  if ("searchplugins" in config) {
    var searchpluginsDir = resourceDir.clone();
    searchpluginsDir.append("searchplugins");
    searchpluginsDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    for (var i=0; i < config.searchplugins.length; i++) {
      if (!/^https?:/.test(config.searchplugins[i])) {
        var searchpluginFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        try {
          searchpluginFile.initWithPath(config.searchplugins[i]);
          copyAndAddFileToZip(zipwriter, searchpluginFile, searchpluginsDir, null);
          config.searchplugins[i] = "resource://" + packageName + "/searchplugins/" + searchpluginFile.leafName;
        } catch (e) {
          copyFileError(config.searchplugins[i])
        }
      }
    }
  }
  if ("addons" in config) {
    var addonsDir = resourceDir.clone();
    addonsDir.append("addons");
    if (type == "extension") {
      addonsDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    }
    for (var i=0; i < config.addons.length; i++) {
      if (!/^https?:/.test(config.addons[i])) {
        var addonFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        try {
          addonFile.initWithPath(config.addons[i]);
          copyAndAddFileToZip(zipwriter, addonFile, addonsDir, null);
          config.addons[i] = "chrome://" + packageName + "/content/addons/" + addonFile.leafName;
        } catch (e) {
          copyFileError(config.addons[i]);
        }
      }
    }
    // Kind of ugly, but we can't remove the items as we go since we are in an array.
    config.addons = config.addons.filter(function(element) {
      return element != null;;
    });
    if (config.addons.length ==0) {
      delete(config.addons);
    }
  }
  if ("certs" in config && ("ca" in config.certs || "server" in config.certs)) {
    var certsDir = resourceDir.clone();
    certsDir.append("certs");
    certsDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    if ("ca" in config.certs) {
      for (var i=0; i < config.certs.ca.length; i++) {
        if (!/^https?:/.test(config.certs.ca[i].url)) {
          var certFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
          try {
            certFile.initWithPath(config.certs.ca[i].url);
            copyAndAddFileToZip(zipwriter, certFile, certsDir, null);
            config.certs.ca[i].url = "resource://" + packageName + "/certs/" + certFile.leafName;
          } catch (e) {
            copyFileError(config.certs.ca[i].url);
          }
        }
      }
    }
    if ("server" in config.certs) {
      for (var i=0; i < config.certs.server.length; i++) {
        if (!/^https?:/.test(config.certs.server[i])) {
          var certFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
          try {
            certFile.initWithPath(config.certs.server[i]);
            copyAndAddFileToZip(zipwriter, certFile, certsDir, null);
            config.certs.server[i] = "resource://" + packageName + "/certs/" + certFile.leafName;
          } catch(e) {
            copyFileError(config.certs.server[i]);
          }
        }
      }
    }
  }
  if ("network" in config) {
    if ("proxyAutoConfig" in config.network) {
      if (!/^https?:/.test(config.network.proxyAutoConfig)) {
        var proxyAutoConfigDir = resourceDir.clone();
        proxyAutoConfigDir.append("proxyautoconfig");
        proxyAutoConfigDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
        var proxyAutoConfigFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        try {
          proxyAutoConfigFile.initWithPath(config.network.proxyAutoConfig);
          copyAndAddFileToZip(zipwriter, proxyAutoConfigFile, proxyAutoConfigDir, null);
          config.network.proxyAutoConfig = "resource://" + packageName + "/proxyautoconfig/" + proxyAutoConfigFile.leafName;
        } catch (e) {
          copyFileError(config.network.proxyAutoConfig);
        }
      }
    }
  }

  if (type == "distribution") {
    var preferencesFile = dir.clone();
    preferencesFile.append("defaults");
    preferencesFile.append("pref");
    preferencesFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    preferencesFile.append("autoconfig.js");
    numFilesToWrite += 1;
    writeFile(preferencesFile, autoconfigPrefs, addFileToZip(zipwriter));
  }
  if (type == "distribution") {
    if ("autoconfig" in config && config.autoconfig.disableProfileMigrator) {
      var overrideFile = dir.clone();
      overrideFile.append("browser");
      try {
        overrideFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
      } catch (e) {}
      overrideFile.append("override.ini");
      numFilesToWrite += 1;
      writeFile(overrideFile, overrideINI, addFileToZip(zipwriter));
    }
  }
  if (type == "distribution") {
    var autoconfigFile = dir.clone();
    autoconfigFile.append("cck2.cfg");
    var autoconfigcontent = "// Autoconfig file written by CCK2" + "\n\n";
    if ("AutoConfigJSBefore" in config) {
      var file = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsIFile);
      file.initWithPath(config.AutoConfigJSBefore);
      autoconfigcontent += readChromeFile(Services.io.newFileURI(file).spec) + "\n\n";
    }
    autoconfigcontent += autoconfigTemplate.replace("%config%", JSON.stringify(config, null, 2));
    if ("AutoConfigJSAfter" in config) {
      var file = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsIFile);
      file.initWithPath(config.AutoConfigJSAfter);
      autoconfigcontent += readChromeFile(Services.io.newFileURI(file).spec) + "\n\n";
    }
    numFilesToWrite += 1;
    writeFile(autoconfigFile, autoconfigcontent, addFileToZip(zipwriter));
  }
  if (type == "extension") {
    var CCK2Service = CCK2ServiceTemplate;
    CCK2Service = CCK2Service.replace(/%id%/g, config.id);
    CCK2Service = CCK2Service.replace(/%id-nospecialchars%/g, config.id.replace(/[^A-Za-z0-9_]/gi, ''));
    CCK2Service = CCK2Service.replace(/%uuid%/g, uuid);
    CCK2Service = CCK2Service.replace("%config%", JSON.stringify(config, null, 2))
    var CCK2ServiceFile = dir.clone();
    CCK2ServiceFile.append("components");
    if (!CCK2ServiceFile.exists()) {
      CCK2ServiceFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    }
    CCK2ServiceFile.append("CCK2Service.js");
    numFilesToWrite += 1;
    writeFile(CCK2ServiceFile, CCK2Service, addFileToZip(zipwriter));
  }  

  function copyAndAddFileToZip(zipwriter, file, destdir, filename) {
    var destfile = destdir.clone();
    if (filename) {
      destfile.append(filename);
    } else {
      destfile.append(file.leafName);
    }
    // copyTo succeeds if the file is exactly the same and weird things happen.
    // If the file exists, just ignore.
    if (destfile.exists()) {
      return;
    }
    try {
      file.copyTo(destdir, filename);
    } catch (ex) {
      
      if (filename) {
        copyFileError(filename);
      } else {
        copyFileError(file.leafName);
      }
      return;
    }
    var zipPath = destfile.path.replace(dir.path, "");
    zipPath = zipPath.substr(1);
    zipPath = zipPath.replace(/\\/g, "/");
    zipwriter.addEntryFile(zipPath, Ci.nsIZipWriter.COMPRESSION_NONE, destfile, true);
  }

  function addFileToZip(zipwriter) {
    return function (file) {
      var zipPath = file.path.replace(dir.path, "");
      zipPath = zipPath.substr(1);
      zipPath = zipPath.replace(/\\/g, "/");
      zipwriter.addEntryFile(zipPath, Ci.nsIZipWriter.COMPRESSION_NONE, file, true);
      numFilesToWrite -= 1;
      if (numFilesToWrite == 0) {
        zipwriter.processQueue(observer, null);
      }
    }
  }
}

var errors = [];

var observer = {
  onStartRequest: function(request, context)
  {
  },

  onStopRequest: function(request, context, status)
  {
    zipwriter.close();
    var message = "CCK2 Creation is complete and available at: " + zipwriter.file.path;
    if (errors.length > 0) {
      message += "\n\n" + "The following errors occurred during creation:";
      for (var i=0; i < errors.length; i++) {
        message += "\n\n" + errors[i];
      }
      errors = [];
    }
    Services.prompt.alert(window, "CCK2", message);
  }
};

function copyFileError(filename) {
  errors.push("Unable to copy file " + filename);
}

function readChromeFile(path) {
  var scriptableStream = Cc["@mozilla.org/scriptableinputstream;1"].
                           getService(Ci.nsIScriptableInputStream);

  var channel = Services.io.newChannel(path, null, null);
  var input = channel.open();
  scriptableStream.init(input);
  var str = scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();
  return str;
}

function encodeXML(string) {
  return string.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
}
