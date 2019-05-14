function sendDataToThirdParty() {

	this.handle = function(definition, data, handlerParameters, helper) {
		if (handlerParameters.appId) {
			console.log('sendDataToThirdParty ' + handlerParameters.appId)
			helper.integrationHub.outboundAPIHandler(handlerParameters.appId, handlerParameters.customerId || data.customerId, {
				definition: definition,
				data: data,
				handlerParameters: handlerParameters
			})
		} else {
			console.log('No app selected to send data to third party')
		}
	}
}

module.exports = new sendDataToThirdParty();
