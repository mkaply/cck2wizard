function importCCKFile(configFileContent)
{
  var config = {};
  var configFile = configFileContent.split("\n");

  var configarray = [];
//  for (var i=0; i < configFile.length; i++) {
  for (var i=0; i < 20; i++) {
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
  config.extension.version = configarray['name'];
  if ("description" in configarray) {
    config.description = configarray['description'];
    config.extension.description = config.description;
  }
  if ("homepageURL" in configarray) {
    config.extension.homepageURL = configarray['homepageURL'];
  }
  if ("updateURL" in configarray) {
    config.extension.updateURL = configarray['updateURL'];
  }
  if ("updateKey" in configarray) {
    config.extension.updateKey = configarray['updateKey'];
  }
  if ("iconURL" in configarray) {
    config.extension.icon = configarray['iconURL'];
  }
  if ("filename" in configarray) {
    config.extension.filename = configarray['filename'];
  }
  if ("hidden" in configarray) {
    config.extension.hidden = true;
  }
  if ("noaboutconfig" in configarray) {
    config.disableAboutConfig = true;
  }
  if ("noprivatebrowsing" in configarray) {
    config.disablePrivateBrowsing = true;
  }
  if ("nosync" in configarray) {
    config.disableSync = true;
  }
  if ("noamo" in configarray) {
    config.noGetAddons = true;
  }
  if ("alwaysdefaultbrowser" in configarray) {
    config.alwaysDefaultBrowser = true;
  }
  if ("HomePageURL" in configarray) {
  }
  if ("HomePageWelcomeURL" in configarray) {
  }
  if ("noWelcomePage" in configarray) {
  }
  if ("HomePageOverrideURL" in configarray) {
  }
  if ("noOverridePage" in configarray) {
  }
  if ("CompanyName" in configarray) {
    config.titlemodifier = configarray.CompanyName
  }
  if ("HelpMenuCommandName" in configarray) {
    config.helpMenu = {};
    config.helpMenu.label = configarray.HelpMenuCommandName;
    if ("HelpMenuCommandURL" in configarray) {
      config.helpMenu.url = configarray.HelpMenuCommandURL;
    }
    if ("HelpMenuCommandAccesskey" in configarray) {
      config.helpMenu.accesskey = configarray.HelpMenuCommandAccesskey;
    }
  }
  if ("bookmarksbar" in configarray) {
    config.displayBookmarksToolbar = true;
  }
  if ("menubar" in configarray) {
    config.displayMenuBar = true;
  }
  function addPermissions(type, action, sites) {
    if (!config.permissions)
      config.permissions = {};
    if (!config.permissions[type])
      config.permissions[type] = {};
    config.permissions[type][action] = sites.split(',');
  }
  if ("PopupAllowedSites" in configarray) {
    addPermissions("popup", "allow", configarray.PopupAllowedSites);
  }
  if ("InstallAllowedSites" in configarray) {
    addPermissions("install", "allow", configarray.InstallAllowedSites);
  }
  if ("CookieAllowedSites" in configarray) {
    addPermissions("cookie", "allow", configarray.CookieAllowedSites);
  }
  if ("PluginAllowedSites" in configarray) {
    addPermissions("plugins", "allow", configarray.PluginAllowedSites);
  }
  if ("PopupAllowedSites" in configarray) {
    addPermissions("popup", "deny", configarray.PopupAllowedSites);
  }
  if ("InstallAllowedSites" in configarray) {
    addPermissions("install", "deny", configarray.InstallAllowedSites);
  }
  if ("CookieAllowedSites" in configarray) {
    addPermissions("cookie", "deny", configarray.CookieAllowedSites);
  }
  if ("PluginAllowedSites" in configarray) {
    addPermissions("plugins", "deny", configarray.PluginAllowedSites);
  }
  if ("BrowserPluginPath1" in configarray) {
    config.plugins = [];
    var pluginname, i=1;
    while ((pluginname = configarray['BrowserPluginPath' + i])) {
      config.plugins.push(pluginname);
      i++;
    }
  }
  if ("SearchEngine1" in configarray) {
    config.searchplugins = [];
    var searchpluginname, i=1;
    while ((searchpluginname = configarray['SearchEngine' + i])) {
      config.searchplugins.push(searchpluginname);
      i++;
    }
  }
  if ("DefaultSearchEngine" in configarray) {
    config.defaultSearchEngine = configarray["DefaultSearchEngine"];
  }
  if ("BundlePath1" in configarray) {
    config.addons = [];
    var addonname, i=1;
    while ((addonname = configarray['BundlePath' + i])) {
      config.addons.push(addonname);
      i++;
    }
  }
  return config;

  // handle prefs
  var listbox = document.getElementById('prefList');
  listbox.clear();

  var i = 1;
  var prefname;
  var listitem;
  while ((prefname = configarray['PreferenceName' + i])) {
    /* Old config file - figure out pref type */
    if (!(configarray['PreferenceType' + i])) {
      /* We're going to use this a lot */
      var value = configarray['PreferenceValue' + i];
      if ((value.toLowerCase() == "true") || (value.toLowerCase() == "false")) {
        configarray['PreferenceType' + i] = "boolean";
        value = value.toLowerCase();
      } else if (parseInt(value) === value) {
        configarray['PreferenceType' + i] = "integer";
      } else {
        /* Remove opening and closing quotes if they exist */
        configarray['PreferenceType' + i] = "string";
        if (value.charAt(0) == '"')
          value = value.substring(1,value.length);
        if (value.charAt(value.length-1) == '"')
          if (value.charAt(value.length-2) != '\\')
            value = value.substring(0,value.length-1);
      }
      configarray['PreferenceValue' + i] = value;
    }
    if (configarray['PreferenceValue' + i]) {
      listitem = listbox.appendItem(prefname + "  (" + configarray['PreferenceValue' + i] + ")", configarray['PreferenceValue' + i]);
    } else {
      listitem = listbox.appendItem(prefname, "");
    }
    listitem.cck['prefname'] = prefname;

    if (configarray['PreferenceLock' + i] == "true") {
      listitem.cck['lock'] = "true";
      listitem.setAttribute("locked", "true");
    } else {
      listitem.cck['lock'] = "";
    }
    // Migrate bad integers
    if (configarray['PreferenceType' + i] == "integer") {
      if (!(parseInt(configarray['PreferenceValue' + i]) === configarray['PreferenceValue' + i])) {
	configarray['PreferenceType' + i] = "string";
      }
    }
    listitem.cck['type'] = configarray['PreferenceType' + i];
    i++;
  }

  // handle plugins
  listbox = document.getElementById('browserPluginList');
  listbox.clear();


  var i = 1;
  var pluginname;
  while ((pluginname = configarray['BrowserPluginPath' + i])) {
    if (configarray['BrowserPluginType' + i]) {
      listbox.appendItem(pluginname, configarray['BrowserPluginType' + i]);
    } else {
      listbox.appendItem(pluginname, null);
    }
    i++;
  }

  // handle toolbar folder with bookmarks
  listbox = document.getElementById('tbFolder.bookmarkList');
  listbox.clear();

  var i = 1;
  while ((name = configarray['ToolbarFolder1.BookmarkTitle' + i])) {
    if (configarray['ToolbarFolder1.BookmarkType' + i] == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(name, configarray['ToolbarFolder1.BookmarkURL' + i]);
    }
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray['ToolbarFolder1.BookmarkType' + i] == "live") {
      listitem.cck['type'] = "live";
      listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
    } else if (configarray['ToolbarFolder1.BookmarkType' + i] == "separator") {
      listitem.cck['type'] = "separator";
      listitem.setAttribute("image", "");
    } else {
      listitem.cck['type'] = "";
      listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
    }
    i++;
  }
  // handle toolbar bookmarks
  listbox = document.getElementById('tb.bookmarkList');
  listbox.clear();

  var i = 1;
  while ((name = configarray['ToolbarBookmarkTitle' + i])) {
    if (configarray['ToolbarBookmarkType' + i] == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(name, configarray['ToolbarBookmarkURL' + i]);
    }
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray['ToolbarBookmarkType' + i] == "live") {
      listitem.cck['type'] = "live";
      listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
    } else if (configarray['ToolbarBookmarkType' + i] == "separator") {
      listitem.cck['type'] = "separator";
      listitem.setAttribute("image", "");
    } else {
      listitem.cck['type'] = "";
      listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
    }
    i++;
  }

  // handle folder with bookmarks
  listbox = document.getElementById('bmFolder.bookmarkList');
  listbox.clear();

  var i = 1;
  while ((name = configarray['BookmarkFolder1.BookmarkTitle' + i])) {
    if (configarray['BookmarkFolder1.BookmarkType' + i] == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(name, configarray['BookmarkFolder1.BookmarkURL' + i]);
    }
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray['BookmarkFolder1.BookmarkType' + i] == "live") {
      listitem.cck['type'] = "live";
      listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
    } else if (configarray['BookmarkFolder1.BookmarkType' + i] == "separator") {
      listitem.cck['type'] = "separator";
      listitem.setAttribute("image", "");
    } else {
      listitem.cck['type'] = "";
      listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
    }
    i++;
  }
  // handle bookmarks
  listbox = document.getElementById('bm.bookmarkList');
  listbox.clear();

  var i = 1;
  while ((name = configarray['BookmarkTitle' + i])) {
    if (configarray['BookmarkType' + i] == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(name, configarray['BookmarkURL' + i]);
    }
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray['BookmarkType' + i] == "live") {
      listitem.cck['type'] = "live";
      listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
    } else if (configarray['BookmarkType' + i] == "separator") {
      listitem.cck['type'] = "separator";
      listitem.setAttribute("image", "");
    } else {
      listitem.cck['type'] = "";
      listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
    }
    i++;
  }




  // handle registry items
  listbox = document.getElementById('regList');
  listbox.clear();

  var i = 1;
  var regname;
  while ((regname = configarray['RegName' + i])) {
    var listitem = listbox.appendItem(regname, "");
    listitem.cck['rootkey'] = configarray['RootKey' + i];
    listitem.cck['key'] = configarray['Key' + i];
    listitem.cck['name'] = configarray['Name' + i];
    listitem.cck['namevalue'] = configarray['NameValue' + i];
    listitem.cck['type'] = configarray['Type' + i];
    i++;
  }

  // cert list
  listbox = document.getElementById('certList');
  listbox.clear();

  var i = 1;
  var certpath;
  while ((certpath = configarray['CertPath' + i])) {
    var listitem;
    if (configarray['CertTrust' + i]) {
      listitem = listbox.appendItem(certpath, configarray['CertTrust' + i]);
    } else {
      listitem = listbox.appendItem(certpath);
      listitem.server = true;
    }
    i++;
  }

  // bundle list
  listbox = document.getElementById('bundleList');
  listbox.clear();

  var i = 1;
  var bundlepath;
  while ((bundlepath = configarray['BundlePath' + i])) {
    var listitem = listbox.appendItem(bundlepath, "");
    i++;
  }

  var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);

  // handle searchengines
  listbox = document.getElementById('searchEngineList');
  listbox.clear();

  var menulist = document.getElementById('defaultSearchEngine')
  menulist.selectedIndex = -1;
  menulist.removeAllItems();

  /* I changed the name from SearchPlugin to SearchEngine. */
  /* This code is to support old config files */
  var searchname = "SearchEngine";
  if  (configarray['SearchPlugin1']) {
    searchname = "SearchPlugin";
  }

  var i = 1;
  var searchengineurl;
  while ((searchengineurl = configarray[searchname + i])) {
    name = getSearchEngineName(searchengineurl);
    listitem = listbox.appendItem(name, "");
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray[searchname + 'Icon' + i].length > 0) {
      try {
        sourcefile.initWithPath(configarray[searchname + 'Icon' + i]);
        var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                               .getService(Components.interfaces.nsIIOService);
        var imgfile = ioServ.newFileURI(sourcefile);
        listitem.setAttribute("image", imgfile.spec);
      } catch (e) {
      }
    } else {
      listitem.setAttribute("image", getSearchEngineImage(searchengineurl));
    }
    listitem.cck['name'] = name;
    listitem.cck['engineurl'] = searchengineurl;
    listitem.cck['iconurl'] = configarray[searchname + 'Icon' + i];
    i++;
  }

  RefreshDefaultSearchEngines();

  if (configarray["DefaultSearchEngine"]) {
    menulist.value = configarray["DefaultSearchEngine"];
  }

  var hidden = document.getElementById("hidden");
  hidden.checked = configarray["hidden"];

  var appManaged = document.getElementById("appManaged");
  appManaged.checked = configarray["appManaged"];

  var aboutconfig = document.getElementById("noaboutconfig");
  aboutconfig.checked = configarray["noaboutconfig"];

  var alwaysdefaultbrowser = document.getElementById("alwaysdefaultbrowser");
  alwaysdefaultbrowser.checked = configarray["alwaysdefaultbrowser"];

  var privatebrowsing = document.getElementById("noprivatebrowsing");
  privatebrowsing.checked = configarray["noprivatebrowsing"];

  var sync = document.getElementById("nosync");
  sync.checked = configarray["nosync"];

  var amo = document.getElementById("noamo");
  amo.checked = configarray["noamo"];

  var noWelcomePage = document.getElementById("noWelcomePage");
  noWelcomePage.checked = configarray["noWelcomePage"];

  var noOverridePage = document.getElementById("noOverridePage");
  noOverridePage.checked = configarray["noOverridePage"];

  var tabsonbottom = document.getElementById("tabsonbottom");
  tabsonbottom.checked = configarray["tabsonbottom"];

  var bookmarksbar = document.getElementById("bookmarksbar");
  bookmarksbar.checked = configarray["bookmarksbar"];

  var menubar = document.getElementById("menubar");
  menubar.checked = configarray["menubar"];

  var addonbar = document.getElementById("addonbar");
  addonbar.checked = configarray["addonbar"];

  if (configarray["defaultBookmarksToRemove"]) {
    var defaultBookmarksToRemove = configarray["defaultBookmarksToRemove"].split(',');
    for (var i=0; i < defaultBookmarksToRemove.length; i++)
      document.getElementById(defaultBookmarksToRemove[i]).checked = true;
  }

  var proxyitem = document.getElementById("shareAllProxies");
  proxyitem.checked = configarray["shareAllProxies"];

  var item = document.getElementById("ToolbarLocation");
  if (configarray["ToolbarLocation"]) {
    item.value = configarray["ToolbarLocation"];
  } else {
    item.value = "Last";
  }

  var item = document.getElementById("BookmarkLocation");
  if (configarray["BookmarkLocation"]) {
    item.value = configarray["BookmarkLocation"];
  } else {
    item.value = "Last";
  }

  DoEnabling();
  toggleProxySettings();

  stream.close();
}

