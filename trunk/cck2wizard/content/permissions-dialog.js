var gHost = null;
var gPopup = null;
var gInstall = null;
var gCookie = null;
var gPlugins = null;

function onLoad() {
  gHost = document.getElementById("host");
  gPopup = document.getElementById("popup");
  gInstall = document.getElementById("install");
  gCookie = document.getElementById("cookie");
  gPlugins = document.getElementById("plugins");
  var initVals = window.arguments[0];
  if (initVals.hasOwnProperty("host")) {
    gHost.value = initVals.host;
  }
  if (initVals.hasOwnProperty("popup")) {
    gPopup.value = initVals.popup;
  }
  if (initVals.hasOwnProperty("install")) {
    gInstall.value = initVals.install;
  }
  if (initVals.hasOwnProperty("cookie")) {
    gCookie.value = initVals.cookie;
  }
  if (initVals.hasOwnProperty("plugins")) {
    gPlugins.value = initVals.plugins;
  }
  checkToEnableOKButton();
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.host = gHost.value;
  if (gPopup.value) {
    retVals.popup = gPopup.value;
  }
  if (gInstall.value) {
    retVals.install = gInstall.value;
  }
  if (gCookie.value) {
    retVals.cookie = gCookie.value;
  }
  if (gPlugins.value) {
    retVals.plugins = gPlugins.value;
  }
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}

function checkToEnableOKButton() {
  document.documentElement.getButton("accept").setAttribute( "disabled", !(!!gHost.value && (!gPopup.value || !gInstall.value || !gCookie.value || !gPlugins.value)));
}
