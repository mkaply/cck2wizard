var gBookmarksToolbarListbox = null;

function onBookmarksLoad() {
  gBookmarksToolbarListbox = document.getElementById("bookmarks-toolbar-listbox");
}
window.addEventListener("load", onBookmarksLoad, false);

function onBookmarksUnload() {
}
window.addEventListener("unload", onBookmarksUnload, false);

function setBookmarks(config) {
  if ("bookmarks" in config && "toolbar" in config.bookmarks) {
    addBookmarks(gBookmarksToolbarListbox, config.bookmarks.toolbar);
  }
}

function addBookmarks(listbox, bmArray, level) {
  if (!level)
    level = 0;
  for (var i=0; i < bmArray.length; i++) {
    var listitem = addBookmark(listbox, bmArray[i]);
    listitem.setAttribute("level", level);
    if ("folder" in bmArray[i]) {
      listitem.setAttribute("folder", "true");
      level = level + 1;
      addBookmarks(listbox, bmArray[i]["folder"], level);
      level = level - 1;
    }
  }
}

function getBookmarks(config) {
  function handleFolder(folderLevel, listbox) {
    var folder = [];
    currentItem++;
    while (currentItem < listbox.itemCount) {
      var listitem = listbox.getItemAtIndex(currentItem);
      if (parseInt(listitem.getAttribute("level"), 10) <= folderLevel) {
        break;
      }
      var bookmark = convertListItemToBookmark(listitem);
      if (listitem.hasAttribute("folder")) {
        bookmark.folder = handleFolder(parseInt(listitem.getAttribute("level"), 10), listbox);
      }
      folder.push(bookmark);
      currentItem++;
    }
    currentItem--;
    return folder;
  }
  
  var currentItem = 0;
  if (gBookmarksToolbarListbox.itemCount > 0) {
    if (!("bookmarks" in config)) {
      config.bookmarks = {};
      config.bookmarks.toolbar = [];
      while (currentItem < gBookmarksToolbarListbox.itemCount) {
        var listitem1 = gBookmarksToolbarListbox.getItemAtIndex(currentItem);
        var bookmark1 = convertListItemToBookmark(listitem1);
        if (listitem1.hasAttribute("folder")) {
          bookmark1.folder = handleFolder(parseInt(listitem1.getAttribute("level"), 10), gBookmarksToolbarListbox);
        }
        config.bookmarks.toolbar.push(bookmark1);
        currentItem++;
      }
    }
  }
  return config;
}

function processBookmarks(startIndex) {
  var listitem = gBookmarksToolbarListbox.getItemAtIndex(i);
  
}

function resetBookmarks() {
  while (gBookmarksToolbarListbox.itemCount > 0) {
    gBookmarksToolbarListbox.removeItemAt(0);
  }
}

function addBookmark(listbox, bookmark) {
  //for (var i=0; i < gRegistryListbox.itemCount; i++) {
  //  var listitem = gRegistryListbox.getItemAtIndex(i);
  //  var label = listitem.firstChild.getAttribute("label");
  //  if (label == name) {
  //    if (!update) {
  //      alert("duplicate");
  //      return;
  //    }
  //    updateRegistryListItem(listitem, name, value, type, locked);
  //    return;
  //  }
  //  if (label > name) {
  //    gRegistryListbox.insertBefore(createRegistryListItem(name, value, type, locked),
  //                                     listitem);
  //    return;
  //  }
  //}
  var listitem = createBookmarkListItem(bookmark);
  listitem.setAttribute("level", "0");
  listbox.appendChild(listitem);
  return listitem;
}

function createListCell(label) {
  var listcell = document.createElement("listcell");
  listcell.setAttribute("label", label);
  return listcell;
}

function createBookmarkListItem(bookmark) {
  var listitem = document.createElement("listitem");
  if ("name" in bookmark) {
    var listcell = createListCell(bookmark.name);
    listcell.setAttribute("class", "listcell-iconic");
    listitem.appendChild(listcell);
  }
  if ("location" in bookmark) {
    listitem.appendChild(createListCell(bookmark.location));
  }
  if ("type" in bookmark) {
    listitem.setAttribute("type", bookmark.type);
  }
  if ("folder" in bookmark) {
    listitem.setAttribute("folder", "true");
  }
  listitem.setAttribute("context", "bookmarks-contextmenu");
  return listitem;
}

function updateBookmarkListItem(listitem, bookmark) {
  listitem.childNodes[0].setAttribute("label", bookmark.name);
  listitem.childNodes[1].setAttribute("label", bookmark.location);
  return listitem;
}

