
function clearReturn() {
	this.returns = [""];
	this.handle = function(definition, data, handlerParameters, helper) {
    return ""
	}
}

module.exports = new clearReturn();
