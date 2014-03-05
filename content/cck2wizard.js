const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");

var prefsPrefix = "extensions.cck2wizard.";

var gDeck = null;
var gTree = null;
var gStringBundle = null;
var gNewPanel = null;
var gAutoSave = false;

function onLoad() {
  try {
    gTree = document.getElementById("cck2wizard-tree");
    gDeck = document.getElementById("cck2wizard-deck");
    gTree.addEventListener("select", onPaneSelected, false);
    gStringBundle = document.getElementById("cck2wizard-string-bundle");
    var request = new XMLHttpRequest();
    request.open("GET", "http://mike.kaply.com/cck2-window/?json=1");
    request.onload = function() {
      var json = JSON.parse(request.responseText);
      var target = document.getElementById("cck2web");;
      var fragment = Components.classes["@mozilla.org/feed-unescapehtml;1"]
                               .getService(Components.interfaces.nsIScriptableUnescapeHTML)
                               .parseFragment(json.page.content, false, null, target);
      target.appendChild(fragment);      
//      document.getElementById("cck2web").textContent = json.page.custom_fields.message;
//      document.getElementById("cck2web").setAttribute("href", json.page.custom_fields.href);
    }
    request.send();
    //document.getElementById("cck2web").addEventListener("click", function(event) {
    //  var win = Services.wm.getMostRecentWindow("navigator:browser");
    //  win.openUILinkIn(event.target.getAttribute("href"), "tab");
    //  window.close();
    //}, false);
    var debug = false;
    try {
      debug = Services.prefs.getBoolPref(prefsPrefix + "debug");
    } catch (ex) {}
    if (debug){
      document.getElementById("debug-menuitem").hidden = false;
    }
    try {
      gAutoSave = Services.prefs.getBoolPref(prefsPrefix + "autosave");
      document.getElementById("cck2wizard-autosave").setAttribute("checked", gAutoSave);
    } catch (e) {}

  } catch(e) {
    errorCritical(e);
  }
}
window.addEventListener("load", onLoad, false);

var gCurrentConfig = null;

function onFilePopup(event) {
  if (gCurrentConfig) {
    document.getElementById("save-menuitem").disabled = false;
    document.getElementById("export-menuitem").disabled = false;
    document.getElementById("debug-menuitem").disabled = false;
  } else {
    document.getElementById("save-menuitem").disabled = true;
    document.getElementById("export-menuitem").disabled = true;
    document.getElementById("debug-menuitem").disabled = true;
  }
}

function onRecentPopup(event) {
  var configs = Services.prefs.getChildList(prefsPrefix + "configs.", []);
  var recentMenuPopup = event.target;
  while (recentMenuPopup.firstChild) {
    recentMenuPopup.removeChild(recentMenuPopup.firstChild)
  }
  if (configs.length > 0) {
    for (var i=0; i < configs.length; i++) {
      var menuitem = document.createElement("menuitem");
      menuitem.setAttribute("type", "checkbox");
      try {
        config = JSON.parse(Services.prefs.getCharPref(configs[i]))
        menuitem.setAttribute("label", config.name);
        menuitem.config = config;
        if (gCurrentConfig && gCurrentConfig.id == config.id) {
          menuitem.setAttribute("checked", "true");
        }
        recentMenuPopup.appendChild(menuitem);
      } catch(e) {}
    }
  } else {
      var menuitem = document.createElement("menuitem");
      menuitem.setAttribute("label", "(none)");
      menuitem.setAttribute("disabled", "true");
      recentMenuPopup.appendChild(menuitem);
  }
}

function onOpenRecent(event) {
  var config = event.target.config;
  // If we're trying to switch to the current config, just ignore
  if (gCurrentConfig && config.id == gCurrentConfig.id) {
    return;
  }
  if (!checkToSave()) {
    return;
  }
  setConfig(config);
  gCurrentConfig = config;
  document.getElementById("main-deck").selectedIndex = 1;
  gTree.view.selection.select(0);

}

function onAutosave() {
  gAutoSave = !gAutoSave;
  document.getElementById("cck2wizard-autosave").setAttribute("checked", gAutoSave);
  Services.prefs.setBoolPref(prefsPrefix + "autosave", gAutoSave);
}