function onDeleteBookmark(target) {
  var listbox = target.parentNode;
  if (target.hasAttribute("folder")) {
//    alert("this is a folder");
    var itemsToDelete = getItemsToMove(target);
    for (var i=0; i < itemsToDelete.length; i++) {
      listbox.removeChild(itemsToDelete[i]);
    }

    return;
  }
  listbox.removeChild(listbox.selectedItem);
}

function onDragStart(event) {
  if (event.target.nodeName == 'listitem') {
    event.dataTransfer.setData('cck2/bookmark', event.target.parentNode.selectedIndex);
//      <listbox ondragstart="if (event.target.nodeName == 'listitem') event.dataTransfer.setData('text/plain', 'This text may be dragged')" ondrop="alert(event.target.nodeName);" ondragover="return false">
    
  }
}

function onDragOver(event) {
  return onDragEnter(event);
}

function checkIfDescendantListItem(ancestor, descendant) {
  var folderLevel = parseInt(ancestor.getAttribute("level"), 10);
  var listitem = ancestor;
  while ((listitem = listitem.nextSibling)) {
    if (parseInt(listitem.getAttribute("level"), 10) > folderLevel) {
      if (listitem == descendant) {
        return true;
      }
    } else {
      return false;
    }
  }
  return false;
}

function onDragEnter(event) {
  if (event.target.nodeName == "listheader") {
    return true;
  }
  if (event.dataTransfer.types.contains("cck2/bookmark")) {
    if (event.target.nodeName == "listitem") {
      var listbox = event.target.parentNode;
      var data = event.dataTransfer.getData("cck2/bookmark");
      var listitem = listbox.getItemAtIndex(data);
      // Can't drag to ourself
      if (listitem == event.target) {
        return true;
      }
      if (listitem.hasAttribute("folder")) {
        // There is a potential we are being dragged to our own child.
        return checkIfDescendantListItem(listitem, event.target);
      }
    }
    return false;
  }
  return true;
}

function getItemsToMove(listitem) {
  var listitemsToMove = [];
  listitemsToMove.push(listitem);
  var folderLevel = parseInt(listitem.getAttribute("level"), 10);
  while ((listitem = listitem.nextSibling)) {
    if (parseInt(listitem.getAttribute("level"), 10) > folderLevel) {
      listitemsToMove.push(listitem);
    } else {
      break;
    }
  }
  return listitemsToMove;
}

// Given a folder, this function returns the item
// that should be used to insert before to add to the end.
function getLastFolderItem(listitem) {
  var folderLevel = parseInt(listitem.getAttribute("level"), 10);
  while ((listitem = listitem.nextSibling)) {
    if (parseInt(listitem.getAttribute("level"), 10) <= folderLevel) {
      break;
    }
  }
  return listitem;
}

function onDrop(event) {
  var data = event.dataTransfer.getData("cck2/bookmark");
  if (event.target.nodeName == "listbox") {
    var listbox = event.target;
    var listitem = listbox.getItemAtIndex(data);
    if (listitem.hasAttribute("folder")) {
      listitemsToMove = getItemsToMove(listitem);
      var folderLevel = parseInt(listitem.getAttribute("level"), 10);
      var newLevelOffset = folderLevel - 0;
      for (var i=0; i < listitemsToMove.length; i++) {
        listitemsToMove[i].setAttribute("level", parseInt(listitemsToMove[i].getAttribute("level"), 10) - newLevelOffset);
        listbox.appendChild(listitemsToMove[i]);
      }
    } else {
      listitem.setAttribute("level", "0");
      listbox.appendChild(listitem);
    }
  } else if (event.target.nodeName == "listitem") {
    var listbox = event.target.parentNode;
    var listitem = listbox.getItemAtIndex(data);
    // If source was a folder, move everything
    if (listitem.hasAttribute("folder")) {
      var listitemsToMove = getItemsToMove(listitem);
      var folderLevel = parseInt(listitem.getAttribute("level"), 10);
      var newLevelOffset = folderLevel - parseInt(event.target.getAttribute("level"), 10);
      var target = event.target;
      if (target.hasAttribute("folder")) {
        newLevelOffset -= 1;
        target = getLastFolderItem(target);
      } else {
        target = event.target;
      }
      for (var i=0; i < listitemsToMove.length; i++) {
        listitemsToMove[i].setAttribute("level", parseInt(listitemsToMove[i].getAttribute("level"), 10) - newLevelOffset);
        listbox.insertBefore(listitemsToMove[i], target);
      }
    } else {
      if (event.target.hasAttribute("folder")) {
        listitem.setAttribute("level", parseInt(event.target.getAttribute("level"), 10)+1);
        listbox.insertBefore(listitem, getLastFolderItem(event.target));
      } else {
        listitem.setAttribute("level", event.target.getAttribute("level"));
        listbox.insertBefore(listitem, event.target);
      }
    }
  }
}

