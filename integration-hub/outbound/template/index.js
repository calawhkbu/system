function templateHandler () {
  this.handle = function (appId, params, helper) {
    try {
      // TODO:: handle ourbound API call here
      helper.saveLog(appId, null, null, null, null, null, null);
    } catch (e) {
      helper.saveLog(appId, null, null, null, null, null, JSON.stringify(e));
    }
  }
}

module.exports = new templateHandler();
