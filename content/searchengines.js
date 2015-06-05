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
        var listitem = gSearchEnginesListbox.appendItem(url, url);
        listitem.setAttribute("tooltiptext",  url);
        listitem.setAttribute("context", "searchengines-contextmenu");
        getSearchEngineInfoFromURL(url, listitem, function(response) {
          if (response) {
            listitem.setAttribute("label", response.name);
            listitem.setAttribute("context", "searchengines-contextmenu");
            listitem.setAttribute("class", "listitem-iconic");
            if (response.image) {
              listitem.setAttribute("class", "listitem-iconic");
              listitem.setAttribute("image", response.image);
            }
          }
        }, function(listitem) {
          gSearchEnginesListbox.removeChild(listitem);
        });        
      } else {
        // Filename
        var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        try {
          file.initWithPath(config.searchplugins[i]);
        } catch (e) {
          file.initWithPath(config.outputDirectory + config.searchplugins[i]);
        }
        // Always append the item. If we get data from the engine, replace it
        var listitem = gSearchEnginesListbox.appendItem(file.leafName, file.path);
        listitem.setAttribute("tooltiptext",  config.searchplugins[i]);
        listitem.setAttribute("context", "searchengines-contextmenu");
        if (file && file.exists()) {
          getSearchEngineInfoFromFile(file, listitem, function(response, listitem) {
            if (response) {
              listitem.setAttribute("label", response.name);
              if (response.image) {
                listitem.setAttribute("class", "listitem-iconic");
                listitem.setAttribute("image", response.image);
              }
            }
          }, function(listitem) {
            gSearchEnginesListbox.removeChild(listitem);
          });
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
function getSearchEngines(config, relativePaths) {
  if (gSearchEnginesListbox.itemCount > 0) {
    config.searchplugins = [];
    for (var i=0; i < gSearchEnginesListbox.itemCount; i++) {
      var searchplugin = gSearchEnginesListbox.getItemAtIndex(i).getAttribute("value")
      if (relativePaths) {
        searchplugin = searchplugin.replace(config.outputDirectory, "");
      }
      config.searchplugins.push(searchplugin);
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
  var listitem = gSearchEnginesListbox.appendItem(url, url);
  listitem.setAttribute("context", "searchengines-contextmenu");
  listitem.setAttribute("tooltiptext", url);
  getSearchEngineInfoFromURL(url, listitem, function(response) {
    listitem.setAttribute("label", response.name);
    if (response.image) {
      listitem.setAttribute("class", "listitem-iconic");
      listitem.setAttribute("image", response.image);
    }
  }, function(listitem) {
    gSearchEnginesListbox.removeChild(listitem);
  });
  return;
}

function addSearchEngineFromFile() {
  var searchengineFile = chooseFile(window);
  if (!searchengineFile) {
    return;
  }
  var listitem = gSearchEnginesListbox.appendItem(searchengineFile.leafName, searchengineFile.path);
  listitem.setAttribute("tooltiptext", searchengineFile.path);
  listitem.setAttribute("context", "searchengines-contextmenu"); 
  getSearchEngineInfoFromFile(searchengineFile,listitem, function(response, listitem) {
    if (response) {
      listitem.setAttribute("label", response.name);
      if (response.image) {
        listitem.setAttribute("class", "listitem-iconic");
        listitem.setAttribute("image", response.image);
      }
    }
  }, function(listitem) {
    gSearchEnginesListbox.removeChild(listitem);
  });
}

function getSearchEngineInfoFromFile(file, listitem, successCallback, errorCallback) {
  readFile(file, function(data) {
    var parser = new DOMParser();
    try {
      var xml = parser.parseFromString(data, "text/xml");
      if (xml.documentElement.nodeName != "parsererror") {
        successCallback(getEngineInfoFromXML(xml), listitem);
      } else {
        errorCallback(listitem);
        showErrorMessage("searchengine-invalid");
      }
    } catch(e) {
      errorCallback(listitem);
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

function getSearchEngineInfoFromURL(url, listitem, successCallback, errorCallback) {
  var request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = function() {
    if (this.responseXML) {
      successCallback(getEngineInfoFromXML(this.responseXML), listitem);
    } else {
      errorCallback(listitem);
      showErrorMessage("searchengine-invalid");
    }
  }
  request.onerror = function() {
    errorCallback(listitem);
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
