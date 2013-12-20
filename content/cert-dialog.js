function onLoad() {
  document.getElementById("trustSSL").checked = true;
  document.getElementById("trustEmail").checked = true;
  document.getElementById("trustObjSign").checked = true;
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.certString = "";
  if (document.getElementById("trustSSL").checked) {
    retVals.certString += "C,";
  } else {
    retVals.certString += "c,";
  }
  if (document.getElementById("trustEmail").checked) {
    retVals.certString += "C,";
  } else {
    retVals.certString += "c,";
  }
  if (document.getElementById("trustObjSign").checked) {
    retVals.certString += "C";
  } else {
    retVals.certString += "c";
  }
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
