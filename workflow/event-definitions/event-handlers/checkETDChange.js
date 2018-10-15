
function CheckETD() {
	this.returns = ["DATESET", "DELAY","CHANGED"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log(`[Event Triggered] Check ETD Change for master ${data.data.masterNo}`)
		if (data.data.estimatedDepartureDate) {
			if (data.oldData.estimatedDepartureDate == null) {
				var promise = new Promise(function (resolve) {
					helper.persistence.models.bill.findOne({ where:{ customerId: data.data.customerId, masterNo: data.data.masterNo } })
						.then((bill) => {
							var oldEstimatedDepartureDate = helper.moment(bill.estimatedDepartureDate);
							var newEstimatedDepartureDate = helper.moment(data.data.estimatedDepartureDate);
							console.log(`[Master NO:${data.data.masterNo}] Compare with FM3000`);
							console.log(`[Master NO:${data.data.masterNo}] OLD ETD: ${oldEstimatedDepartureDate}, OLD DATA ETD: ${helper.moment(data.oldData.estimatedDepartureDate)}`)
							console.log(`[Master NO:${data.data.masterNo}] NEW ETD: ${newEstimatedDepartureDate}`)
							if (!oldEstimatedDepartureDate.isSame(newEstimatedDepartureDate)) {
								console.log(`ETD CHANGE FOR BILL ${data.data.masterNo} CUSTOMER-ID ${data.data.customerId}`);
								return resolve("DELAY");
							} else {
								return resolve("DATESET");
							}
						})
				})
				return promise;
			} else {
				var oldEstimatedDepartureDate = helper.moment(data.oldData.estimatedDepartureDate);
				var newEstimatedDepartureDate = helper.moment(data.data.estimatedDepartureDate);
				console.log(`[Master NO:${data.data.masterNo}] Compare with Old Data`);
				console.log(`[Master NO:${data.data.masterNo}] OLD ETD: ${oldEstimatedDepartureDate}`)
				console.log(`[Master NO:${data.data.masterNo}] NEW ETD: ${newEstimatedDepartureDate}`)
				if (!oldEstimatedDepartureDate.isSame(newEstimatedDepartureDate)) {
					console.log(`ETD CHANGE FOR BILL ${data.data.masterNo} CUSTOMER-ID ${data.data.customerId}`);
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
