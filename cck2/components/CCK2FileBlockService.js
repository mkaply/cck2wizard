const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

function CCK2FileBlock() {}

CCK2FileBlock.prototype = {
  chromeBlacklist: ["browser", "mozapps", "pippki", "marionette", "specialpowers",
                    "global", "pipnss", "cookie", "branding", "alerts"],
  shouldLoad: function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    Components.utils.reportError(aContentLocation.spec);
    // Prevent the loading of chrome URLs into the main browser window
    if (aContentLocation.scheme == "chrome") {
      if (aRequestOrigin &&
          (aRequestOrigin.spec == "chrome://browser/content/browser.xul" ||
          aRequestOrigin.scheme == "moz-nullprincipal")) {
        for (var i=0; i < this.chromeBlacklist.length; i++) {
          if (aContentLocation.host == this.chromeBlacklist[i]) {
            return Ci.nsIContentPolicy.REJECT_REQUEST;
          }
        }
      }
    }
    return Ci.nsIContentPolicy.ACCEPT;
  },
  shouldProcess: function(aContentType, aContentLocation, aRequestOrigin, aContext, aMimeTypeGuess, aExtra) {
    return Ci.nsIContentPolicy.ACCEPT;
  },
  classDescription: "CCK2 FileBlock Service",
  contractID: "@kaply.com/cck2-fileblock-service;1",
  classID: Components.ID('{26e7afc9-e22d-4d12-bb57-c184fe24b828}'),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIContentPolicy])
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory([CCK2FileBlock]);
