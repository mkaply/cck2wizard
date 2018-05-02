function onLoad() {
  var retVals = window.arguments[0];
  if (retVals.certString) {
    parseTrustString(retVals.certString);
  }
  document.getElementById("trustString").value = retVals.certString;
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
  if (trust[0].indexOf('C') != -1) {
    document.getElementById("trustSSLServer").checked = true;
  }
  if (trust[0].indexOf('T') != -1) {
    document.getElementById("trustSSLClient").checked = true;
  }
  if (trust[0].indexOf('c') != -1) {
    document.getElementById("trustSSLForce").checked = true;
  }
  if (trust[1].indexOf('C') != -1) {
    document.getElementById("trustEmailServer").checked = true;
  }
  if (trust[1].indexOf('T') != -1) {
    document.getElementById("trustEmailClient").checked = true;
  }
  if (trust[1].indexOf('c') != -1) {
    document.getElementById("trustEmailForce").checked = true;
  }
  if (trust[2].indexOf('C') != -1) {
    document.getElementById("trustObjSignServer").checked = true;
  }
  if (trust[2].indexOf('T') != -1) {
    document.getElementById("trustObjSignClient").checked = true;
  }
  if (trust[2].indexOf('c') != -1) {
    document.getElementById("trustObjSignForce").checked = true;
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
