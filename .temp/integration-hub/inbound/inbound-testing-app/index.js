function testingAppHandler() {
  var template = '{ "status": "{{status-name}}" }'
  var handleRequest = function(appId, req, helper) {
    // handle request from here
    var body = req.body
    var changed = helper.swig.render(template, { locals: body })
    req.body = { ...body, ...JSON.parse(changed) }
  }
  var handleResponse = function(appId, res, resData, helper) {
    delete resData['status-name']
    delete resData['booking-id']
  }
  this.handle = function(appId, req, res, helper) {
    try {
      var thirdPartyRequestPayLoad = JSON.stringify(req.body)
      handleRequest(appId, req, helper)
      let oldSend = res.send
      res.send = function(resData) {
        // handle inbound response from here
        handleResponse(appId, res, resData, helper)
        helper.saveLog(
          appId,
          req.url,
          null,
          null,
          thirdPartyRequestPayLoad,
          JSON.stringify(resData),
          null
        ) // uncomment to save log
        oldSend.apply(res, arguments)
      }
    } catch (e) {
      helper.saveLog(appId, req.url, null, null, thirdPartyRequestPayLoad, null, JSON.stringify(e))
    }
  }
}

module.exports = new testingAppHandler()
