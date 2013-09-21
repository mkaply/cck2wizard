function onLoad() {
  document.getElementById("finish-autoconfig").addEventListener("command", onFinishAutoconfig, false);
  document.getElementById("finish-extension").addEventListener("command", onFinishExtension, false);
}
window.addEventListener("load", onLoad, false);

const cck2Files = [
  "chrome.manifest",
  "chrome/content/about.xhtml",
  "chrome/content/cck2-prefs-overlay.js",
  "chrome/content/cck2.xul",
  "chrome/content/cck2-extensions-overlay.js",
  "chrome/content/cck2-prefs-overlay.xul",
  "chrome/content/migration-overlay.xul",
  "chrome/content/cck2-extensions-overlay.xul",
  "chrome/content/cck2.js",
  "chrome/content/util.js",
  "components/CCK2Service.js",
  "modules/CCK2.jsm",
  "modules/Preferences.jsm",
  "modules/Timer.jsm",
  "modules/Utils.jsm"
]

const installRDFTemplate = [
'<RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#"',
'     xmlns:em="http://www.mozilla.org/2004/em-rdf#">',
'    <Description about="urn:mozilla:install-manifest">',
'        <em:id>%id%</em:id>',
'        <em:name>%name%</em:name>',
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
'resource %id% resources/',
'manifest cck2/chrome.manifest',
''].join("\n");

const defaultPrefsTemplate = [
'pref("extensions.cck2.config", "%config%");',
''].join("\n");

const autoconfigPrefs = [
'pref("general.config.filename", "cck2.cfg");',
'pref("general.config.obscure_value", 0);',
''].join("\n");

const autoconfigTemplate = [
'// Autoconfig file written by CCK2',
'',
'var config = %config%;',
'',
'Components.utils.import("resource://cck2/CCK2.jsm");',
'CCK2.init(config);',
''].join("\n");

function onFinishAutoconfig() {
  packageCCK2("distribution");
}

function onFinishExtension() {
  packageCCK2("extension");
}

var zipwriter;

function packageCCK2(type) {
  var type = "distribution"
  var numFilesToWrite = 0;
  var basedir = chooseDir(window);
  if (!basedir) {
    return;
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
      alert("Directory is in use");
      return;
    }
  }
  dir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
  var zipwritera = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
  zipwriter = new zipwritera();
  var zipfile = basedir.clone();
  if (type == "distribution") {
    zipfile.append("autoconfig.zip");
  } else {
    zipfile.append("foo.xpi");
  }
  if (zipfile.exists()) {
    zipfile.remove(false);
  }
  zipwriter.open(zipfile, 0x04 | 0x08 | 0x20);

  var config = getConfig();
  
  if (type == "distribution") {
    var autoconfigFile = dir.clone();
    autoconfigFile.append("cck2.cfg");
    writeFile(autoconfigFile, autoconfigTemplate.replace("%config%", JSON.stringify(config, null, 2)), addFileToZip(zipwriter));
  }
  if (type != "distribution") {
    var installRDF = installRDFTemplate.replace("%id%", config.extension.id);
    installRDF = installRDF.replace("%name%", config.extension.name);
    installRDF = installRDF.replace("%version%", config.extension.version);
    if ("description" in config.extension) {
      installRDF = installRDF.replace("%description%", config.extension.description);
    } else {
      installRDF = installRDF.split("\n").filter(function(element) {
        return !/%description%/.test(element);
      }).join("\n");
    }
    if ("homepageURL" in config.extension) {
      installRDF = installRDF.replace("%homepageURL%", config.extension.homepageURL);
    } else {
      installRDF = installRDF.split("\n").filter(function(element) {
        return !/%homepageURL%/.test(element);
      }).join("\n");
    }
    if ("updateURL" in config.extension) {
      installRDF = installRDF.replace("%updateURL%", config.extension.updateURL);
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
  }
  var chromeManifest = chromeManifestTemplate.replace("%id%", config.id);
  var chromeManifestFile = dir.clone();
  if (type == "distribution") {
    chromeManifestFile.append("distribution");
    chromeManifestFile.append(config.id);
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
  if ("iconurl" in config.extension) {
    var iconFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    iconFile.initWithPath(config.extension.iconurl);
    copyAndAddFileToZip(zipwriter, iconFile, dir, "icon.png");
  }
  if ("plugins" in config) {
    var pluginsDir = dir.clone();
    if (type == "distribution") {
      pluginsDir.append("distribution");
      pluginsDir.append(config.id);
    }
    pluginsDir.append("plugins");
    pluginsDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    for (var i=0; i < config.plugins.length; i++) {
      var pluginFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      pluginFile.initWithPath(config.plugins[i]);
      copyAndAddFileToZip(zipwriter, pluginFile, pluginsDir, null);
    }
    delete(config.plugins);
  }
  var resourceDir = dir.clone();
  if (type == "distribution") {
    resourceDir.append("distribution");
    resourceDir.append(config.id);
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
        searchpluginFile.initWithPath(config.searchplugins[i]);
        copyAndAddFileToZip(zipwriter, searchpluginFile, searchpluginsDir, null);
        config.searchplugins[i] = "resource://" + config.id + "/searchplugins/" + searchpluginFile.leafName;
      }
    }
  }

  // certs in resources/certs
  // extension in resources/extensions
  // proxy config file in resources/proxyconfig
  if (type != "distribution") {
    var preferencesFile = dir.clone();
    preferencesFile.append("defaults");
    preferencesFile.append("preferences");
    preferencesFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    preferencesFile.append("prefs.js");
    delete config.extension;
    var defaultPrefs = defaultPrefsTemplate.replace("%config%", JSON.stringify(config).replace(/"/g, "\\\""));
    numFilesToWrite += 1;
    writeFile(preferencesFile, defaultPrefs, addFileToZip(zipwriter));
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

  function copyAndAddFileToZip(zipwriter, file, destdir, filename) {
    file.copyTo(destdir, filename);
    var destfile = destdir.clone();
    if (filename) {
      destfile.append(filename);
    } else {
      destfile.append(file.leafName);
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

var observer = {
  onStartRequest: function(request, context)
  {
  },

  onStopRequest: function(request, context, status)
  {
    zipwriter.close();
  }
};


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
