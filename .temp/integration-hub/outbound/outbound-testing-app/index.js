function testingOutboundHandler() {
  this.handle = function(appId, params, helper) {
    var url = 'http://localhost'
    var reqOptions = {
      method: 'GET',
      uri: url,
    }
    helper
      .rp(reqOptions)
      .then(response => {
        helper.saveLog(
          appId,
          url,
          null,
          null,
          JSON.stringify(reqOptions),
          JSON.stringify(response),
          null
        )
      })
      .catch(e => {
        helper.saveLog(appId, url, null, null, null, null, JSON.stringify(e))
      })
  }
}

module.exports = new testingOutboundHandler()
