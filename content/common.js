var cckwizard;
if (!cckwizard)
{
  cckwizard = {};
  cckwizard.common = {};

  cckwizard.initModule = function initModule(outerscope, scopename) {
    if (!outerscope[scopename])
      outerscope[scopename] = {};
  }
  cckwizard.loadJS = function loadJS(url, scope) {
    Services.scriptloader.loadSubScript(url, scope);
  }
}

