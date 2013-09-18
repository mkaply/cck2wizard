function E(id, context) {
  if (!context) {
    context = document;
  }
  var element = context.getElementById(id);
  if (!element) {
    var toolbox = context.getElementById("navigator-toolbox");
    if (toolbox) {
      // THIS WILL FAIL FOR : in IDs TODO
      element = toolbox.palette.querySelector("#" + id);
    }
  }
  return element;
}

function hide(element) {
  if (element)
    element.setAttribute("hidden", "true");
}

function remove(element) {
  if (element && element.parentNode)
    element.parentNode.removeChild(element);
}

function disable(element) {
  if (element)
    element.setAttribute("disabled", "true");
}

function errorCritical(e) {
  Services.prompt.alert(null, "CCK2", e + "\n\n" + e.stack);
}
