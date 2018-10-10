
function CheckETA() {
	this.returns = ["DATESET", "DELAY"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log(`[Event Triggered] Check ETA Change for master ${data.data.masterNo}`)
		if (data.data.estimatedArrivalDate) {
			console.log(`New ETA from SwivelTrack: ${data.data.estimatedArrivalDate}`)
			if (data.oldData.estimatedArrivalDate == null) {
				var promise = new Promise(function (resolve) {
					helper.persistence.models.bill.findOne({ where:{ customerId: data.data.customerId, masterNo: data.data.masterNo } })
						.then((bill) => {
							var oldEstimatedArrivalDate = helper.moment(bill.estimatedArrivalDate);
							var newEstimatedArrivalDate = helper.moment(data.data.estimatedArrivalDate);
							if (!oldEstimatedArrivalDate.isSame(newEstimatedArrivalDate)) {
								console.log(`ETA Change FOR BILL ${data.data.masterNo} CUSTOMERID ${data.data.customerId}: ${data.data.estimatedDepartureDate}`);
								return resolve("DELAY");
							} else {
								return resolve("DATESET");
							}
						})
				})
				return promise;
			} else {
				console.log(`Old ETA from SwivelTrack: ${data.oldData.estimatedArrivalDate}`)
				if (data.data.estimatedArrivalDate && data.data.estimatedArrivalDate !== data.oldData.estimatedArrivalDate) {
					console.log(`ETA DELAY FOR BILL ${data.data.masterNo} CUSTOMERID ${data.data.customerId}: ${data.data.estimatedDepartureDate}`);
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

module.exports = new CheckETA();
