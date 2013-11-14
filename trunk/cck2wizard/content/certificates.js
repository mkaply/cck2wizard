var gCertificatesListbox = null;
var gServerCertsListbox = null;
var gCertOverridesListbox = null;

function onCertificatesLoad() {
  gCertificatesListbox = document.getElementById("certificates-listbox");
  gServerCertsListbox = document.getElementById("servercerts-listbox");
  gCertOverridesListbox = document.getElementById("certoverrides-listbox");
}
window.addEventListener("load", onCertificatesLoad, false);

function setCertificates(config) {
  if ("certs" in config) {
    if ("ca" in config.certs) {
      for (var i=0; i < config.certs.ca.length; i++) {
        var listitem = gCertificatesListbox.appendItem(config.certs.ca[i].url, config.certs.ca[i].trust);
        listitem.setAttribute("context", "certificate-contextmenu");
      }
    }
    if ("server" in config.certs) {
      for (var i=0; i < config.certs.server.length; i++) {
        var listitem = gServerCertsListbox.appendItem(config.certs.server[i]);
        listitem.setAttribute("context", "servercert-contextmenu");
      }
    }
    if ("override" in config.certs) {
      for (var i=0; i < config.certs.override.length; i++) {
        var listitem = gCertOverridesListbox.appendItem(config.certs.override[i]);
        listitem.setAttribute("context", "certoverride-contextmenu");
      }
    }
  }
}

function getCertificates(config) {
  if (gCertificatesListbox.itemCount > 0) {
    if (!("certs" in config)) {
      config.certs = {};
    }
    config.certs.ca = [];
    
    for (var i=0; i < gCertificatesListbox.itemCount; i++) {
      var cert = {};
      cert.url = gCertificatesListbox.getItemAtIndex(i).label;
      cert.trust = gCertificatesListbox.getItemAtIndex(i).value;
      config.certs.ca.push(cert);
    }
  }
  if (gServerCertsListbox.itemCount > 0) {
    if (!("certs" in config)) {
      config.certs = {};
    }
    config.certs.server = [];
    
    for (var i=0; i < gServerCertsListbox.itemCount; i++) {
      config.certs.server.push(gServerCertsListbox.getItemAtIndex(i).label);
    }
  }
  if (gCertOverridesListbox.itemCount > 0) {
    if (!("certs" in config)) {
      config.certs = {};
    }
    config.certs.override = [];
    
    for (var i=0; i < gCertOverridesListbox.itemCount; i++) {
      config.certs.override.push(gCertOverridesListbox.getItemAtIndex(i).label);
    }
  }
  return config;
}

function resetCertificates() {
  while (gCertificatesListbox.itemCount > 0) {
    gCertificatesListbox.removeItemAt(0);
  }
  while (gServerCertsListbox.itemCount > 0) {
    gServerCertsListbox.removeItemAt(0);
  }
  while (gCertOverridesListbox.itemCount > 0) {
    gCertOverridesListbox.removeItemAt(0);
  }
}

function addCertificateFromURL() {
  var retVals = { url: null};
  window.openDialog("chrome://cck2wizard/content/url-dialog.xul", "cck2wizard-certificate", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  var url = retVals.url;
  try {
    Services.io.newURI(url, null, null);
  } catch (ex) {
    showErrorMessage("invalidurl");
    return;
  }
  var listitem = gCertificatesListbox.appendItem(url, "C,C,C");
  listitem.setAttribute("context", "certificate-contextmenu");
}

function addServerCertificateFromURL() {
  var retVals = { url: null};
  window.openDialog("chrome://cck2wizard/content/url-dialog.xul", "cck2wizard-certificate", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  var url = retVals.url;
  try {
    Services.io.newURI(url, null, null);
  } catch (ex) {
    showErrorMessage("invalidurl");
    return;
  }
  var listitem = gServerCertsListbox.appendItem(url);
  listitem.setAttribute("context", "servercert-contextmenu");
}

function addCertificateOverride() {
  var retVals = { url: null};
  window.openDialog("chrome://cck2wizard/content/url-dialog.xul", "cck2wizard-certificate", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  var url = retVals.url;
  var listitem = gCertOverridesListbox.appendItem(url);
  listitem.setAttribute("context", "certoverride-contextmenu");
}

function addCertificateFromFile() {
  var certFile = chooseFile(window);
  if (certFile) {
    var listitem = gCertificatesListbox.appendItem(certFile.path, "C,C,C");
    listitem.setAttribute("context", "certificate-contextmenu");
  }
}

function addServerCertificateFromFile() {
  var certFile = chooseFile(window);
  if (certFile) {
    var listitem = gServerCertsListbox.appendItem(certFile.path, "C,C,C");
    listitem.setAttribute("context", "servercert-contextmenu");
  }
}

function onDeleteCertificate() {
  if (gCertificatesListbox.selectedIndex == -1) {
    return;
  }
  gCertificatesListbox.removeChild(gCertificatesListbox.selectedItem);
}

function onDeleteServerCertificate() {
  if (gServerCertsListbox.selectedIndex == -1) {
    return;
  }
  gServerCertsListbox.removeChild(gServerCertsListbox.selectedItem);
}

function onKeyPressCertificate(event) {
  if (event.keyCode == event.DOM_VK_DELETE ||
      event.keyCode == event.DOM_VK_BACK_SPACE) {
  }
  if (event.target.selectedIndex == -1) {
    return;
  }
  event.target.removeChild(event.target.selectedItem);
}
