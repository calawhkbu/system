
function CheckETD() {
	this.returns = ["DATESET", "DELAY","CHANGED"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log('Check ETD Changed')
		console.log('Old ETD', data.oldData.lastStatuseDetails.estimatedDepartureDate)
		console.log('New ETD', data.data.lastStatuseDetails.estimatedDepartureDate)
		if (data.data.lastStatuseDetails.estimatedDepartureDate) {
			if (data.oldData.lastStatuseDetails.estimatedDepartureDate == null) {
				console.log("NEW DEPARTURE DATE FOR BILL %s: %s", data.data.id, data.data.lastStatuseDetails.estimatedDepartureDate);
				helper.persistence.models.bill.findOne({ id: data.data.id })
					.then((bill) => {
						console.log('FM3000 ETD', bill.estimatedDepartureDate)
						if (bill.estimatedDepartureDate < data.data.lastStatuseDetails.estimatedDepartureDate) {
							console.log("ETD DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.lastStatuseDetails.estimatedDepartureDate);
							return "DELAY";
						} else {
							return "DATESET";
						}
					})
			} else {
				if (data.data.lastStatuseDetails.estimatedDepartureDate < data.oldData.lastStatuseDetails.estimatedDepartureDate) {
					console.log("ETD DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.lastStatuseDetails.estimatedDepartureDate);
					return "DELAY";
				}
			}
		}
	}
}

module.exports = new CheckETD();
