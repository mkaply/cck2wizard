var gExtensionID = null;
var gExtensionName = null;
var gExtensionVersion = null;
var gExtensionDescription = null;
var gExtensionCreator = null;
var gExtensionHomepage = null;
var gExtensionUpdateURL = null;
var gExtensionUpdateKey = null;
var gExtensionIcon = null;
var gExtensionFilename = null;

function onExtensionInfoLoad() {
  gExtensionID = document.getElementById("extension-id");
  gExtensionName = document.getElementById("extension-name");
  gExtensionVersion = document.getElementById("extension-version");
  gExtensionDescription = document.getElementById("extension-description");
  gExtensionCreator = document.getElementById("extension-creator");
  gExtensionHomepage = document.getElementById("extension-homepage");
  gExtensionUpdateURL = document.getElementById("extension-updateurl");
  gExtensionUpdateKey = document.getElementById("extension-updatekey");
  gExtensionIcon = document.getElementById("extension-icon");
  gExtensionFilename = document.getElementById("extension-filename");
}
window.addEventListener("load", onExtensionInfoLoad, false);


function setExtensionInfo(config) {
  if (!gExtensionName.value) {
    gExtensionName.value = config.name;
  }
}

function getExtensionInfo(config, destdir) {
  // 
  if (destdir) {
    
  } else {
    
    
  }
  return config;
}

function resetExtensionInfo() {
  
}

function onExtensionChooseIcon() {
  var iconfile = chooseFile(window);
  if (iconfile) {
    document.getElementById("extension-icon").setAttribute("src", Services.io.newFileURI(iconfile).spec);
  }
}
