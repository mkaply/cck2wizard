function errorCritical(e) {
  try {
    alert(e.toString() + "\n\n" + e.stack);
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
      successCallback();
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
    var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
    if (successCallback) {
      successCallback(data);
    }
  });
}