function onImport() {
  try {
    if (!checkToSave()) {
      return;
    }
    var configFile = chooseFile(window);
    if (configFile) {
      readFile(configFile, function(configFileContent) {
        try {
          var config = JSON.parse(configFileContent);
          if (Services.prefs.prefHasUserValue(prefsPrefix + "configs." +config.id)) {
            Services.prompt.alert(window, "CCK2", "A config with that ID already exists.");
            return;
          }
          setConfig(config);
          // This seems odd, but the imported JSON doesn't match
          // the order of the regular JSON. I want it to.
          config = getConfig();
          setConfig(config);
          document.getElementById("main-deck").selectedIndex = 1;
          gTree.view.selection.select(0);
        } catch(e) {
          if (configFileContent.substr(0, 3) != "id=") {
            // See if we can pull a config from an XPI
            var zipReaderCache = Cc["@mozilla.org/libjar/zip-reader-cache;1"].createInstance(Ci.nsIZipReaderCache);
            try {
              var zipReader = zipReaderCache.getZip(configFile);
              var cckConfigStream;
              try {
                cckConfigStream = zipReader.getInputStreamWithSpec(null, "cck.config");
              } catch (e) {
                cckConfigStream = zipReader.getInputStreamWithSpec(null, "cck2.config.json");
              }
              var scriptableStream = Cc["@mozilla.org/scriptableinputstream;1"].
                                     getService(Ci.nsIScriptableInputStream);
              scriptableStream.init(cckConfigStream);
              configFileContent = scriptableStream.read(cckConfigStream.available());
              scriptableStream.close();
              cckConfigStream.close();
            } catch (e) {}
          }
          if (configFileContent.substr(0, 3) == "id=") {
            try {
              var config = importCCKFile(configFileContent);
              setConfig(config);
              document.getElementById("main-deck").selectedIndex = 1;
              gTree.view.selection.select(0);              
            } catch (e) {
              errorCritical(e);
            }
          } else {
            try {
              var config = JSON.parse(configFileContent);
              if (Services.prefs.prefHasUserValue(prefsPrefix + "configs." +config.id)) {
                Services.prompt.alert(window, "CCK2", "A config with that ID already exists.");
                return;
              }
              setConfig(config);
              // This seems odd, but the imported JSON doesn't match
              // the order of the regular JSON. I want it to.
              config = getConfig();
              setConfig(config);
              document.getElementById("main-deck").selectedIndex = 1;
              gTree.view.selection.select(0);
            } catch(e) {
              Services.prompt.alert(window, "CCK2", "Unable to process file");
            }
          }
        }
      }, errorCritical)
    }
  } catch(e) {
    errorCritical(e);
  }
}

function objectEquals(x, y) {
    // if both are function
    if (x instanceof Function) {
        if (y instanceof Function) {
            return x.toString() === y.toString();
        }
        return false;
    }
    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }

    // if one of them is date, they must had equal valueOf
    if (x instanceof Date) { return false; }
    if (y instanceof Date) { return false; }

    // if they are not function or strictly equal, they both need to be Objects
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }

    var p = Object.keys(x);
    return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) ?
            p.every(function (i) { return objectEquals(x[i], y[i]); }) : false;
}

// Returns true if it is OK to continue, false if not
function checkToSave() {
  var newConfig = getConfig();
//  if (gCurrentConfig && (JSON.stringify(newConfig)  != JSON.stringify(gCurrentConfig))) {
  if (gCurrentConfig && (!objectEquals(newConfig, gCurrentConfig))) {
    if (gAutoSave) {
      return onSave();
    }
    var buttonFlags = (Services.prompt.BUTTON_POS_0) * (Services.prompt.BUTTON_TITLE_YES) +
                      (Services.prompt.BUTTON_POS_1) * (Services.prompt.BUTTON_TITLE_CANCEL) +
                      (Services.prompt.BUTTON_POS_2) * (Services.prompt.BUTTON_TITLE_NO) +
                      Services.prompt.BUTTON_POS_2_DEFAULT;
    var check = {value: true};
    var confirm = Services.prompt.confirmEx(window,
                                          gStringBundle.getString("titlebar"),
                                          gStringBundle.getString("unsavedChanges"),
                                          buttonFlags,
                                          null,
                                          null,
                                          null,
                                          null,
                                          {});
    if (confirm == 1) {
      // Cancel or Escape pressed
      return false;
    }
    if (confirm == 0) {
      return onSave();
    }
  }
  return true;
}

