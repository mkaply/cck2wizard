const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

function CCK2Service() {}

CCK2Service.prototype = {
  observe: function(aSubject, aTopic, aData) {
    switch(aTopic) {
      case "profile-after-change":
        Components.utils.import("resource://cck2/CCK2.jsm");
        CCK2.init();
        break;
    }
  },
  classDescription: "CCK2 Service",
  contractID: "@kaply.com/cck2-service;1",
  classID: Components.ID("{b6dccb2f-72e7-4954-a248-6e6a53de4972}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),
  _xpcom_categories: [{category: "profile-after-change"}]
}

var NSGetFactory = XPCOMUtils.generateNSGetFactory([CCK2Service]);
