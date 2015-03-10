function onLoad() {
  var initVals = window.arguments[0];
  if (initVals.deviceName) {
    document.getElementById('deviceName').value = initVals.deviceName;
  }
  if (initVals.devicePath) {
    document.getElementById('devicePath').value = initVals.devicePath;
  }
}

function onFile() {
  var device = chooseFile(window);
  if (device) {
    document.getElementById('devicePath').value = device.path;
  }
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.deviceName = document.getElementById('deviceName').value;
  retVals.devicePath = document.getElementById('devicePath').value;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
