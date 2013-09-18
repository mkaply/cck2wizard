Cu.import("resource://gre/modules/XPCOMUtils.jsm");

var prefAutoCompleteFactory = null;

function onPreferencesLoad() {
  prefAutoCompleteFactory = {
    startSearch : function startSearch(searchString, searchParam, previousResult, listener) {
      var simpleresult;
      var result = Components.classes["@mozilla.org/autocomplete/simple-result;1"].createInstance();
      simpleresult = result.QueryInterface(Components.interfaces.nsIAutoCompleteSimpleResult);
      simpleresult.setSearchString(searchString);
      simpleresult.setDefaultIndex(0);
      var prefCount = { value: 0 };
      var prefArray = Services.prefs.getChildList("", prefCount);
      prefArray = prefArray.sort();
      for (var i = 0; i < prefCount.value; ++i) 
      {
        if (prefArray[i].indexOf(searchString) == 0) { 
         simpleresult.appendMatch(prefArray[i], "");
        }
      }
      if (simpleresult.matchCount > 0) {
        simpleresult.setSearchResult(Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS);
      } else {
        simpleresult.setSearchResult(Components.interfaces.nsIAutoCompleteResult.RESULT_NOMATCH);
      }
      listener.onSearchResult(this, simpleresult);  
    },
  
    stopSearch : function stopSearch() {
    },

    QueryInterface: XPCOMUtils.generateQI([Ci.nsIAutoCompleteSearch]),

    createInstance: function(outer, iid) {
       return this.QueryInterface(iid);
    },
  };

  var registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  registrar.registerFactory(Components.ID("{f0747ed9-764a-4501-a7e5-4d1493605430}"),
                            "Preference Auto Complete Search",
                            "@mozilla.org/autocomplete/search;1?name=prefs", prefAutoCompleteFactory);
}
window.addEventListener("load", onPreferencesLoad, false);

function onPreferencesUnload() {
  var registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  registrar.unregisterFactory(Components.ID("{f0747ed9-764a-4501-a7e5-4d1493605430}"), prefAutoCompleteFactory);
}
window.addEventListener("unload", onPreferencesUnload, false);

  

