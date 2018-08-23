
function CheckETA() {
	this.returns = ["DATESET", "DELAY"];
	this.handle = function(definition, data, handlerParameters, helper) {
		if(data.data.estimatedArrivalDate) {
			if(data.oldData.estimatedArrivalDate == null) {
				console.log("NEW DEPARTURE DATE FOR BILL %s: %s", data.data.id, data.data.estimatedArrivalDate);
				return "DATESET";
			} else {
				if(data.data.estimatedArrivalDate > data.oldData.estimatedArrivalDate) {
					console.log("DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.estimatedArrivalDate);
					return "DELAY";
				}
			}
		}
	}
}

module.exports = new CheckETA();
