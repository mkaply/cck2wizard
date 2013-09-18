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
  // merge CCK2 chrome.manifest
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
