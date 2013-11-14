var gCertificatesListbox = null;

function onCertificatesLoad() {
  gCertificatesListbox = document.getElementById("certificates-listbox");
}
window.addEventListener("load", onCertificatesLoad, false);

function setCertificates(config) {
  if ("certs" in config) {
    if ("ca" in config.certs) {
      for (var i=0; i < config.certs.ca.length; i++) {
        listitem = gCertificatesListbox.appendItem(config.certs.ca[i].url, config.certs.ca[i].trust);
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
  return config;
}

function resetCertificates() {
  while (gCertificatesListbox.itemCount > 0) {
    gCertificatesListbox.removeItemAt(0);
  }
}

function addCertificateFromURL() {
  var retVals = { name: null, location: null};
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
}

function addCertificateFromFile() {
  var searchengineFile = chooseFile(window);
  if (searchengineFile) {
    var listitem = gCertificatesListbox.appendItem(searchengineFile.path, "C,C,C");
  }
}

function onDeleteCertificate() {
  if (gCertificatesListbox.selectedIndex == -1) {
    return;
  }
  gCertificatesListbox.removeChild(gCertificatesListbox.selectedItem);
}

function onKeyPressCertificate(event) {
  if (event.keyCode == event.DOM_VK_DELETE ||
      event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeleteCertificate();
  }
}
