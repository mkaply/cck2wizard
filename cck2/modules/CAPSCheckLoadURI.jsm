const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const EXPORTED_SYMBOLS = [];

var gDefaultCheckLoadURIPolicy = true;
var gForceExternalHandler = false;

XPCOMUtils.defineLazyServiceGetter(this, "extProtocolSvc",
    "@mozilla.org/uriloader/external-protocol-service;1", "nsIExternalProtocolService");

var documentObserver = {
  observe: function observe(subject, topic, data) {
    if (subject instanceof Ci.nsIDOMWindow && topic == 'content-document-global-created') {
      var doc = subject.document;
      doc.addEventListener("DOMContentLoaded", function(event) {
        event.target.removeEventListener("DOMContentLoaded", arguments.callee, false);
        var links = event.target.getElementsByTagName("a");
        for (var i=0; i < links.length; i++) {
          var link = links[i];
          if (link.href.indexOf("file://") != 0) {
            continue;
          }
          link.addEventListener("click", function(event) {
            event.preventDefault();
            if (gForceExternalHandler) {
              extProtocolSvc.loadUrl(Services.io.newURI(event.target.href, null, null));
            } else {
              var win = Services.wm.getMostRecentWindow("navigator:browser");
              if (win) {
                win.openUILink(event.target.href, event);
              }
            }
          }, false);
        }
      }, false);
    }
  }
}

var CAPSCheckLoadURI = {
  observe: function observe(subject, topic, data) {
    switch (topic) {
    case "final-ui-startup":
      Services.obs.removeObserver(CAPSCheckLoadURI, "final-ui-startup", false);
      // Don't do this check before Firefox 29
      if (Services.vc.compare(Services.appinfo.version, "29") <= 0) {
        return;
      }
      try {
        if (Services.prefs.getCharPref("capability.policy.default.checkloaduri.enabled") == "allAccess") {
          gDefaultCheckLoadURIPolicy = true;
        }
      } catch (e) {
        // If they haven't set the preference, don't do anything
        return;
      }
      gForceExternalHandler = !extProtocolSvc.isExposedProtocol('file');
      Services.obs.addObserver(documentObserver, "content-document-global-created", false);
      break;
    case "quit-application":
      Services.obs.removeObserver(CAPSCheckLoadURI, "quit-application", false);
      Services.obs.removeObserver(documentObserver, 'content-document-global-created', false);
      break;
    }
  }
}

Services.obs.addObserver(CAPSCheckLoadURI, "final-ui-startup", false);
Services.obs.addObserver(CAPSCheckLoadURI, "quit-application", false);
