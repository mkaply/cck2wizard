function setAutoConfig(config) {
  // Handle importing of configuration without paths
  var before = document.querySelector('textbox[config="AutoConfigJSBefore"]');
  var after = document.querySelector('textbox[config="AutoConfigJSAfter"]');
  var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
  if (before.value) {
    try {
      file.initWithPath(before.value);
    } catch (e) {
      before.value = config.outputDirectory + before.value;
    }
  }
  if (after.value) {
    try {
      file.initWithPath(after.value);
    } catch (e) {
      after.value = config.outputDirectory + after.value;
    }
  }
}

function onChooseAutoConfigJSBefore() {
  onChooseFile('textbox[config="AutoConfigJSBefore"]');
}

function onChooseAutoConfigJSAfter() {
  onChooseFile('textbox[config="AutoConfigJSAfter"]');
}
