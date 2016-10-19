const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

var gStringBundle;
var gFolder = false;

function onLoad() {
  var initVals = window.arguments[0];
  if (initVals.name) {
    document.getElementById('name').value = initVals.name;
  }
  if (initVals.location) {
    document.getElementById('location').value = initVals.location;
  }
  if (initVals.folder) {
    document.getElementById('location-hbox').hidden = true;
    window.sizeToContent();
    gFolder = true;
  }
  if (initVals.stringbundle) {
    gStringBundle = initVals.stringbundle;
  }
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.name = document.getElementById('name').value;
  if (gFolder) {
    return true;
  }
  var url = document.getElementById('location').value;
  try {
    Services.io.newURI(url, null, null);
    retVals.location = url;
  } catch (ex) {
    showErrorMessage("invalidurl");
    return false;
  }
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
