var gExtensionName = null;
var gExtensionIcon = null;

function onExtensionInfoLoad() {
  gExtensionName = document.getElementById("extension-name");
  gExtensionIcon = document.getElementById("extension-icon");
}
window.addEventListener("load", onExtensionInfoLoad, false);

function setExtensionInfo(config) {
  if (!gExtensionName.value) {
    gExtensionName.value = config.name;
  }
  if ("extension" in config && "icon" in config.extension) {
    setIcon(config.extension.icon);
  }
}

function getExtensionInfo(config, destdir) {
  return config;
}

function resetExtensionInfo() {
  document.getElementById("extension-icon").removeAttribute("src");
}

function onExtensionChooseIcon() {
  var iconfile = chooseFile(window, document.querySelector("textbox[config='extension.icon']").value);
  if (iconfile) {
    document.getElementById("extension-icon").setAttribute("src", Services.io.newFileURI(iconfile).spec);
    document.querySelector("textbox[config='extension.icon']").value = iconfile.path;
  }
}

function setIcon(path) {
  var iconFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
  try {
    iconFile.initWithPath(path);
  } catch (e) {
    iconFile.initWithPath(getOutputDirectory() + path);
  }
  document.getElementById("extension-icon").setAttribute("src", Services.io.newFileURI(iconFile).spec);
}
