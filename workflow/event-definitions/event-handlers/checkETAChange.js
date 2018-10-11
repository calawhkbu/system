
function CheckETA() {
	this.returns = ["DATESET", "DELAY"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log(`[Event Triggered] Check ETA Change for master ${data.data.masterNo}`)
		if (data.data.estimatedArrivalDate) {
			if (data.oldData.estimatedArrivalDate == null) {
				var promise = new Promise(function (resolve) {
					helper.persistence.models.bill.findOne({ where:{ customerId: data.data.customerId, masterNo: data.data.masterNo } })
						.then((bill) => {
							var oldEstimatedArrivalDate = helper.moment(bill.estimatedArrivalDate);
							var newEstimatedArrivalDate = helper.moment(data.data.estimatedArrivalDate);
							console.log(`OLD ETA: ${oldEstimatedArrivalDate}`)
							console.log(`NEW ETA: ${newEstimatedArrivalDate}`)
							if (!oldEstimatedArrivalDate.isSame(newEstimatedArrivalDate)) {
								console.log(`ETA Change FOR BILL ${data.data.masterNo} CUSTOMERID ${data.data.customerId}`);
								return resolve("DELAY");
							} else {
								return resolve("DATESET");
							}
						})
				})
				return promise;
			} else {
				var oldEstimatedArrivalDate = helper.moment(data.oldData.estimatedArrivalDate);
				var newEstimatedArrivalDate = helper.moment(data.data.estimatedArrivalDate);
				console.log(`OLD ETA: ${oldEstimatedArrivalDate}`)
				console.log(`NEW ETA: ${newEstimatedArrivalDate}`)
				if (!oldEstimatedArrivalDate.isSame(newEstimatedArrivalDate)) {
					console.log(`ETA Change FOR BILL ${data.data.masterNo} CUSTOMERID ${data.data.customerId}`);
					return resolve("DELAY");
				} else {
					return resolve("DATESET");
				}
			}
		} else {
			return "DATESET";
		}
	}
}

module.exports = new CheckETA();
