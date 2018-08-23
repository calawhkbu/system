
function echoData() {

	this.handle = function(definition, data, handlerParameters, helper) {
		console.log("echoData: " + JSON.stringify(data));
		console.log("echoData parameters: " + JSON.stringify(handlerParameters));
	}
}

module.exports = new echoData();