const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

var prefAutoCompleteFactory = null;
var gPrefValueString = null;
var gPrefValueInt = null;
var gPrefValueBool = null;
var gPrefValueDeck = null;

var preferencesToIgnore = {
  "browser.startup.homepage": true,
  "startup.homepage_welcome_url": true,
  "browser.startup.homepage_override.mstone": true,
  "startup.homepage_override_url": true,
  "network.proxy.type": true,
  "network.proxy.http": true,
  "network.proxy.http_port": true,
  "network.proxy.share_proxy_settings": true,
  "network.proxy.ssl": true,
  "network.proxy.ssl_port": true,
  "network.proxy.ftp": true,
  "network.proxy.ftp_port": true,
  "network.proxy.socks": true,
  "network.proxy.socks_port": true,
  "network.proxy.socks_version": true,
  "network.proxy.no_proxies_on": true,
  "network.proxy.autoconfig_url": true
}

function onLoad() {
  prefAutoCompleteFactory = {
    startSearch : function startSearch(searchString, searchParam, previousResult, listener) {
      var simpleresult;
      var result = Cc["@mozilla.org/autocomplete/simple-result;1"].createInstance();
      simpleresult = result.QueryInterface(Ci.nsIAutoCompleteSimpleResult);
      simpleresult.setSearchString(searchString);
      simpleresult.setDefaultIndex(0);
      var prefCount = { value: 0 };
      var prefArray = Services.prefs.getChildList("", prefCount);
      prefArray = prefArray.sort();
      for (var i = 0; i < prefCount.value; ++i)
      {
        if (prefArray[i].indexOf(searchString) == 0 &&
            !preferencesToIgnore[prefArray[i]]) {
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
                            "@mozilla.org/autocomplete/search;1?name=cck2prefs", prefAutoCompleteFactory);

  gPrefValueDeck = document.getElementById("value-deck");
  gPrefValueString = document.getElementById("value-string");
  gPrefValueInt = document.getElementById("value-int");
  gPrefValueBool = document.getElementById("value-bool");
  var initVals = window.arguments[0];
  if (initVals.name) {
    document.getElementById('name').value = initVals.name;
    document.getElementById('name').disabled = true;
  }
  if (initVals.type) {
    switch (initVals.type) {
      case "integer":
        gPrefValueDeck.selectedPanel = gPrefValueInt;
        break;
      case "boolean":
        gPrefValueDeck.selectedPanel = gPrefValueBool;
        break;
      case "string":
        gPrefValueDeck.selectedPanel = gPrefValueString;
        break;      
    }
  } else {
    updatePrefValue();
  }
  if (initVals.value) {
    gPrefValueDeck.selectedPanel.value = initVals.value;
  }
}

function onUnload() {
  var registrar = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  registrar.unregisterFactory(Components.ID("{f0747ed9-764a-4501-a7e5-4d1493605430}"), prefAutoCompleteFactory);
}

function onOK() {
  var retVals = window.arguments[0];
  retVals.name = document.getElementById('name').value;
  retVals.value = gPrefValueDeck.selectedPanel.value;
  if (!prefType) {
    if (retVals.value == "true" || retVals.value == "false") {
      prefType = "boolean";
    } else if (parseInt(retVals.value, 10) == retVals.value) {
      prefType = "integer";
    } else {
      prefType = "string";
    }
  }
  retVals.type = prefType;
}

function onCancel() {
  var retVals = window.arguments[0];
  retVals.cancel = true;
}


var prefType = null;

function updatePrefValue() {
  var prefname = document.getElementById('name').value;
  var preftype = Services.prefs.getPrefType(prefname);
  switch (preftype) {
    case Services.prefs.PREF_STRING:
      gPrefValueString.value = Services.prefs.getCharPref(prefname);
      gPrefValueDeck.selectedPanel = gPrefValueString;
      prefType = "string";
      break;
    case Services.prefs.PREF_INT:
      gPrefValueInt.value = Services.prefs.getIntPref(prefname);
      gPrefValueDeck.selectedPanel = gPrefValueInt;
      prefType = "integer";
      break;
    case Services.prefs.PREF_BOOL:
      gPrefValueBool.value = Services.prefs.getBoolPref(prefname);
      gPrefValueDeck.selectedPanel = gPrefValueBool;
      prefType = "boolean";
      break;
    case Services.prefs.PREF_INVALID:
      gPrefValueDeck.selectedPanel = gPrefValueString;
      gPrefValueString.value = "";
      prefType = null;
      break;
  }
}