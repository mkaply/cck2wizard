Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/NetUtil.jsm");


function errorCritical(e) {
  try {
    Services.prompt.alert(window, "CCK2", "An error has occurred. Please report the following information at http://cck2.freshdesk.com\n\n" + e.toString() + "\n\n" + e.stack);
  } catch (ex) {
    console.log(e.toString() + "\n\n" + e.stack);
  }
}

function writeFile(file, data, successCallback, errorCallback) {
  var ostream = FileUtils.openSafeFileOutputStream(file);
  var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
                    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  converter.charset = "UTF-8";
  var istream = converter.convertToInputStream(data);
  NetUtil.asyncCopy(istream, ostream, function(status) {
    if (!Components.isSuccessCode(status)) {
      if (errorCallback) {
        errorCallback();
      }
      return;
    }
    if (successCallback) {
      successCallback(file);
    }
  });
}
  
function readFile(file, successCallback, errorCallback) {
  NetUtil.asyncFetch(file, function(inputStream, status) {
    if (!Components.isSuccessCode(status)) {
      if (errorCallback) {
        errorCallback();
      }
      return;
    }
    var data = NetUtil.readInputStreamToString(inputStream, inputStream.available(), { charset : "UTF-8" });
    if (successCallback) {
      successCallback(data);
    }
  });
}

function $(id) {
  return document.getElementById(id);
}

function createListCell(label, value) {
  var listcell = document.createElement("listcell");
  listcell.setAttribute("label", label);
  if (value) {
    listcell.setAttribute("value", value);
  }
  listcell.setAttribute("flex", "1");
  return listcell;
}

function onChooseDirectory(selector) {
  var outputDir = chooseDir(window, document.querySelector(selector).value);
  if (outputDir) {
    document.querySelector(selector).value = outputDir.path;
  }
}

function onChooseFile(selector) {
  var outputFile = chooseFile(window, document.querySelector(selector).value);
  if (outputFile) {
    document.querySelector(selector).value = outputFile.path;
  }
}

function chooseFile(win, path) {
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
  fp.init(win, "", Components.interfaces.nsIFilePicker.modeOpen);
  if (path) {
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
    try {
      file.initWithPath(path);
      fp.defaultString = file.leafName;
      fp.displayDirectory = file;
    } catch(e) {
      // Ignore path errors in case we are on different OSes
    }
  }
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
  if (fp.show() == Components.interfaces.nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    return fp.file;
  }
  return null;
}

function showErrorMessage(id) {
  Services.prompt.alert(window,
                        gStringBundle.getString("titlebar"),
                        gStringBundle.getString(id));
}

function saveFile(win, filename) {
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
  fp.init(win, "", Components.interfaces.nsIFilePicker.modeSave);
  fp.defaultString = filename;
  fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
  if (fp.show() != Components.interfaces.nsIFilePicker.returnCancel && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    return fp.file;
  }
  return null;
}

function chooseDir(win, dir) {
  var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
  fp.init(win, "", nsIFilePicker.modeGetFolder);
  if (dir) {
    var dirFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
    try {
      dirFile.initWithPath(dir);
      fp.displayDirectory = dirFile;
    } catch(e) {
      // Ignore path errors in case we are on different OSes
    }
  }
  if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    return fp.file;
  }
  return null;
}
