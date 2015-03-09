function onLoad() {
}

function updateTrustString() {
  trustString = "";
  if (document.getElementById("trustSSLServer").checked) {
    trustString += "C";
  }
  if (document.getElementById("trustSSLClient").checked) {
    trustString += "T";
  }
  if (document.getElementById("trustSSLForce").checked) {
    trustString += "c";
  }
  trustString += ",";
  if (document.getElementById("trustEmailServer").checked) {
    trustString += "C";
  }
  if (document.getElementById("trustEmailClient").checked) {
    trustString += "T";
  }
  if (document.getElementById("trustEmailForce").checked) {
    trustString += "c";
  }
  trustString += ",";
  if (document.getElementById("trustObjSignServer").checked) {
    trustString += "C";
  }
  if (document.getElementById("trustObjSignClient").checked) {
    trustString += "T";
  }
  if (document.getElementById("trustObjSignForce").checked) {
    trustString += "c";
  }
  document.getElementById("trustString").value = trustString;
}

function parseTrustString(trustString) {
  var trust = trustString.split(",");
  if (trustString[0].indexOf('C') != -1) {
    document.getElementById("trustSSLServer").checked = true;
  }
  if (trustString[1].indexOf('C') != -1) {
    document.getElementById("trustEmailServer").checked = true;
  }
  if (trustString[2].indexOf('C') != -1) {
    document.getElementById("trustObjSignServer").checked = true;
  }
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.certString = document.getElementById("trustString").value;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}
