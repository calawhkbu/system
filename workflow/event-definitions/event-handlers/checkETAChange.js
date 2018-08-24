
function CheckETA() {
	this.returns = ["DATESET", "DELAY"];
	this.handle = function(definition, data, handlerParameters, helper) {
		if (data.data.estimatedArrivalDate) {
			if(data.oldData.estimatedArrivalDate == null) {
				console.log("NEW DEPARTURE DATE FOR BILL %s: %s", data.data.id, data.data.estimatedArrivalDate);
				helper.persistence.models.bill.findOne({ id: data.data.id })
					.then((bill) => {
						if (bill.estimatedArrivalDate > data.data.estimatedArrivalDate) {
							console.log("ETD DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.estimatedDepartureDate);
							return "DELAY";
						} else {
							return "DATESET";
						}
					})
			} else {
				if (data.data.estimatedArrivalDate > data.oldData.estimatedArrivalDate) {
					console.log("DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.estimatedArrivalDate);
					return "DELAY";
				}
			}
		}
	}
}

module.exports = new CheckETA();
