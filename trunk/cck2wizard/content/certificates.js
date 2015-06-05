var gCertificatesListbox = null;
var gServerCertsListbox = null;
var gCertOverridesListbox = null;
var gDevicesListbox = null;

function onCertificatesLoad() {
  gCertificatesListbox = document.getElementById("certificates-listbox");
  gServerCertsListbox = document.getElementById("servercerts-listbox");
  gCertOverridesListbox = document.getElementById("certoverrides-listbox");
  gDevicesListbox = document.getElementById("devices-listbox");
}
window.addEventListener("load", onCertificatesLoad, false);

function setCertificates(config) {
  if ("certs" in config) {
    if ("ca" in config.certs) {
      for (var i=0; i < config.certs.ca.length; i++) {
        var listitem;
        if (/^https?:/.test(config.certs.ca[i].url)) {
          listitem = gCertificatesListbox.appendItem(config.certs.ca[i].url, config.certs.ca[i].trust);
        } else {
          var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
          try {
            file.initWithPath(config.certs.ca[i].url);
          } catch (e) {
            try {
              file.initWithPath(config.outputDirectory + config.certs.ca[i].url);
            } catch(e) {
              file = null;
            }
          }
          if (file) {
            listitem = gCertificatesListbox.appendItem(file.leafName, config.certs.ca[i].trust);
          } else {
            listitem = gCertificatesListbox.appendItem(config.certs.ca[i].url, config.certs.ca[i].trust);           
          }
        }
        listitem.setAttribute("tooltiptext", config.certs.ca[i].url);
        listitem.setAttribute("path", config.certs.ca[i].url);
        listitem.setAttribute("context", "certificate-contextmenu");
      }
    }
    if ("server" in config.certs) {
      for (var i=0; i < config.certs.server.length; i++) {
        var listitem;
        if (/^https?:/.test(config.certs.server[i])) {
          listitem = gServerCertsListbox.appendItem(config.certs.server[i],  config.certs.server[i]);
        } else {
          var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
          try {
            file.initWithPath(config.certs.server[i]);
          } catch (e) {
            try {
              file.initWithPath(config.outputDirectory + config.certs.server[i]);
            } catch (e) {
              file = null;
            }
          }
          if (file) {
            listitem = gServerCertsListbox.appendItem(file.leafName,  config.certs.server[i]);
          } else {
            listitem = gServerCertsListbox.appendItem(config.certs.server[i],  config.certs.server[i]);
          }
        }
        listitem.setAttribute("tooltiptext", config.certs.server[i], config.certs.server[i]);
        listitem.setAttribute("context", "servercert-contextmenu");
      }
    }
    if ("override" in config.certs) {
      for (var i=0; i < config.certs.override.length; i++) {
        var listitem = gCertOverridesListbox.appendItem(config.certs.override[i]);
        listitem.setAttribute("context", "certoverride-contextmenu");
      }
    }
    if ("devices" in config.certs) {
      for (var i=0; i < config.certs.devices.length; i++) {
        var listitem = gDevicesListbox.appendItem(config.certs.devices[i].name, config.certs.devices[i].path);
        listitem.setAttribute("context", "devices-contextmenu");
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
      cert.url = gCertificatesListbox.getItemAtIndex(i)
                                     .getAttribute("path")
                                     .replace(config.outputDirectory, "");
      cert.trust = gCertificatesListbox.getItemAtIndex(i).getAttribute("value");
      config.certs.ca.push(cert);
    }
  }
  if (gServerCertsListbox.itemCount > 0) {
    if (!("certs" in config)) {
      config.certs = {};
    }
    config.certs.server = [];
    
    for (var i=0; i < gServerCertsListbox.itemCount; i++) {
      config.certs.server.push(gServerCertsListbox.getItemAtIndex(i)
                                                  .getAttribute("value")
                                                  .replace(config.outputDirectory, ""));
    }
  }
  if (gCertOverridesListbox.itemCount > 0) {
    if (!("certs" in config)) {
      config.certs = {};
    }
    config.certs.override = [];
    
    for (var i=0; i < gCertOverridesListbox.itemCount; i++) {
      config.certs.override.push(gCertOverridesListbox.getItemAtIndex(i).getAttribute("label"));
    }
  }
  if (gDevicesListbox.itemCount > 0) {
    if (!("certs" in config)) {
      config.certs = {};
    }
    config.certs.devices = [];
    
    for (var i=0; i < gDevicesListbox.itemCount; i++) {
      var device = {};
      device.name = gDevicesListbox.getItemAtIndex(i).getAttribute("label");
      device.path = gDevicesListbox.getItemAtIndex(i).getAttribute("value");
      config.certs.devices.push(device);
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
    var uri = Services.io.newURI(url, null, null);
    if (uri.scheme != "https" && uri.scheme != "http") {
      showErrorMessage("invalidscheme");
      return;
    }
  } catch (ex) {
    showErrorMessage("invalidurl");
    return;
  }
  var certString = getCertString();
  if (certString) {
    var listitem = gCertificatesListbox.appendItem(url, certString);
    listitem.setAttribute("path", url);
    listitem.setAttribute("context", "certificate-contextmenu");
  }
}

function addServerCertificateFromURL() {
  var retVals = { url: null};
  window.openDialog("chrome://cck2wizard/content/url-dialog.xul", "cck2wizard-certificate", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  var url = retVals.url;
  try {
    var uri = Services.io.newURI(url, null, null);
    if (uri.scheme != "https" && uri.scheme != "http") {
      showErrorMessage("invalidscheme");
      return;
    }
  } catch (ex) {
    showErrorMessage("invalidurl");
    return;
  }
  var listitem = gServerCertsListbox.appendItem(url, url);
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

function getCertString() {
  var retVals = { certString: null};
  window.openDialog("chrome://cck2wizard/content/cert-dialog.xul", "cck2wizard-certificate", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return null;
  } else {
    return retVals.certString;
  }
}

function addCertificateFromFile() {
  var certFile = chooseFile(window);
  if (certFile) {
    var certString = getCertString();
    if (certString) {
      var listitem = gCertificatesListbox.appendItem(certFile.leafName, certString);
      listitem.setAttribute("path", certFile.path.replace(getOutputDirectory(), ""));
      listitem.setAttribute("tooltiptext", certFile.path.replace(getOutputDirectory(), ""));
      listitem.setAttribute("context", "certificate-contextmenu");
    }
  }
}

function addServerCertificateFromFile() {
  var certFile = chooseFile(window);
  if (certFile) {
    var listitem = gServerCertsListbox.appendItem(certFile.leafName, certFile.path.replace(getOutputDirectory(), ""));
    listitem.setAttribute("tooltiptext", certFile.path.replace(getOutputDirectory(), ""));
    listitem.setAttribute("context", "servercert-contextmenu");
  }
}

function addDevice() {
  var retVals = { deviceName: null, devicePath: null};
  window.openDialog("chrome://cck2wizard/content/device-dialog.xul", "cck2wizard-device", "modal,centerscreen", retVals);
  if (!retVals.cancel) {
    var listitem = gDevicesListbox.appendItem(retVals.deviceName, retVals.devicePath);
    listitem.setAttribute("context", "devices-contextmenu");
  }
}

function onEditDevice() {
  if (gDevicesListbox.selectedIndex == -1) {
    return;
  }
  var retVals = { deviceName: gDevicesListbox.selectedItem.label, devicePath: gDevicesListbox.selectedItem.value};
  window.openDialog("chrome://cck2wizard/content/device-dialog.xul", "cck2wizard-device", "modal,centerscreen", retVals);
  if (!retVals.cancel) {
    gDevicesListbox.selectedItem.label = retVals.deviceName;
    gDevicesListbox.selectedItem.value = retVals.devicePath;
  }
}

function onDeleteCertificate() {
  if (gCertificatesListbox.selectedIndex == -1) {
    return;
  }
  gCertificatesListbox.removeChild(gCertificatesListbox.selectedItem);
}

function onDeleteDevice() {
  if (gDevicesListbox.selectedIndex == -1) {
    return;
  }
  gDevicesListbox.removeChild(gDevicesListbox.selectedItem);
}

function onDeleteServerCertificate() {
  if (gServerCertsListbox.selectedIndex == -1) {
    return;
  }
  gServerCertsListbox.removeChild(gServerCertsListbox.selectedItem);
}

function onKeyPressCertificate(event) {
  if (event.target.selectedIndex == -1) {
    return;
  }
  if (event.keyCode == event.DOM_VK_DELETE ||
      event.keyCode == event.DOM_VK_BACK_SPACE) {
    event.target.removeChild(event.target.selectedItem);
  }
}
