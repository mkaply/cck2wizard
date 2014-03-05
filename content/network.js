function setNetwork(config) {
  if (!("network" in config)) {
    return
  }
  if ("proxyType" in config.network) {
    $("networkProxyType").value = config.network.proxyType;
    selectProxyPanel(config.network.proxyType);
    if (config.network.proxyType == 1) {
      if ("proxySocksVersion" in config.network) {
        $("networkProxySOCKSVersion").value = config.network.proxySocksVersion;
      }
    }
  }
}

function getNetwork(config) {
  if ($("networkProxyType").hasAttribute("value")) {
    if (!("network" in config)) {
      config.network = {};
    }
    config.network.proxyType = parseInt($("networkProxyType").getAttribute("value"), 10);
    if (config.network.proxyType == 1) {
      config.network.proxySocksVersion = parseInt($("networkProxySOCKSVersion").value, 10);
    }
  } else {
    if ($("networkLock").checked) {
      config.network = {"locked": true};
    } else {
      delete(config.network);
    }
  }
  return config;
}

function resetNetwork() {
  $("networkProxyType").selectedIndex = 0;
  selectProxyPanel();
}

function onProxyType(event) {
  selectProxyPanel(parseInt(event.target.value, 10));
}

function selectProxyPanel(type) {
  switch (type) {
    case 0:
      $("networkProxyTypeDeck").selectedPanel = $("networkProxyTypeNoProxy");
      break;
    case 1:
      $("networkProxyTypeDeck").selectedPanel = $("networkProxyTypeManual");
      break;
    case 2:
      $("networkProxyTypeDeck").selectedPanel = $("networkProxyTypeAuto");
      break;
    case 4:
      $("networkProxyTypeDeck").selectedPanel = $("networkProxyTypeWPAD");
      break;
    case 5:
      $("networkProxyTypeDeck").selectedPanel = $("networkProxyTypeSystem");
      break;
    default:
      $("networkProxyTypeDeck").selectedIndex = $("networkProxyTypeDontChange");
      break;
  }  
}

function chooseProxyConfigURL() {
  var retVals = { url: null};
  window.openDialog("chrome://cck2wizard/content/url-dialog.xul", "cck2wizard-url", "modal,centerscreen", retVals);
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
  document.querySelector("textbox[config='network.proxyAutoConfig']").value = url;
  return;
}

function chooseProxyConfigFile() {
  var proxyConfigFile = chooseFile(window, document.querySelector("textbox[config='network.proxyAutoConfig']").value);
  if (!proxyConfigFile) {
    return;
  }
  document.querySelector("textbox[config='network.proxyAutoConfig']").value = proxyConfigFile.path;
}

function updateControl(id, disabled) {
  var control = document.getElementById(id);
  control.disabled = disabled;
  var labels = document.getElementsByAttribute("control", id);
  if (labels.length > 0)
    labels[0].disabled = disabled;
}

function updateProtocols(share) {
  var shared = ["networkProxySSL", "networkProxyFTP",
				"networkProxySOCKS"]
  var shared_ports = ["networkProxySSL_Port",
				"networkProxyFTP_Port",
				"networkProxySOCKS_Port"]

  for (i = 0; i < shared.length; i++)
    updateControl(shared[i], share.checked);
  for (i = 0; i < shared_ports.length; i++)
    updateControl(shared_ports[i], share.checked);
  if (share.checked) {
	var ProxyHTTP = document.getElementById("networkProxyHTTP").value;
	var ProxyHTTP_Port = document.getElementById("networkProxyHTTP_Port").value;
    for (i = 0; i < shared.length; i++) {
	  var control = document.getElementById(shared[i]);
	  control.backup = control.value;
	  control.value = ProxyHTTP;
    }
    for (i = 0; i < shared_ports.length; i++) {
	  var control = document.getElementById(shared_ports[i]);
	  control.backup = control.value;
	  control.value = ProxyHTTP_Port;
    }
  } else {
    for (i = 0; i < shared.length; i++) {
	  var control = document.getElementById(shared[i]);
	  if (control.backup) {
  	    control.value = control.backup;
	  } else {
		control.value = "";
	  }
    }
    for (i = 0; i < shared_ports.length; i++) {
	  var control = document.getElementById(shared_ports[i]);
	  if (control.backup) {
  	    control.value = control.backup;
	  } else {
		control.value = 0;
	  }
    }
  }
}