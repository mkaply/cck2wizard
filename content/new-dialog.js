const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

var gStringBundle;

function onLoad() {
  var initVals = window.arguments[0];
  if (initVals.name) {
    document.getElementById('name').value = initVals.name;
  }
  if (initVals.id) {
    document.getElementById('id').value = initVals.id;
  }
  if (initVals.stringbundle) {
    gStringBundle = initVals.stringbundle;
  }
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.name = document.getElementById('name').value;
  retVals.id = document.getElementById('id').value;
  // Make sure ID doesn't contain spaces or slashes
  var alphaExp = /[//\\\s]/;
  if (alphaExp.test(retVals.id)) {
    Services.prompt.alert(window,
                          gStringBundle.getString("titlebar"),
                          gStringBundle.getString("invalidid"));
    return false;
  }
  return true;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
