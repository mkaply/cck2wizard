function errorCritical(e) {
  try {
    Services.prompt.alert(window, "CC2", "An error has occurred. Please report the following information at http://cck2.freshdesk.com\n\n" + e.toString() + "\n\n" + e.stack);
  } catch (ex) {
    console.log(e.toString() + "\n\n" + e.stack);
  }
}

function writeFile(file, data, successCallback, errorCallback) {
  var ostream = FileUtils.openSafeFileOutputStream(file);
  var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
                    createInstance(Ci.nsIScriptableUnicodeConverter);
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