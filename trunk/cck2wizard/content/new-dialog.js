function onLoad() {
  var initVals = window.arguments[0];
  if (initVals.name) {
    document.getElementById('name').value = initVals.name;
  }
  if (initVals.id) {
    document.getElementById('id').value = initVals.id;
  }
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.name = document.getElementById('name').value;
  retVals.id = document.getElementById('id').value;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
