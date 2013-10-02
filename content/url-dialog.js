function onLoad() {
  var initVals = window.arguments[0];
  if (initVals.url) {
    document.getElementById('url').value = initVals.url;
  }
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.url = document.getElementById('url').value;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
