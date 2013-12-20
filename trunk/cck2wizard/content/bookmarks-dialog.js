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
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.name = document.getElementById('name').value;
  retVals.location = document.getElementById('location').value;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