function onNew() {
  if (!checkToSave()) {
    return false;
  }
  var retVals = { name: null, id: null, stringbundle: gStringBundle};
  window.openDialog("chrome://cck2wizard/content/new-dialog.xul", "cck2wizard-new", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return false;
  }
  if (!retVals.name || !retVals.id) {
    Services.prompt.alert(window, "CC2", "Name and ID are required");
    return false;
  }
  if (Services.prefs.prefHasUserValue(prefsPrefix + "configs." + retVals.id)) {
    Services.prompt.alert(window, "CCK2", "A config with that ID already exists.");
    return false;
  }
  setConfig({name: retVals.name, id: retVals.id})
  document.getElementById("main-deck").selectedIndex = 1;
  gTree.view.selection.select(0);
  updateNextPreviousButtons();
  return true;

}

function onCloseWindow() {
  return checkToSave();  
}

function onClose() {
  if (checkToSave()) {
    window.close();
  }
}

function onSave() {
  var config = getConfig();
  var configJSON = JSON.stringify(config);
  Services.prefs.setCharPref(prefsPrefix + "configs." + config.id, JSON.stringify(config))
  gCurrentConfig = config;
  return true;
}

function onDebug() {
  window.openDialog("chrome://cck2wizard/content/debug-dialog.xul", "cck2wizard-debug", "modal,centerscreen", gCurrentConfig, getConfig());
}

function onExport() {
  var configJSON = JSON.stringify(getConfig(), null, 2);
  var configFile = saveFile(window, "cck2config.json");
  if (configFile) {
    writeFile(configFile, configJSON);
  }
}

function selectPane(name) {
  var tbo = gTree.treeBoxObject;
  for (var i=0; i < gTree.view.rowCount; i++) {
    var cellValue = gTree.view.getCellValue(i, tbo.columns.getColumnAt(0));
    if (cellValue == name) {
      gTree.view.selection.select(i); 
      break;
    }
  }
  gDeck.selectedPanel = document.getElementById(name);
}

function onPaneSelected() {
  try {
    var tbo = gTree.treeBoxObject;
    var cellValue = gTree.view.getCellValue(gTree.currentIndex, tbo.columns.getColumnAt(0));
    gDeck.selectedPanel = document.getElementById(cellValue);
    updateNextPreviousButtons();
  } catch (e) {
    errorCritical(e);
  }
}

function updateNextPreviousButtons() {
  if (gTree.currentIndex == 0) {
    document.getElementById("previous").disabled = true;
    document.getElementById("next").disabled = false;
  } else {
    if (gTree.currentIndex == gTree.view.rowCount - 1) {
      document.getElementById("previous").disabled = false;
      document.getElementById("next").disabled = true;
    } else {
      document.getElementById("previous").disabled = false;
      document.getElementById("next").disabled = false;      
    }
  }
}

function onNext() {
  gTree.view.selection.select(gTree.currentIndex+1);
  updateNextPreviousButtons();
}

function onPrevious() {
  gTree.view.selection.select(gTree.currentIndex-1);
  updateNextPreviousButtons();
}

/** This function sets all of the user interface elements based on a
  * config file.
  */
function setConfig(config) {
  try {
    resetConfig();
    // If items have a config value, they can be saved directly into the config
    // using that value.
    var textboxes = gDeck.querySelectorAll("textbox[config]");
    for (var i=0; i < textboxes.length; i++) {
      var configPath = textboxes[i].getAttribute("config").split('.');
      if (configPath.length > 1) {
        if (configPath[0] in config &&
            [configPath[1]] in config[configPath[0]]) {
          textboxes[i].value = config[configPath[0]][configPath[1]];
        }
      } else {
        if (configPath[0] in config) {
          textboxes[i].value = config[configPath[0]];
        }
      }
    }
    var checkboxes = gDeck.querySelectorAll("checkbox[config]");
    for (var i=0; i < checkboxes.length; i++) {
      var configPath = checkboxes[i].getAttribute("config").split('.');
      if (configPath.length > 1) {
        if (configPath[0] in config &&
            [configPath[1]] in config[configPath[0]]) {
          checkboxes[i].checked = config[configPath[0]][configPath[1]];
        }
      } else {
        if (configPath[0] in config) {
          checkboxes[i].checked = config[configPath[0]];
        }
      }
    }
    var setconfigs = gDeck.querySelectorAll("*[setconfig]");
    for (var i=0; i < setconfigs.length; i++) {
      var setconfig = setconfigs[i].getAttribute("setconfig");
      window[setconfig](config);
    }
    gCurrentConfig = config;
    document.title = "CCK2 - " + config.name;
  } catch (e) {
    errorCritical(e);
  }
  return config;
}