function convertListItemToBookmark(listitem) {
  var bookmark = {};
  if (listitem.childNodes[0]) {
    bookmark.name = listitem.childNodes[0].getAttribute("label");
  }
  if (listitem.childNodes[1]) {
    bookmark.location = listitem.childNodes[1].getAttribute("label");
  }
  if (listitem.getAttribute("type") == "separator") {
    bookmark.type = "separator";
  }
  return bookmark;
}

function onKeyPressBookmarksToolbar(event) {
  var listbox = event.target;
  if (listbox.selectedIndex == -1) {
    return;
  }
  if (event.keyCode == event.DOM_VK_ENTER ||
      event.keyCode == event.DOM_VK_RETURN) {
    onEditBookmark(listbox.selectedItem);
  } else if (event.keyCode == event.DOM_VK_DELETE ||
             event.keyCode == event.DOM_VK_BACK_SPACE) {
    onDeleteBookmark(listbox.selectedItem);
  }
}

function onAddSeparator(target) {
  var listbox;
  if (target.nodeName == "listbox") {
    listbox = target;
  } else {
    listbox = target.parentNode;
  }
  var listitem = document.createElement("listitem");
  listitem.setAttribute("type", "separator");
  if (target.nodeName == "listitem") {
    if (target.hasAttribute("folder")) {
      // Insert as last item in folder
      listitem.setAttribute("level", parseInt(target.getAttribute("level"), 10) + 1);
      listbox.insertBefore(listitem, getLastFolderItem(target));
    } else {
      // insert before node at current level
      listitem.setAttribute("level", parseInt(target.getAttribute("level"), 10));
      listbox.insertBefore(listitem, target);
    }
  } else {
    listitem.setAttribute("level", "0");
    listbox.appendChild(listitem);
  }
}

function onAddBookmark(target) {
  var retVals = { name: null, location: null};
  window.openDialog("chrome://cck2wizard/content/bookmarks-dialog.xul", "cck2wizard-bookmark", "modal", retVals);
  if (retVals.cancel) {
    return;
  }
  var listbox;
  if (target.nodeName == "listbox") {
    listbox = target;
  } else {
    listbox = target.parentNode;
  }
  var listitem = createBookmarkListItem(retVals);
  if (target.nodeName == "listitem") {
    if (target.hasAttribute("folder")) {
      // Insert as last item in folder
      listitem.setAttribute("level", parseInt(target.getAttribute("level"), 10) + 1);
      listbox.insertBefore(listitem, getLastFolderItem(target));
    } else {
      // insert before node at current level
      listitem.setAttribute("level", parseInt(target.getAttribute("level"), 10));
      listbox.insertBefore(listitem, target);
    }
  } else {
    addBookmark(target, retVals);
  }
}

function onAddFolder(target) {
  var retVals = { name: null, location: null, folder: true};
  window.openDialog("chrome://cck2wizard/content/bookmarks-dialog.xul", "cck2wizard-bookmark", "modal", retVals);
  if (retVals.cancel) {
    return;
  }
  var level = parseInt(target.getAttribute("level"), 10) + 1;
  if (level > 5) {
    alert("too deep");
    return;
  }
  var listbox;
  if (target.nodeName == "listbox") {
    listbox = target;
  } else {
    listbox = target.parentNode;
  }
  var listitem = createBookmarkListItem(retVals);
  listitem.setAttribute("folder", "true");
  if (target.nodeName == "listitem") {
    if (target.hasAttribute("folder")) {
      // Insert as last item in folder
      listitem.setAttribute("level", parseInt(target.getAttribute("level"), 10) + 1);
      listbox.insertBefore(listitem, getLastFolderItem(target));
    } else {
      // insert before node at current level
      listitem.setAttribute("level", parseInt(target.getAttribute("level"), 10));
      listbox.insertBefore(listitem, target);
    }
  } else {
    listitem.setAttribute("level", "0");
    listbox.appendChild(listitem);
  }
}

function onEditBookmark(listitem) {
  var retVals = convertListItemToBookmark(listitem);
  window.openDialog("chrome://cck2wizard/content/bookmarks-dialog.xul", "cck2wizard-bookmark", "modal", retVals);
  if (retVals.cancel) {
    return;
  }
  updateBookmarkListItem(listitem, retVals);
}