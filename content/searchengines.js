var gSearchEnginesListbox = null;

function onSearchEnginesLoad() {
  gSearchEnginesListbox = document.getElementById("searchengines-listbox");
}
window.addEventListener("load", onSearchEnginesLoad, false);

function setSearchEngines(config) {
  if ("searchplugins" in config) {
    for (var i=0; i < config.searchplugins.length; i++) {
      if (/^https?:/.test(config.searchplugins[i])) {
        var url = config.searchplugins[i];
        getSearchEngineInfoFromURL(url, function(response) {
          if (response) {
            var listitem = gSearchEnginesListbox.appendItem(response.name, url);
            listitem.setAttribute("context", "searchengines-contextmenu");
            listitem.setAttribute("class", "listitem-iconic");
            if (response.image) {
              listitem.setAttribute("class", "listitem-iconic");
              listitem.setAttribute("image", response.image);
            }
          }
        });        
      } else {
        // Filename
        var searchengineFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        searchengineFile.initWithPath(config.searchplugins[i]);
        if (searchengineFile.exists()) {
          getSearchEngineInfoFromFile(searchengineFile, function(response, path) {
            if (response) {
              var listitem = gSearchEnginesListbox.appendItem(response.name, path);
              listitem.setAttribute("context", "searchengines-contextmenu");
              if (response.image) {
                listitem.setAttribute("class", "listitem-iconic");
                listitem.setAttribute("image", response.image);
              }
            }
          });
        } else {
          var listitem = gSearchEnginesListbox.appendItem(searchengineFile.leafName, config.searchplugins[i]);
          listitem.setAttribute("context", "searchengines-contextmenu");
        }
      }
    }
  }
  if (config.defaultSearchEngine) {
    var menulist = document.getElementById("defaultSearchEngine")
    menulist.appendItem(config.defaultSearchEngine, config.defaultSearchEngine);

    menulist.value = config.defaultSearchEngine;
  }
}

function getSearchEngines(config) {
  if (gSearchEnginesListbox.itemCount > 0) {
    config.searchplugins = [];
    for (var i=0; i < gSearchEnginesListbox.itemCount; i++) {
      config.searchplugins.push(gSearchEnginesListbox.getItemAtIndex(i).value);
    }
  }
  if (document.getElementById("defaultSearchEngine").selectedIndex > 0) {
    config.defaultSearchEngine = document.getElementById("defaultSearchEngine").value;
  }
  return config;
}

function resetSearchEngines() {
  while (gSearchEnginesListbox.itemCount > 0) {
    gSearchEnginesListbox.removeItemAt(0);
  }
}

function addSearchEngineFromURL() {
  var retVals = { name: null, location: null};
  window.openDialog("chrome://cck2wizard/content/url-dialog.xul", "cck2wizard-bookmark", "modal,centerscreen", retVals);
  if (retVals.cancel) {
    return;
  }
  var url = retVals.url;
  try {
    Services.io.newURI(url, null, null);
  } catch (ex) {
    showErrorMessage("invalidurl");
    return;
  }
  getSearchEngineInfoFromURL(url, function(response) {
    var listitem = gSearchEnginesListbox.appendItem(response.name, url);
    listitem.setAttribute("context", "searchengines-contextmenu");
    if (response.image) {
      listitem.setAttribute("class", "listitem-iconic");
      listitem.setAttribute("image", response.image);
    }
  });
  return;
}

function addSearchEngineFromFile() {
  var searchengineFile = chooseFile(window);
  getSearchEngineInfoFromFile(searchengineFile, function(response) {
    if (response) {
      var listitem = gSearchEnginesListbox.appendItem(response.name, searchengineFile.path);
      listitem.setAttribute("context", "searchengines-contextmenu");
      if (response.image) {
        listitem.setAttribute("class", "listitem-iconic");
        listitem.setAttribute("image", response.image);
      }
    }
  });
}

function getSearchEngineInfoFromFile(file, successCallback) {
  readFile(file, function(data) {
    var parser = new DOMParser();
    try {
      var xml = parser.parseFromString(data, "text/xml");
      if (xml.documentElement.nodeName != "parsererror") {
        successCallback(getEngineInfoFromXML(xml), file.path);
      } else {
        showErrorMessage("searchengine-invalid");
      }
    } catch(e) {
      showErrorMessage("searchengine-invalid");
    }
  })
}

function getEngineInfoFromXML(xml) {
  var response = {};
  var ShortNames = xml.getElementsByTagNameNS("http://a9.com/-/spec/opensearch/1.1/", "ShortName");
  if (ShortNames.length == 0) {
    ShortNames = xml.getElementsByTagNameNS("http://www.mozilla.org/2006/browser/search/", "ShortName");
  }
  if (ShortNames.length > 0) {
    response.name = ShortNames[0].textContent;
  } else {
    showErrorMessage("searchengine-invalid");
    return null;
  }
  var Images = xml.getElementsByTagNameNS("http://a9.com/-/spec/opensearch/1.1/", "Image");
  if (Images.length == 0) {
    Images = xml.getElementsByTagNameNS("http://www.mozilla.org/2006/browser/search/", "Image");
  }
  if (Images.length > 0) {
    response.image = Images[0].textContent;
  }
  return response;
}

function getSearchEngineInfoFromURL(url, successCallback) {
  var request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = function() {
    if (this.responseXML) {
      successCallback(getEngineInfoFromXML(this.responseXML));
    } else {
      showErrorMessage("searchengine-invalid");
    }
  }
  request.onerror = function() {
    showErrorMessage("invalidurl")
  }
  request.send();
}

function onDeleteSearchEngine() {
  if (gSearchEnginesListbox.selectedIndex == -1) {
    return;
  }
  gSearchEnginesListbox.removeChild(gSearchEnginesListbox.selectedItem);
}

function onKeyPressSearchEngine(event) {
  if (event.keyCode == event.DOM_VK_DELETE ||
      event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeleteSearchEngine();
  }
}

function onDefaultEnginePopup(event) {
  var menulist = event.target.parentNode;
  var currentEngine = menulist.value;
  while (menulist.itemCount > 1) {
    menulist.removeItemAt(1);
  }
  var menuSearchEngines = [];
  for (var i=0; i < gSearchEnginesListbox.itemCount; i++) {
    var menulistitem = gSearchEnginesListbox.getItemAtIndex(i);
    menuSearchEngines.push(menulistitem.getAttribute("label"));
  }
  var engines = Services.search.getVisibleEngines({ });
  for (var i=0; i < engines.length; i++) {
    if (menuSearchEngines.indexOf(engines[i].name) == -1) {
      menuSearchEngines.push(engines[i].name);
    }
  }
  menuSearchEngines.forEach(function(enginename) {
      menulist.appendItem(enginename, enginename);
  });
  if (currentEngine) {
    menulist.value = currentEngine;
  } else {
    menulist.selectedIndex = 0;
  }
}
