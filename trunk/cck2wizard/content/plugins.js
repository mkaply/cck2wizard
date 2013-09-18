var gPluginsListbox = null;

function onPluginsLoad() {
  gPluginsListbox = document.getElementById("plugins-listbox");
  document.getElementById("plugins-add").addEventListener("command", addPlugin, false);
}
window.addEventListener("load", onPluginsLoad, false);

function setPlugins(config) {
  if ("plugins" in config) {
    for (var i=0; i < config.plugins.length; i++) {
      gPluginsListbox.appendItem(config.plugins[i]);
    }
  }
}

function getPlugins(config, destdir) {
  if (destdir) {
    var pluginsdir = destdir.clone();
    pluginsdir.append("plugins");
    if (!pluginsdir.exists()) {
      pluginsdir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
    }
    for (var i=0; i < gPluginsListbox.itemCount; i++) {
      var pluginfile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
      pluginfile.initWithPath(gPluginsListbox.getItemAtIndex(i).label);
      pluginfile.copyTo(pluginsdir, null);
    }
    
  } else {
    if (gPluginsListbox.itemCount > 0) {
      config.plugins = [];
      for (var i=0; i < gPluginsListbox.itemCount; i++) {
        config.plugins.push(gPluginsListbox.getItemAtIndex(i).label);
      }
    }
  }
  return config;
}

function resetPlugins() {
  while (gPluginsListbox.itemCount > 0) {
    gPluginsListbox.removeItemat(0);
  }
}

function addPlugin() {
  var pluginFile = chooseFile(window);
  gPluginsListbox.appendItem(pluginFile.path);
}