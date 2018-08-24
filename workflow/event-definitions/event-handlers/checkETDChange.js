
function CheckETD() {
	this.returns = ["DATESET", "DELAY","CHANGED"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log('Check ETD Changed')
		if(data.data.estimatedDepartureDate) {
			if(data.oldData.estimatedDepartureDate == null) {
				console.log("NEW DEPARTURE DATE FOR BILL %s: %s", data.data.id, data.data.estimatedDepartureDate);
				helper.persistence.models.bill.findOne({ id: data.data.id })
					.then((bill) => {
						console.log('FM3000 ETD', bill.estimatedDepartureDate)
						if (bill.estimatedDepartureDate < data.data.estimatedDepartureDate) {
							console.log("ETD DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.estimatedDepartureDate);
							return "DELAY";
						} else {
							return "DATESET";
						}
					})
			} else {
				if (data.data.estimatedDepartureDate < data.oldData.estimatedDepartureDate) {
					console.log("ETD DELAY FOR BILL %s CUSTOMERID %s: %s", data.data.masterNo, data.data.customerId, data.data.estimatedDepartureDate);
					return "DELAY";
				}
			}
		}
	}
}

module.exports = new CheckETD();
