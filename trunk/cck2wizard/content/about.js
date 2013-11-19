var gName = null;
var gID = null;

function onAboutLoad() {
  gName = document.getElementById("name");
  gID = document.getElementById("id");
}
window.addEventListener("load", onAboutLoad, false);

function setAbout(config) {
  gName.setAttribute("value", config.name);
  gID.setAttribute("value", config.id);
}

function getAbout(config) {
  config.name = gName.value;
  config.id = gID.value;
  return config;
}

function deleteConfig() {
  var buttonFlags = (Services.prompt.BUTTON_POS_0) * (Services.prompt.BUTTON_TITLE_YES) +
                    (Services.prompt.BUTTON_POS_1) * (Services.prompt.BUTTON_TITLE_NO) +
                    Services.prompt.BUTTON_POS_1_DEFAULT;
  var check = {value: true};
  var confirm = Services.prompt.confirmEx(window,
                                        gStringBundle.getString("titlebar"),
                                        gStringBundle.getString("confirmdelete"),
                                        buttonFlags,
                                        null,
                                        null,
                                        null,
                                        null,
                                        {});
  if (confirm == 1) {
    // Cancel or Escape pressed
    return;
  }
  Services.prefs.clearUserPref("extensions.cck2wizard.configs." + gCurrentConfig.id);
  gCurrentConfig = null;
  resetConfig();
  document.getElementById("main-deck").selectedIndex = 0;
}

function copyConfig() {
  var retVals = { name: gCurrentConfig.name, id: gCurrentConfig.id, stringbundle: gStringBundle};
  window.openDialog("chrome://cck2wizard/content/new-dialog.xul", "cck2wizard-new", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return false;
  }
  if (!retVals.name || !retVals.id) {
    alert("Name and ID are required");
    return false;
  }
  if (Services.prefs.prefHasUserValue(prefsPrefix + "configs." + retVals.id)) {
    alert("A config with that ID already exists");
    return false;
  }
  var newConfig = getConfig();
  newConfig.name = retVals.name;
  newConfig.id = retVals.id;
  Services.prefs.setCharPref(prefsPrefix + "configs." + retVals.id, JSON.stringify(newConfig))
  setConfig(newConfig);
  document.getElementById("main-deck").selectedIndex = 1;
  gTree.view.selection.select(0);
  updateNextPreviousButtons();
  return true;
}