/** This function queries all of the user interface elements to create a
  * config file.
  */
function getConfig(destdir) {
  try {
    var config = {};
    // If items have a config value, they can be saved directly into the config
    // using that value.
    var textboxes = gDeck.querySelectorAll("textbox[config]");
    for (var i=0; i < textboxes.length; i++) {
      if (textboxes[i].value) {
        var value;
        if (textboxes[i].type == "number") {
          value = parseInt(textboxes[i].value, 10);
          // Ignore numeric 0 values.
          if (value == 0) {
            continue;
          }
        } else {
          value = textboxes[i].value;
        }
        var configPath = textboxes[i].getAttribute("config").split('.');
        if (configPath.length > 1) {
          if (!(configPath[0] in config)) {
            config[configPath[0]] = {};
          }
          config[configPath[0]][configPath[1]] = value;
        } else {
          config[configPath[0]] = value;
        }
      }
    }
    var checkboxes = gDeck.querySelectorAll("checkbox[config]");
    for (var i=0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        var configPath = checkboxes[i].getAttribute("config").split('.');
        if (configPath.length > 1) {
          if (!(configPath[0] in config)) {
            config[configPath[0]] = {};
          }
          config[configPath[0]][configPath[1]] = true;
        } else {
          config[configPath[0]] = true;
        }
      }
    }
    var getconfigs = gDeck.querySelectorAll("*[getconfig]");
    for (var i=0; i < getconfigs.length; i++) {
      var getconfig = getconfigs[i].getAttribute("getconfig");
      config = window[getconfig](config, destdir);
    }
  } catch (e) {
    errorCritical(e);
  }
  return config;
}

/** This function resets all of the user interface elements
  */
function resetConfig() {
  try {
    var checkboxes = gDeck.querySelectorAll("checkbox[config]");
    for (var i=0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }
    var textboxes = gDeck.querySelectorAll("textbox[config]");
    for (var i=0; i < textboxes.length; i++) {
      textboxes[i].value = "";
    }
    var resetconfigs = gDeck.querySelectorAll("*[resetconfig]");
    for (var i=0; i < resetconfigs.length; i++) {
      var resetconfig = resetconfigs[i].getAttribute("resetconfig");
      window[resetconfig]();
    }
  } catch (e) {
    errorCritical(e);
  }
}

function showErrorMessage(id) {
  Services.prompt.alert(window,
                        gStringBundle.getString("titlebar"),
                        gStringBundle.getString(id));
}

function chooseFile(win, path) {
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  fp.init(win, "", Ci.nsIFilePicker.modeOpen);
  if (path) {
    var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    file.initWithPath(path);
    fp.defaultString = file.leafName;
    fp.displayDirectory = file;
  }
  fp.appendFilters(Ci.nsIFilePicker.filterAll);
  if (fp.show() == Ci.nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    return fp.file;
  }
  return null;
}

function saveFile(win, filename) {
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  fp.init(win, "", Ci.nsIFilePicker.modeSave);
  fp.defaultString = filename;
  fp.appendFilters(Ci.nsIFilePicker.filterAll);
  if (fp.show() == Ci.nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    return fp.file;
  }
  return null;
}

function chooseDir(win, dir) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  fp.init(win, "", nsIFilePicker.modeGetFolder);
  if (dir) {
    var dirFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
    dirFile.initWithPath(dir);
    fp.displayDirectory = dirFile;
  }
  if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    return fp.file;
  }
  return null;
}
