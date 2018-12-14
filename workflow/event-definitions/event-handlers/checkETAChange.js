
function CheckETA() {
	this.returns = ["DATESET", "DELAY"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log(`[Event Triggered] Check ETA Change for master ${data.data.masterNo}`)
		if (data.data.estimatedArrivalDate != null && helper.moment.isDate(data.data.estimatedArrivalDate)) {
			console.log(`[Master NO:${data.data.masterNo}] NEW ETA: ${data.data.estimatedArrivalDate}`)
			return data.oldData.estimatedArrivalDate == null
				? (// Compare ETA from FM3000 and ETA from YunDang this time
					new Promise((resolve) => {
						helper.persistence.models.bill.findOne({ where:{ customerId: data.data.customerId, masterNo: data.data.masterNo } })
							.then((bill) => {
								var oldEstimatedArrivalDate = helper.moment(bill.estimatedArrivalDate);
								var newEstimatedArrivalDate = helper.moment(data.data.estimatedArrivalDate);
								console.log(`[Master NO:${data.data.masterNo}] Compare with FM3000`);
								console.log(`[Master NO:${data.data.masterNo}] OLD ETA: ${oldEstimatedArrivalDate}, OLD DATA ETA: ${helper.moment(data.oldData.estimatedArrivalDate)}`)
								console.log(`[Master NO:${data.data.masterNo}] NEW ETA: ${newEstimatedArrivalDate}`)
								if (!oldEstimatedArrivalDate.isSame(newEstimatedArrivalDate)) {
									console.log(`ETA Change FOR BILL ${data.data.masterNo} CUSTOMERID ${data.data.customerId}`);
									return resolve("DELAY");
								}
								return resolve("DATESET");
							})
							.catch(e => console.error(e) && resolve("ERROR"))
					})
				)
				: (// Compare ETA from YunDang this time and ETA from YunDang last time
					new Promise((resolve) => {
						var oldEstimatedArrivalDate = helper.moment(data.oldData.estimatedArrivalDate);
						var newEstimatedArrivalDate = helper.moment(data.data.estimatedArrivalDate);
						console.log(`[Master NO:${data.data.masterNo}] Compare with Old Data`);
						console.log(`[Master NO:${data.data.masterNo}] OLD ETA: ${oldEstimatedArrivalDate}`)
						console.log(`[Master NO:${data.data.masterNo}] NEW ETA: ${newEstimatedArrivalDate}`)
						if (!oldEstimatedArrivalDate.isSame(newEstimatedArrivalDate)) {
							console.log(`ETA Change FOR BILL ${data.data.masterNo} CUSTOMERID ${data.data.customerId}`);
							return resolve("DELAY");
						}
						return resolve("DATESET");
					})
				);
		}
		console.log(`[Master NO:${data.data.masterNo}] ETA not changed`)
		return "DATESET";
	}
}

module.exports = new CheckETA();
