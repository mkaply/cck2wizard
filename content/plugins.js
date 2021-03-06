var gPluginsListbox = null;

function onPluginsLoad() {
  gPluginsListbox = document.getElementById("plugins-listbox");
}
window.addEventListener("load", onPluginsLoad, false);

function setPlugins(config) {
  if ("plugins" in config) {
    for (var i=0; i < config.plugins.length; i++) {
      var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      try {
        file.initWithPath(config.plugins[i]);
      } catch (e) {
        file.initWithPath(config.outputDirectory + config.plugins[i]);
      }
      var listitem = gPluginsListbox.appendItem(file.leafName, file.path);
      listitem.setAttribute("tooltiptext", file.path);
      listitem.setAttribute("context", "plugins-contextmenu");
    }
  }
}

function getPlugins(config, relativePaths) {
  if (gPluginsListbox.itemCount > 0) {
    config.plugins = [];
    for (var i=0; i < gPluginsListbox.itemCount; i++) {
      if (relativePaths) {
        config.plugins.push(gPluginsListbox.getItemAtIndex(i).getAttribute("value").replace(config.outputDirectory, ""));
      } else {
        config.plugins.push(gPluginsListbox.getItemAtIndex(i).getAttribute("value"));
      }
    }
  }
  return config;
}

function resetPlugins() {
  while (gPluginsListbox.itemCount > 0) {
    gPluginsListbox.removeItemAt(0);
  }
}

function onAddPlugin() {
  var file = chooseFile(window);
  if (!file) {
    return;
  }
  var listitem = gPluginsListbox.appendItem(file.leafName, file.path);
  listitem.setAttribute("tooltiptext", file.path);
  listitem.setAttribute("context", "plugins-contextmenu");
}

function onDeletePlugin() {
  if (gPluginsListbox.selectedIndex == -1) {
    return;
  }
  gPluginsListbox.removeChild(gPluginsListbox.selectedItem);
}


function onKeyPressPlugin(event) {
  if (event.keyCode == event.DOM_VK_DELETE ||
      event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeletePlugin();
  }
}
