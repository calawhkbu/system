
function CheckStatusChange() {
	this.returns = ["CHANGE", "NONE"];
	this.handle = function(definition, data, handlerParameters, helper) {
		if(data.data.status) {
			if(data.oldData.status != data.data.status) {
				return "CHANGE";
			} 
		}
	}
}

module.exports = new CheckStatusChange();