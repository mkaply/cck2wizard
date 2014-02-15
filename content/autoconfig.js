var gAutoConfigJSListbox = null;

function onAutoConfigJSLoad() {
  gAutoConfigJSListbox = document.getElementById("autoconfigjs-listbox");
}
window.addEventListener("load", onAutoConfigJSLoad, false);

function setAutoConfigJS(config) {
  if ("AutoConfigJS" in config) {
    for (var i=0; i < config.AutoConfigJS.length; i++) {
      var listitem = gAutoConfigJSListbox.appendItem(config.AutoConfigJS[i]);
      listitem.setAttribute("context", "autoconfigjs-contextmenu")
    }
  }
}

function getAutoConfigJS(config) {
  if (gAutoConfigJSListbox.itemCount > 0) {
    config.AutoConfigJS = [];
    for (var i=0; i < gAutoConfigJSListbox.itemCount; i++) {
      config.AutoConfigJS.push(gAutoConfigJSListbox.getItemAtIndex(i).label);
    }
  }
  return config;
}

function resetAutoConfigJS() {
  while (gAutoConfigJSListbox.itemCount > 0) {
    gAutoConfigJSListbox.removeItemAt(0);
  }
}

function onAddAutoConfigJS() {
  var AutoConfigJSFile = chooseFile(window);
  var listitem = gAutoConfigJSListbox.appendItem(AutoConfigJSFile.path);
  listitem.setAttribute("context", "autoconfigjs-contextmenu")
}

function onDeleteAutoConfigJS() {
  if (gAutoConfigJSListbox.selectedIndex == -1) {
    return;
  }
  gAutoConfigJSListbox.removeChild(gAutoConfigJSListbox.selectedItem);
}


function onKeyPressAutoConfigJS(event) {
  if (event.keyCode == event.DOM_VK_DELETE ||
      event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeleteAutoConfigJS();
  }
}
