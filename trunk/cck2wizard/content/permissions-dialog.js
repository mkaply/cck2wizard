var gHost = null;
var gPopups = null;
var gInstall = null;
var gCookie = null;
var gPlugins = null;

function onLoad() {
  gHost = document.getElementById("host");
  gPopups = document.getElementById("popups");
  gInstall = document.getElementById("install");
  gCookie = document.getElementById("cookie");
  gPlugins = document.getElementById("plugins");
  var initVals = window.arguments[0];
  if (initVals.hasOwnProperty("host")) {
    gHost.value = initVals.host;
  }
  if (initVals.hasOwnProperty("popups")) {
    gPopups.value = initVals.popups;
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
  if (gPopups.value) {
    retVals.popups = gPopups.value;
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
  document.documentElement.getButton("accept").setAttribute( "disabled", !(!!gHost.value && (!gPopups.value || !gInstall.value || !gCookie.value || !gPlugins.value)));
}
