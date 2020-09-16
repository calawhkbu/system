function saveAlert() {
  this.handle = function(definition, data, handlerParameters, helper) {
    helper.alert.saveAlert(definition, data, handlerParameters)
  }
}

module.exports = new saveAlert()
