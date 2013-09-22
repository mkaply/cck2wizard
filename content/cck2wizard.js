const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");

var prefsPrefix = "extensions.cck2wizard.";

var gDeck = null;
var gTree = null;
var gStringBundle = null;
var gNewPanel = null;

function onLoad() {
  try {
    gTree = document.getElementById("cck2wizard-tree");
    gDeck = document.getElementById("cck2wizard-deck");
    gTree.addEventListener("select", onPaneSelected, false);
    gStringBundle = document.getElementById("cck2wizard-string-bundle");
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
  } else {
    document.getElementById("save-menuitem").disabled = true;
    document.getElementById("export-menuitem").disabled = true;
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
          setConfig(config);
          // This seems odd, but the imported JSON doesn't match
          // the order of the regular JSON. I want it to.
          config = getConfig();
          setConfig(config);
          document.getElementById("main-deck").selectedIndex = 1;
        } catch(e) {
          if (configFileContent.substr(0, 3) == "id=") {
            try {
              var config = importCCKFile(configFileContent);
              setConfig(config);
              document.getElementById("main-deck").selectedIndex = 1;
            } catch (e) {
              errorCritical(e);
            }
          } else {
            alert("INVALID FILE");
          }
        }
      }, errorCritical)
    }
  } catch(e) {
    errorCritical(e);
  }
}

// Returns true if it is OK to continue, false if not
function checkToSave() {
  var newConfig = getConfig();
  if (gCurrentConfig && (JSON.stringify(newConfig)  != JSON.stringify(gCurrentConfig))) {
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

function onNewPanelOK() {
  var newID = document.getElementById("cck2wizard-new-id").value;
  var newName = document.getElementById("cck2wizard-new-name").value;
  if (!newID || !newName) {
    alert("Name and ID are required");
    return false;
  }
  if (Services.prefs.prefHasUserValue(prefsPrefix + "configs." + newID)) {
    alert("A config with that ID already exists");
    return false;
  }
  setConfig({name: newName, id: newID})
  document.getElementById("main-deck").selectedIndex = 1;
  gTree.view.selection.select(0);
  updateNextPreviousButtons();
  return true;
}

function onNew() {
  if (!checkToSave()) {
    return;
  }
  openDialog("cck2wizard-new-dialog");
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

function onViewCurrentConfig() {
  alert(JSON.stringify(getConfig(), null, 2));
}

function onViewOriginalConfig() {
  alert(JSON.stringify(gCurrentConfig, null, 2));
}

function onExport() {
  var configJSON = JSON.stringify(getConfig(), null, 2);
  var configFile = chooseFile(window, "cck2config.json");
  if (configFile) {
    writeFile(configFile, configJSON);
  }
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
    var checkboxes = gDeck.querySelectorAll("checkbox[config]");
    for (var i=0; i < checkboxes.length; i++) {
      var configValue = checkboxes[i].getAttribute("config");
      if (configValue in config) {
        checkboxes[i].checked = config[configValue];
      }
    }
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
    var checkboxes = gDeck.querySelectorAll("checkbox[config]");
    for (var i=0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        config[checkboxes[i].getAttribute("config")] = true;
      }
    }
    var textboxes = gDeck.querySelectorAll("textbox[config]");
    for (var i=0; i < textboxes.length; i++) {
      if (textboxes[i].value) {
        var configPath = textboxes[i].getAttribute("config").split('.');
        if (configPath.length > 1) {
          if (!(configPath[0] in config)) {
            config[configPath[0]] = {};
          }
          config[configPath[0]][configPath[1]] = textboxes[i].value;
        } else {
          config[configPath[0]] = textboxes[i].value;
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

function chooseFile(win, filename) {
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  if (filename) {
    fp.init(win, "", Ci.nsIFilePicker.modeSave);
    fp.defaultString = filename;
  } else {
    fp.init(win, "", Ci.nsIFilePicker.modeOpen);
  }
  fp.appendFilters(Ci.nsIFilePicker.filterAll);
  if (fp.show() == Ci.nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    return fp.file;
  }
  return null;
}

function chooseDir(win) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
  fp.init(win, "", nsIFilePicker.modeGetFolder);
  if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    return fp.file;
  }
  return null;
}
