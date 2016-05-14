const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");

var disableSearchEngineInstall = false;

var documentObserver = {
  observe: function observe(subject, topic, data) {
    if (subject instanceof Ci.nsIDOMWindow && topic == 'content-document-global-created') {
      var doc = subject.document;
      doc.addEventListener("DOMContentLoaded", function(event) {
        event.target.removeEventListener("DOMContentLoaded", arguments.callee, false);
        if (disableSearchEngineInstall) {
          subject.wrappedJSObject.external.AddSearchProvider = function() {};
        }
      }, false);
    }
  }
}

var configs = sendSyncMessage("cck2:get-configs")[0];
for (var id in configs) {
  var config = configs[id];
  if (config.disableSearchEngineInstall) {
    disableSearchEngineInstall = true;
    break;
  }
}

if (disableSearchEngineInstall) {
  Services.obs.addObserver(documentObserver, "content-document-global-created", false);
  addEventListener("unload", function() {
    Services.obs.removeObserver(documentObserver, "content-document-global-created", false);
  })
}
