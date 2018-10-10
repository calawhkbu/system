
function CheckETD() {
	this.returns = ["DATESET", "DELAY","CHANGED"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log(`[Event Triggered] Check ETD Change for master ${data.data.masterNo}`)
		if (data.data.estimatedDepartureDate) {
			console.log(`New ETD from SwivelTrack: ${data.data.estimatedDepartureDate}`)
			if (data.oldData.estimatedArrivalDate == null) {
				var promise = new Promise(function (resolve) {
					helper.persistence.models.bill.findOne({ where:{ customerId: data.data.customerId, masterNo: data.data.masterNo } })
						.then((bill) => {
							var oldEstimatedDepartureDate = helper.moment(bill.estimatedDepartureDate);
							var newEstimatedDepartureDate = helper.moment(data.data.estimatedDepartureDate);
							if (!oldEstimatedDepartureDate.isSame(newEstimatedDepartureDate)) {
								console.log(`ETD CHANGE FOR BILL ${data.data.masterNo} CUSTOMER-ID ${data.data.customerId}: ${data.data.estimatedDepartureDate}`);
								return resolve("DELAY");
							} else {
								return resolve("DATESET");
							}
						})
				})
				return promise;
			} else {
				if (data.data.estimatedDepartureDate && data.data.estimatedDepartureDate != data.oldData.estimatedDepartureDate) {
					console.log(`ETD CHANGED FOR BILL ${data.data.masterNo} CUSTOMER-ID ${data.data.customerId}: ${data.data.estimatedDepartureDate}`);
					return "DELAY";
				} else {
					return "DATESET";
				}
			}
		} else {
			return "DATESET";
		}
	}
}

module.exports = new CheckETD();
