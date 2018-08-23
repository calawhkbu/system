
function CheckETD() {
	this.returns = ["DATESET", "DELAY","CHANGED"];
	this.handle = function(definition, data, handlerParameters, helper) {
		if(data.data.estimatedDepartureDate) {
			if(data.oldData.estimatedDepartureDate == null) {
				return "DATESET";
			} else {
				if(data.data.estimatedDepartureDate > data.oldData.estimatedDepartureDate) {
					return "DELAY";
				}
            }
		}
	}
}

module.exports = new CheckETD();
