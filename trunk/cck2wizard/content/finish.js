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

const autoconfigStart = "// Autoconfig file written by CCK2\n\nvar config = ";
const autoconfigEnd = "\n\nComponents.utils.import(\"resource://cck2/CCK2.jsm\");\nCCK2.init(config)\n";

function onFinishAutoconfig() {
  var dir = chooseDir(window);
  if (!dir) {
    return;
  }
  var numFilesToWrite = 1 + cck2Files.length;
  var config = getConfig();
  var autoconfigFile = dir.clone();
  autoconfigFile.append("cck2.cfg");
  writeFile(autoconfigFile, autoconfigStart + JSON.stringify(config, null, 2) + autoconfigEnd, function() {
    numFilesToWrite = numFilesToWrite - 1;
  });
  var cck2Dir = dir.clone();
  cck2Dir.append("distribution");
  if (cck2Dir.exists()) {
    cck2Dir.remove(true);
  }
  cck2Dir.append("cck2");
  cck2Dir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
  for (var i=0; i < cck2Files.length; i++) {
    var data = readChromeFile("chrome://cck2files/content/" + cck2Files[i]);
    var destfile = cck2Dir.clone();
    var splitpath = cck2Files[i].split('/');
    for (var j=0; j < splitpath.length; j++) {
      destfile.append(splitpath[j]);
    }
    destfile.create(Ci.nsIFile.NORMAL_FILE_TYPE, FileUtils.PERMS_FILE);
    writeFile(destfile, data, function() {
      numFilesToWrite = numFilesToWrite - 1;
    });
  }
  var resourceDir = dir.clone();
  resourceDir.append("distribution");
  resourceDir.append(config.id);
  // Requerying the config wih a dir copies files
  config = getConfig(resourceDir);
  // PUT FILES IN THIS DIR THAT ARE REFERENCED AS NON URLS (local files)
  // CHROME.MANIFEST POINTING TO FILES
  // Incrememnt numFilesToWrite before writing. Decrement when written.
  // Put in a defaults/autoconfig.js for good measure
  // ZIP IT ALL UP  
  // Write a zip file of distribution directory with autoconfig at the top level.
}

function onFinishExtension() {
  var numFilesToWrite = 0;
  var dir = chooseDir(window);
  if (!dir) {
    return;
  }
  dir.append("xpi");
  if (dir.exists()) {
    dir.remove(true);
  }
  dir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
  var config = getConfig();
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
  writeFile(installRDFFile, installRDF, function() {
    numFilesToWrite -= 1;
  });
  var chromeManifest = chromeManifestTemplate.replace("%id%", config.id);
  var chromeManifestFile = dir.clone();
  chromeManifestFile.append("chrome.manifest");
  numFilesToWrite += 1;
  writeFile(chromeManifestFile, chromeManifest, function() {
    numFilesToWrite -= 1;
  });
  var cck2Dir = dir.clone();
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
    writeFile(destfile, data, function() {
      numFilesToWrite -= 1;
    });
  }
  if ("iconurl" in config.extension) {
    var iconFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    iconFile.initWithPath(config.extension.iconurl);
    iconFile.copyTo(dir, "icon.png");
  }
  if ("plugins" in config) {
    var pluginsDir = dir.clone();
    pluginsDir.append("plugins");
    pluginsDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    for (var i=0; i < config.plugins.length; i++) {
      var pluginFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
      pluginFile.initWithPath(config.plugins[i]);
      pluginFile.copyTo(pluginsDir, null);
    }
    delete(config.plugins);
  }
  var resourceDir = dir.clone();
  resourceDir.append("resources");
  resourceDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
  if ("searchengines" in config) {
    var searchenginesDir = resourceDir.clone();
    searchenginesDir.append("searchengines");
    searchenginesDir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    for (var i=0; i < config.searchengines.length; i++) {
      if (!/^https?:/.test(config.searchengines[i])) {
        var searchengineFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
        searchengineFile.initWithPath(config.searchengines[i]);
        searchengineFile.copyTo(searchenginesDir, null);
        config.searchengines[i] = "chrome://" + config.id + "/" + searchengineFile.leafName;
      }
    }
  }

  // certs in resources/certs
  // extension in resources/extensions
  // proxy config file in resources/proxyconfig
  var preferencesFile = dir.clone();
  preferencesFile.append("default");
  preferencesFile.append("preferences");
  preferencesFile.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
  preferencesFile.append("prefs.js");
  delete config.extension;
  var defaultPrefs = defaultPrefsTemplate.replace("%config%", JSON.stringify(config).replace(/"/g, "\\\""));
  numFilesToWrite += 1;
  writeFile(preferencesFile, defaultPrefs, function() {
    numFilesToWrite -= 1;
  });
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
