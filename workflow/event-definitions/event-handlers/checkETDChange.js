
function CheckETD() {
	this.returns = ["DATESET", "DELAY","CHANGED"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log('Check ETD Changed')
		console.log('Old ETD', data.oldData.lastStatusDetails.estimatedDepartureDate)
		console.log('New ETD', data.data.lastStatusDetails.estimatedDepartureDate)
		if (data.data.lastStatusDetails.estimatedDepartureDate) {
			if (data.oldData.lastStatusDetails.estimatedDepartureDate == null) {
				console.log("NEW DEPARTURE DATE FOR BILL %s: %s", data.data.id, data.data.lastStatusDetails.estimatedDepartureDate);
				helper.persistence.models.bill.findOne({ id: data.data.id })
					.then((bill) => {
						console.log('FM3000 ETD', bill.estimatedDepartureDate)
						if (bill.estimatedDepartureDate < data.data.lastStatusDetails.estimatedDepartureDate) {
							console.log("ETD DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.lastStatusDetails.estimatedDepartureDate);
							return "DELAY";
						} else {
							return "DATESET";
						}
					})
			} else {
				if (data.data.lastStatusDetails.estimatedDepartureDate < data.oldData.lastStatusDetails.estimatedDepartureDate) {
					console.log("ETD DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.lastStatusDetails.estimatedDepartureDate);
					return "DELAY";
				}
			}
		}
	}
}

module.exports = new CheckETD();
