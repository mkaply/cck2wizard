var gPopupAllowedSites = null;
var gPopupDeniedSites = null;
var gCookieAllowedSites = null;
var gCookieDeniedSites = null;

function onPermissionsLoad() {
  gPopupAllowedSites = document.getElementById("PopupAllowedSites");
  gPopupDeniedSites = document.getElementById("PopupDeniedSites");
  gCookieAllowedSites = document.getElementById("CookieAllowedSites");
  gCookieDeniedSites = document.getElementById("CookieDeniedSites");
}
window.addEventListener("load", onPermissionsLoad, false);

function setPopupPermissions(config) {
  setPermissions(config, "popup", gPopupAllowedSites, gPopupDeniedSites);
  return config;
}

function setCookiePermissions(config) {
  setPermissions(config, "cookie", gCookieAllowedSites, gCookieDeniedSites);
  return config;    
}

function setPermissions(config, type, allowedSitesField, deniedSitesField) {
  if (!config.permissions) {
    return;
  }
  if (!config.permissions[type]) {
    return;
  }
  if ("allow" in config.permissions[type]) {
    allowedSitesField.value = config.permissions[type].allow.join(',');
  }
  if ("deny" in config.permissions[type]) {
    deniedSitesField.value = config.permissions[type].deny.join(',');
  }
}

function getPopupPermissions(config) {
  config = getPermissions(config, "popup", gPopupAllowedSites.value, gPopupDeniedSites.value);
  return config;
}

function getCookiePermissions(config) {
  config = getPermissions(config, "cookie", gCookieAllowedSites.value, gCookieDeniedSites.value);
  return config;    
}

function getPermissions(config, type, allowedSites, deniedSites) {
  if (allowedSites) {
    if (!config.permissions)
      config.permissions = {};
    if (!config.permissions[type])
      config.permissions[type] = {};
    config.permissions[type].allow = allowedSites.split(',');
  }
  if (deniedSites) {
    if (!config.permissions)
      config.permissions = {};
    if (!config.permissions[type])
      config.permissions[type] = {};
    config.permissions[type].deny = deniedSites.split(',');
  }
  return config;
}

function resetPopupPermissions() {
  gPopupAllowedSites.value = "";
  gPopupDeniedSites.value = "";
}

function resetCookiePermissions() {
  gPopupAllowedSites.value = "";
  gPopupDeniedSites.value = "";
}
