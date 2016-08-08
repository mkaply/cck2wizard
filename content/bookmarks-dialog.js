const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

var gStringBundle;

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
  }
  if (initVals.stringbundle) {
    gStringBundle = initVals.stringbundle;
  }
}

function onOK() {
  var url = document.getElementById('location').value;
  try {
    Services.io.newURI(url, null, null);
  } catch (ex) {
    showErrorMessage("invalidurl");
    return false;
  }
  var retVals = window.arguments[0];
  retVals.name = document.getElementById('name').value;
  retVals.location = url;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
