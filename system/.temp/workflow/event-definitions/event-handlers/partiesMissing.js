function partiesMissing() {
  this.handle = function(definition, data, handlerParameters, helper) {
    console.log(JSON.stringify(data))
    helper.validatePartiesAndSendAlert(definition, data, handlerParameters)
  }
}

module.exports = new partiesMissing()
