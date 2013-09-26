var gRootKey = null;
var gKey = null;
var gName = null;
var gValue = null;
var gType = null;

function onLoad() {
  gRootKey = document.getElementById("RootKey");
  gKey = document.getElementById("Key");
  gName = document.getElementById("Name");
  gValue = document.getElementById("Value");
  gType = document.getElementById("Type");
  var initVals = window.arguments[0];
  if ("rootkey" in initVals) {
    gRootKey.value = initVals.rootkey;
  }
  if ("key" in initVals) {
    gKey.value = initVals.key;
  }
  if ("name" in initVals) {
    gName.value = initVals.name;
  }
  if ("value" in initVals) {
    gValue.value = initVals.value;
  }
  if ("type" in initVals) {
    gType.value = initVals.type;
  }
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.rootkey= gRootKey.value;;
  retVals.key = gKey.value;
  retVals.name = gName.value;
  retVals.value = gValue.value;
  retVals.type = gType.value;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
