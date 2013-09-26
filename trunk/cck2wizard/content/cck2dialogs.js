var gDialogDeck = null;
var gDialogPanel = null;

function onDialogsLoad() {
  try {
    gDialogDeck = document.getElementById("cck2wizard-dialog-deck");
    gDialogPanel = document.getElementById("cck2wizard-dialog-panel");
    gDialogPanel.addEventListener("keyup", function(event) {
      switch (event.keyCode) {
        case event.DOM_VK_ESCAPE:
          onCancel();
          break;
        case event.DOM_VK_ENTER:
        case event.DOM_VK_RETURN:
          onOK();
          break;
      }
    }, false);
  } catch(e) {
    errorCritical(e);
  }
}
window.addEventListener("load", onDialogsLoad, false);

function openDialog2(id, acceptCallbackName) {
  try {
    var style = window.getComputedStyle(document.documentElement);
    var width = parseInt(style.getPropertyValue("width"));
    var height = parseInt(style.getPropertyValue("height"));
    gDialogPanel.setAttribute("width", width);
    gDialogPanel.setAttribute("height", height);
    var dialog = document.getElementById(id);;
    gDialogDeck.selectedPanel = dialog;
    gDialogPanel.openPopup(null, "", 0, 0, false, false);
    var controls = dialog.querySelectorAll("textbox");
    if (controls.length > 0) {
      for (var i=0; i < controls.length; i++) {
        controls[i].value = "";
      }
      controls[0].focus();
    }
    if (acceptCallbackName) {
      dialog.setAttribute("onaccept", acceptCallbackName);
    }
  } catch (e) {
    errorCritical(e);
  }
}

function onOK() {
  var ok = gDialogDeck.selectedPanel.getAttribute("onaccept");
  if (!ok || window[ok]()) {
    gDialogPanel.hidePopup();
  }
}

function onCancel() {
  gDialogPanel.hidePopup();
}
