var gSearchEnginesListbox = null;

function onSearchEnginesLoad() {
  gSearchEnginesListbox = document.getElementById("searchengines-listbox");
  document.getElementById("searchengines-addurl").addEventListener("command", addSearchEngineFromURL, false);
  document.getElementById("searchengines-addfile").addEventListener("command", addSearchEngineFromFile, false);
}
window.addEventListener("load", onSearchEnginesLoad, false);

function setSearchEngines(config) {
  if ("searchengines" in config) {
    for (var i=0; i < config.searchengines.length; i++) {
      try {
        Services.io.newURI(config.searchengines[i], null, null);
        var url = config.searchengines[i];
        getSearchEngineInfoFromURL(url, function(response) {
          if (response) {
            var listitem = gSearchEnginesListbox.appendItem(response.name, url);
          }
        });        
      } catch (e) {
        // Filename
        var searchengineFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
        searchengineFile.initWithPath(config.searchengines[i]);
        getSearchEngineInfoFromFile(searchengineFile, function(response) {
          if (response) {
            var listitem = gSearchEnginesListbox.appendItem(response.name, searchengineFile.path);
            listitem.image = response.image;
          }
        });
      }
    }
  }
}

function getSearchEngines(config, destdir) {
  if (destdir) {
    
    // ONLY DO THIS IF NOT AUTOCONFIG (distribution)
    var searchenginesdir = destdir.clone();
    searchenginesdir.append("searchengines");
    if (!searchenginesdir.exists()) {
      searchenginesdir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    }
    for (var i=0; i < gSearchEnginesListbox.itemCount; i++) {
      var searchengineFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      searchengineFile.initWithPath(gSearchEnginesListbox.getItemAtIndex(i).value);
      searchengineFile.copyTo(searchenginesdir, null);
    }
    
  } else {
    if (gSearchEnginesListbox.itemCount > 0) {
      config.searchengines = [];
      for (var i=0; i < gSearchEnginesListbox.itemCount; i++) {
        config.searchengines.push(gSearchEnginesListbox.getItemAtIndex(i).value);
      }
    }
  }
  return config;
}

function resetSearchEngines() {
  while (gSearchEnginesListbox.itemCount > 0) {
    gSearchEnginesListbox.removeItemat(0);
  }
}

function addSearchEngineFromURL() {
  openDialog("searchengineurl-dialog");  
}

function addSearchEngineFromFile() {
  var searchengineFile = chooseFile(window);
  getSearchEngineInfoFromFile(searchengineFile, function(response) {
    if (response) {
      var listitem = gSearchEnginesListbox.appendItem(response.name, searchengineFile.path);
    }
  });
}

function getSearchEngineInfoFromFile(file, successCallback) {
  readFile(file, function(data) {
    var parser = new DOMParser();
    try {
      var xml = parser.parseFromString(data, "text/xml");
      if (xml.documentElement.nodeName != "parsererror") {
        successCallback(getEngineInfoFromXML(xml));
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
  if (ShortNames.length > 0) {
    response.name = ShortNames[0].textContent;
  } else {
    showErrorMessage("searchengine-invalid");
    return null;
  }
  var Images = xml.getElementsByTagNameNS("http://a9.com/-/spec/opensearch/1.1/", "Image");
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
    showErrorMessage("searchengine-invalidurl")
  }
  request.send();
}

function onSearchEngineURLOK()
{
  var url = document.getElementById("searchengineurl-name").value;
  try {
    Services.io.newURI(url, null, null);
  } catch (ex) {
    showErrorMessage("searchengine-invalidurl");
    return false;
  }
  getSearchEngineInfoFromURL(url, function(response) {
    var listitem = gSearchEnginesListbox.appendItem(response.name, url);
  });
  return true;
}
