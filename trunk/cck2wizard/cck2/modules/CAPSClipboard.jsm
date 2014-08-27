const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

const EXPORTED_SYMBOLS = [];

var gAllowedPasteSites = [];
var gAllowedCutCopySites = [];
var gDeniedPasteSites = [];
var gDeniedCutCopySites = [];
var gDefaultPastePolicy = false;
var gDefaultCutCopyPolicy = false;

function myExecCommand(doc) {
  return function(aCommandName, aShowDefaultUI, aValueArgument) {
    switch (aCommandName) {
    case "cut":
    case "copy":
      if (doc.allowCutCopy) {
        var win = Services.wm.getMostRecentWindow("navigator:browser");
        win.goDoCommand("cmd_" + aCommandName);
        return;
      }
      break;
    case "paste":
      if (doc.allowPaste) {
        var win = Services.wm.getMostRecentWindow("navigator:browser");
        win.goDoCommand("cmd_" + aCommandName);
        return;
      }
      break;
    }
    doc.originalExecCommand(aCommandName, aShowDefaultUI, aValueArgument);
  }
}

function myDesignModeGetter(doc) {
  return function(mode) {
    if (mode == "on") {
      doc.originalExecCommand = Cu.waiveXrays(doc).execCommand;
      Cu.exportFunction(myExecCommand(doc), doc, {defineAs: "execCommand"});
    } else if (mode == "off") {
      if (doc.originalExecCommand) {
        Cu.waiveXrays(doc).execCommand = doc.originalExecCommand;
        doc.originalExecCommand = null;
      }
    }
    doc.originalDesignModeGetter(mode);
  }
}

var documentObserver = {
  observe: function observe(subject, topic, data) {
    if (subject instanceof Ci.nsIDOMWindow && topic == 'content-document-global-created') {
      var doc = subject.document;
      doc.allowCutCopy = gDefaultCutCopyPolicy;
      doc.allowPaste = gDefaultPastePolicy;
      if (gDefaultCutCopyPolicy == true) {
        for (var i=0; i < gDeniedCutCopySites.length; i++) {
          if (doc.location.href.indexOf(gDeniedCutCopySites[i]) == 0) {
            doc.allowCutCopy = false;
            break;
          }
        }
      } else {
        for (var i=0; i < gAllowedCutCopySites.length; i++) {
          if (doc.location.href.indexOf(gAllowedCutCopySites[i]) == 0) {
            doc.allowCutCopy = true;
            break;
          }
        }
      }
      if (gDefaultPastePolicy == true) {
        for (var i=0; i < gDeniedPasteSites.length; i++) {
          if (doc.location.href.indexOf(gDeniedPasteSites[i]) == 0) {
            doc.allowPaste = false;
            break;
          }
        }
      } else {
        for (var i=0; i < gAllowedPasteSites.length; i++) {
          if (doc.location.href.indexOf(gAllowedPasteSites[i]) == 0) {
            doc.allowPaste = true;
            break;
          }
        }
      }
      if (!doc.allowCutCopy && !doc.allowPaste) {
        return;
      }
      if (!doc.originalDesignModeGetter) {
        doc.originalDesignModeGetter = Cu.waiveXrays(doc).__lookupSetter__("designMode");
        Cu.waiveXrays(doc).__defineSetter__("designMode", Cu.exportFunction(myDesignModeGetter(doc), doc));
      }
    }
  }
}

var CAPSClipboard = {
  observe: function observe(subject, topic, data) {
    switch (topic) {
    case "final-ui-startup":
      try {
        Services.obs.removeObserver(CAPSClipboard, "final-ui-startup", false);
      // Don't do this check before Firefox 29
      if (Services.vc.compare(Services.appinfo.version, "29") <= 0) {
        return;
      }
        try {
          if (Services.prefs.getCharPref("capability.policy.default.Clipboard.cutcopy") == "allAccess") {
            gDefaultCutCopyPolicy = true;
          }
        } catch (e) {}
        try {
          if (Services.prefs.getCharPref("capability.policy.default.Clipboard.paste") == "allAccess") {
            gDefaultPastePolicy = true;
          }
        } catch (e) {}
        var policies = [];
        policies = Services.prefs.getCharPref("capability.policy.policynames").split(', ');
        for (var i=0; i < policies.length; i++ ) {
          try {
            if (Services.prefs.getCharPref("capability.policy." + policies[i] + ".Clipboard.cutcopy") == "allAccess") {
              var allowedCutCopySites = Services.prefs.getCharPref("capability.policy." + policies[i] + ".sites").split(" ");
              for (var j=0; j < allowedCutCopySites.length; j++) {
                gAllowedCutCopySites.push(allowedCutCopySites[j]);
              }
            }
          } catch(e) {}
          try {
            if (Services.prefs.getCharPref("capability.policy." + policies[i] + ".Clipboard.cutcopy") == "noAccess") {
              var deniedCutCopySites = Services.prefs.getCharPref("capability.policy." + policies[i] + ".sites").split(" ");
              for (var j=0; j < deniedCutCopySites.length; j++) {
                gDeniedCutCopySites.push(deniedCutCopySites[j]);
              }
            }
          } catch(e) {}
          try {
            if (Services.prefs.getCharPref("capability.policy." + policies[i] + ".Clipboard.paste") == "allAccess") {
              var allowedPasteSites = Services.prefs.getCharPref("capability.policy." + policies[i] + ".sites").split(" ");
              for (var j=0; j < allowedPasteSites.length; j++) {
                gAllowedPasteSites.push(allowedPasteSites[j]);
              }
            }
          } catch(e) {}
          try {
            if (Services.prefs.getCharPref("capability.policy." + policies[i] + ".Clipboard.paste") == "noAccess") {
              var deniedPasteSites = Services.prefs.getCharPref("capability.policy." + policies[i] + ".sites").split(" ");
              for (var j=0; j < deniedPasteSites.length; j++) {
                gDeniedPasteSites.push(deniedPasteSites[j]);
              }
            }
          } catch(e) {}
        }
      } catch (ex) {};
      Services.obs.addObserver(documentObserver, "content-document-global-created", false);
      break;
    case "quit-application":
      Services.obs.removeObserver(CAPSClipboard, "quit-application", false);
      Services.obs.removeObserver(documentObserver, 'content-document-global-created', false);
      break;
    }
  }
}

Services.obs.addObserver(CAPSClipboard, "final-ui-startup", false);
Services.obs.addObserver(CAPSClipboard, "quit-application", false);
