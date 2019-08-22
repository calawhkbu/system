function qwykHandler() {
  this.handle = function(appId, params, helper) {
    var url = `${helper.config.QWYK_IO.baseURL}/jwt/api-token-auth`
    var reqOptions = {
      method: 'POST',
      uri: url,
      body: {
        username: helper.config.QWYK_IO.username,
        password: helper.config.QWYK_IO.password,
      },
      json: true, // Automatically stringifies the body to JSON
    }
    helper
      .rp(reqOptions)
      .then(json => {
        console.log('json response ', json)
        helper.saveLog(appId, url, null, null, JSON.stringify(reqOptions), JSON.stringify(json), null)
        helper.redisClient.set('token', json.token, helper.redis.print)
      })
      .catch(e => {
        console.log(e)
        helper.saveLog(appId, url, null, null, JSON.stringify(reqOptions), null, JSON.stringify(e))
      })
    console.log('get qwyk token function is fired')
  }
}

module.exports = new qwykHandler()
