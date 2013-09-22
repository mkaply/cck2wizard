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

function getPlugins(config) {
  if (gPluginsListbox.itemCount > 0) {
    config.plugins = [];
    for (var i=0; i < gPluginsListbox.itemCount; i++) {
      config.plugins.push(gPluginsListbox.getItemAtIndex(i).label);
    }
  }
  return config;
}

function resetPlugins() {
  while (gPluginsListbox.itemCount > 0) {
    gPluginsListbox.removeItemAt(0);
  }
}

function addPlugin() {
  var pluginFile = chooseFile(window);
  gPluginsListbox.appendItem(pluginFile.path);
}