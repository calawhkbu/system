function templateHandler() {
  var handleRequest = function(appId, request, helper) {
    // handle inbound request from here
  }
  var handleResponse = function(appId, response, resData, helper) {
    // handle inbound response from here
  }
  this.handle = function(appId, request, response, helper) {
    try {
      var thirdPartyRequestPayLoad = JSON.stringify(req.body)
      handleRequest(appId, req, helper)
      let oldSend = res.send
      res.send = function(resData) {
        handleResponse(appId, res, resData, helper)
        helper.saveLog(appId, req.url, null, null, thirdPartyRequestPayLoad, resData, null) // uncomment to save log
        oldSend.apply(res, arguments)
      }
    } catch (e) {
      helper.saveLog(appId, req.url, null, null, thirdPartyRequestPayLoad, null, JSON.stringify(e))
    }
  }
}

module.exports = new templateHandler()
