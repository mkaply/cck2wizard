function importCCKFile(configFileContent)
{
  var config = {};
  var configFile = configFileContent.split("\n");

  var configarray = [];
  for (var i=0; i < configFile.length; i++) {
    var str = configFile[i];
    var equals = str.indexOf('=');
    if (equals != -1) {
      var firstpart = str.substring(0,equals);
      var secondpart = str.substring(equals+1);
	  switch (firstpart) {
		case"HTTPproxyname":
		  firstpart = "networkProxyHTTP";
		  break;
		case"HTTPportno":
		  firstpart = "networkProxyHTTP_Port";
		  break;
		case"SSLproxyname":
		  firstpart = "networkProxySSL";
		  break;
		case"SSLportno":
		  firstpart = "networkProxySSL_Port";
		  break;
		case"FTPproxyname":
		  firstpart = "networkProxyFTP";
		  break;
		case"FTPportno":
		  firstpart = "networkProxyFTP_Port";
		  break;
		case"SOCKShostname":
		  firstpart = "networkProxySOCKS";
		  break;
		case"SOCKSportno":
		  firstpart = "networkProxySOCKS_Port";
		  break;
		case"socksv":
		  firstpart = "networkProxySOCKSVersion";
		  break;
		case"NoProxyname":
		  firstpart = "networkProxyNone";
		  break;
		case "ProxyType":
		  firstpart = "networkProxyType";
		  switch (secondpart) {
			case "5":
			  secondpart = "10";
			  break;
		  }
		  break;
	  }
      configarray[firstpart] = secondpart;
    }
  }

  config.name = configarray['name'];
  config.id = configarray['OrganizationName'];
  config.version = configarray['version'];
  config.extension = {};
  config.extension.id = configarray['id'];
  config.extension.name = config.name;
  if (configarray.hasOwnProperty("description")) {
    config.description = configarray['description'];
    config.extension.description = config.description;
  }
  if (configarray.hasOwnProperty("homepageURL")) {
    config.extension.homepageURL = configarray['homepageURL'];
  }
  if (configarray.hasOwnProperty("updateURL")) {
    config.extension.updateURL = configarray['updateURL'];
  }
  if (configarray.hasOwnProperty("updateKey")) {
    config.extension.updateKey = configarray['updateKey'];
  }
  if (configarray.hasOwnProperty("iconURL")) {
    config.extension.icon = configarray['iconURL'];
  }
  if (configarray.hasOwnProperty("filename")) {
    config.extension.filename = configarray['filename'];
  }
  if (configarray.hasOwnProperty("hidden")) {
    config.extension.hidden = true;
  }
  if (configarray.hasOwnProperty("noaboutconfig")) {
    config.disableAboutConfig = true;
  }
  if (configarray.hasOwnProperty("noprivatebrowsing")) {
    config.disablePrivateBrowsing = true;
  }
  if (configarray.hasOwnProperty("nosync")) {
    config.disableSync = true;
  }
  if (configarray.hasOwnProperty("noamo")) {
    config.noGetAddons = true;
  }
  if (configarray.hasOwnProperty("alwaysdefaultbrowser")) {
    config.alwaysDefaultBrowser = true;
  }
  if (configarray.hasOwnProperty("CompanyName")) {
    config.titlemodifier = configarray.CompanyName
  }
  if (configarray.hasOwnProperty("HelpMenuCommandName")) {
    config.helpMenu = {};
    config.helpMenu.label = configarray.HelpMenuCommandName;
    if (configarray.hasOwnProperty("HelpMenuCommandURL")) {
      config.helpMenu.url = configarray.HelpMenuCommandURL;
    }
    if (configarray.hasOwnProperty("HelpMenuCommandAccesskey")) {
      config.helpMenu.accesskey = configarray.HelpMenuCommandAccesskey;
    }
  }
  if (configarray.hasOwnProperty("bookmarksbar")) {
    config.displayBookmarksToolbar = true;
  }
  if (configarray.hasOwnProperty("menubar")) {
    config.displayMenuBar = true;
  }
  function addPermissions(type, action, sites) {
    if (!config.permissions) {
      config.permissions = {};
    }
    sites.split(',').forEach(function(site) {
      site = site.trim();
      if (!config.permissions[site]) {
	config.permissions[site] = {};
      }
      config.permissions[site][type] = action;
    })
  }
  if (configarray.hasOwnProperty("PopupAllowedSites")) {
    addPermissions("popup", 1, configarray.PopupAllowedSites);
  }
  if (configarray.hasOwnProperty("InstallAllowedSites")) {
    addPermissions("install", 1, configarray.InstallAllowedSites);
  }
  if (configarray.hasOwnProperty("CookieAllowedSites")) {
    addPermissions("cookie", 1, configarray.CookieAllowedSites);
  }
  if (configarray.hasOwnProperty("PluginAllowedSites")) {
    addPermissions("plugins", 1, configarray.PluginAllowedSites);
  }
  if (configarray.hasOwnProperty("PopupDeniedSites")) {
    addPermissions("popup", 2, configarray.PopupDeniedSites);
  }
  if (configarray.hasOwnProperty("InstallDeniedSites")) {
    addPermissions("install", 2, configarray.InstallDeniedSites);
  }
  if (configarray.hasOwnProperty("CookieDeniedSites")) {
    addPermissions("cookie", 2, configarray.CookieDeniedSites);
  }
  if (configarray.hasOwnProperty("PluginDeniedSites")) {
    addPermissions("plugins", 2, configarray.PluginDeniedSites);
  }
  if (configarray.hasOwnProperty("BrowserPluginPath1")) {
    config.plugins = [];
    var pluginname, i=1;
    while ((pluginname = configarray['BrowserPluginPath' + i])) {
      config.plugins.push(pluginname);
      i++;
    }
  }
  if (configarray.hasOwnProperty("SearchEngine1")) {
    config.searchplugins = [];
    var searchpluginname, i=1;
    while ((searchpluginname = configarray['SearchEngine' + i])) {
      config.searchplugins.push(searchpluginname);
      i++;
    }
  }
  if (configarray.hasOwnProperty("DefaultSearchEngine")) {
    config.defaultSearchEngine = configarray["DefaultSearchEngine"];
  }
  if (configarray.hasOwnProperty("BundlePath1")) {
    config.addons = [];
    var addonname, i=1;
    while ((addonname = configarray['BundlePath' + i])) {
      config.addons.push(addonname);
      i++;
    }
  }
  if (configarray.hasOwnProperty("ToolbarFolder1")) {
    if (!config.bookmarks) {
      config.bookmarks = {};
    }
    if (!config.bookmarks.toolbar) {
      config.bookmarks.toolbar = [];
    }
    var foldername, i=1;
    while ((foldername = configarray['ToolbarFolder' + i])) {
      var folder = {};
      folder.name = foldername;
      folder.folder = [];
      var bookmarkname, j=1;
      while ((bookmarkname = configarray['ToolbarFolder' + i + ".BookmarkTitle" + j])) {
        var bookmark = {};
	if (configarray.hasOwnProperty('ToolbarFolder' + i + ".BookmarkType" + j)) {
	  var type = configarray['ToolbarFolder' + i + ".BookmarkType" + j];
	  if (type == "live") {
	    // NO LIVE BOOKMARKS
	    j++;
	    continue;
	  }
	  bookmark.type = type;
	} else {
          bookmark.name = bookmarkname;
          bookmark.location = configarray['ToolbarFolder' + i + ".BookmarkURL" + j]
	}
        folder.folder.push(bookmark);
        j++;
      }
      config.bookmarks.toolbar.push(folder);
      i++;
    }
  }
  if (configarray.hasOwnProperty("ToolbarBookmarkTitle1")) {
    if (!config.bookmarks) {
      config.bookmarks = {};
    }
    if (!config.bookmarks.toolbar) {
      config.bookmarks.toolbar = [];
    }
    var bookmarkname, i=1;
    while ((bookmarkname = configarray["ToolbarBookmarkTitle" + i])) {
      var bookmark = {};
      if (configarray.hasOwnProperty("ToolbarBookmarkType" + i)) {
	var type = configarray["ToolbarBookmarkType" + i];
	if (type == "live") {
	  // NO LIVE BOOKMARKS
	  i++;
	  continue;
	}
	bookmark.type = type;
      } else {
	bookmark.name = bookmarkname;
	bookmark.location = configarray["ToolbarBookmarkURL" + i]
      }
      config.bookmarks.toolbar.push(bookmark);
      i++;
    }
  }
  if (configarray.hasOwnProperty("BookmarkFolder1")) {
    if (!config.bookmarks) {
      config.bookmarks = {};
    }
    if (!config.bookmarks.menu) {
      config.bookmarks.menu = [];
    }
    var foldername, i=1;
    while ((foldername = configarray['BookmarkFolder' + i])) {
      var folder = {};
      folder.name = foldername;
      folder.folder = [];
      var bookmarkname, j=1;
      while ((bookmarkname = configarray['BookmarkFolder' + i + ".BookmarkTitle" + j])) {
        var bookmark = {};
	if (configarray.hasOwnProperty('BookmarkFolder' + i + ".BookmarkType" + j)) {
	  var type = configarray['BookmarkFolder' + i + ".BookmarkType" + j];
	  if (type == "live") {
	    // NO LIVE BOOKMARKS
	    j++;
	    continue;
	  }
	  bookmark.type = type;
	} else {
          bookmark.name = bookmarkname;
          bookmark.location = configarray['BookmarkFolder' + i + ".BookmarkURL" + j]
	}
        folder.folder.push(bookmark);
        j++;
      }
      config.bookmarks.menu.push(folder);
      i++;
    }
  }
  if (configarray.hasOwnProperty("BookmarkTitle1")) {
    if (!config.bookmarks) {
      config.bookmarks = {};
    }
    if (!config.bookmarks.menu) {
      config.bookmarks.menu = [];
    }
    var bookmarkname, i=1;
    while ((bookmarkname = configarray["BookmarkTitle" + i])) {
      var bookmark = {};
      if (configarray.hasOwnProperty("BookmarkType" + i)) {
	var type = configarray["BookmarkType" + i];
	if (type == "live") {
	  // NO LIVE BOOKMARKS
	  i++;
	  continue;
	}
	bookmark.type = type;
      } else {
	bookmark.name = bookmarkname;
	bookmark.location = configarray["BookmarkURL" + i]
      }
      config.bookmarks.menu.push(bookmark);
      i++;
    }
  }
  if (configarray.hasOwnProperty("PreferenceName1")) {
    config.preferences = {};
    var preferencename, i=1;
    while ((preferencename = configarray['PreferenceName' + i])) {
      if (!configarray['PreferenceName' + i]) {
	// LOCK ONLY PREF. JUST CONTINUE FOR NOW
	// WE SHOULD CHECK FOR SPECIFIC PREFS AND SET
	// THEIR SEPARATE LOCKING
        i++;
	continue;
      }
      // CHECK TYPE IN SYSTEM. USE IT FIRST.
      // THEN USE VALUE
      // THERE MIGHT BE NO VALUE IF IT IS A LOCK ONLY
      var prefinfo = {};
      switch (configarray['PreferenceType' + i]) {
	case "integer":
	  prefinfo.value = parseInt(configarray['PreferenceValue' + i], 10);
	  break;
	case "boolean":
	  prefinfo.value = JSON.parse(configarray['PreferenceValue' + i]);
	  break;
	default:
	  prefinfo.value = configarray['PreferenceValue' + i];
      }
      if (configarray.hasOwnProperty("PreferenceLock1")) {
	prefinfo.locked = true;
      }
      config.preferences[preferencename] = prefinfo;
      i++;
    }
  }
  if (configarray.hasOwnProperty("HomePageURL")) {
    config.homePage = configarray["HomePageURL"];
  }
  if (configarray.hasOwnProperty("HomePageWelcomeURL")) {
    config.welcomePage = configarray["HomePageWelcomeURL"];
  }
  if (configarray.hasOwnProperty("noWelcomePage")) {
    config.noWelcomePage = JSON.parse(configarray["noWelcomePage"]);
  }
  if (configarray.hasOwnProperty("HomePageOverrideURL")) {
    config.upgradePage = configarray["HomePageOverrideURL"];
  }
  if (configarray.hasOwnProperty("noOverridePage")) {
    config.noUpgradePage = JSON.parse(configarray["noOverridePage"]);
  }
  if (configarray.hasOwnProperty("RegName1")) {
    if (!config.registry) {
      config.registry = [];
    }
    var registryname, i=1;
    while ((registryname = configarray["RegName" + i])) {
      var registryitem = {};
      registryitem.rootkey = configarray["RootKey" + i]
      registryitem.key = configarray["Key" + i]
      registryitem.name = configarray["Name" + i]
      registryitem.value = configarray["NameValue" + i]
      registryitem.type = configarray["Type" + i]
      config.registry.push(registryitem);
      i++;
    }
  }
  if (configarray.hasOwnProperty("CertPath1")) {
    if (!config.certs) {
      config.certs = {};
    }
    var certpath, i=1;
    while ((certpath = configarray["CertPath" + i])) {
      var cert = {};
      cert.url = configarray["CertPath" + i];
      if (configarray["CertTrust" + i]) {
	cert.trust = configarray["CertTrust" + i];
      }
      if (configarray["CertType" + i] &&
	  configarray["CertType" + i] == "server") {
	if (!config.certs.server) {
	  config.certs.server = [];
	}
	config.certs.server.push(cert.url);
      } else {
	if (!config.certs.ca) {
	  config.certs.ca = [];
	}
	config.certs.ca.push(cert);
      }
      i++;
    }
  }
  if ("networkProxyType" in configarray &&
      configarray.networkProxyType != "100" &&
      configarray.networkProxyType != "0") {
    if (!config.network) {
      config.network = {};
    }
    if (configarray.networkProxyType == "10") {
      // Stored autoproxy file
      if ("autoproxyfile" in configarray) {
        config.network.proxyAutoConfig = configarray.autoproxyfile;
      }
      config.network.proxyType = 2;
    } else if (configarray.networkProxyType == "2") {
      // autoproxy URL
      if ("networkProxyAutoconfigURL" in configarray) {
        config.network.proxyAutoConfig = configarray.networkProxyAutoconfigURL;
      }
      config.network.proxyType = 2;
    } else {
      config.network.proxyType = parseInt(configarray.networkProxyType, 10);
    }
  }
  if ("networkProxyHTTP" in configarray) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxyHTTP = configarray.networkProxyHTTP;
  }
  if ("networkProxyHTTP_Port" in configarray && configarray.networkProxyHTTP_Port != 0) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxyHTTPPort = parseInt(configarray.networkProxyHTTP_Port, 10);
  }
  if ("networkProxySSL" in configarray) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxySSL = configarray.networkProxySSL;
  }
  if ("networkProxySSL_Port" in configarray && configarray.networkProxySSL_Port != 0) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxySSLPort = parseInt(configarray.networkProxySSL_Port, 10);
  }
  if ("networkProxyFTP" in configarray) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxyFTP = configarray.networkProxyFTP;
  }
  if ("networkProxyFTP_Port" in configarray && configarray.networkProxyFTP_Port != 0) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxyFTPPort = parseInt(configarray.networkProxyFTP_Port, 10);
  }
  if ("networkProxySOCKS" in configarray) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxySOCKS = configarray.networkProxySOCKS;
  }
  if ("networkProxySOCKS_Port" in configarray && configarray.networkProxySOCKS_Port != 0) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxySOCKSPort = parseInt(configarray.networkProxySOCKS_Port, 10);
  }
  if ("networkProxySOCKSVersion" in configarray) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxySOCKSVersion = parseInt(configarray.networkProxySOCKSVersion, 10);
  }
  if ("networkProxyNone" in configarray) {
    if (!config.network) {
      config.network = {};
    }
    config.network.proxyNone = configarray.networkProxyNone;
  }
  if ("shareAllProxies" in configarray) {
    if (!config.network) {
      config.network = {};
    }
    config.network.shareAllProxies = JSON.parse(configarray.shareAllProxies);
  }
  
  return config;
}

