
function CheckETD() {
	this.returns = ["DATESET", "DELAY","CHANGED"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log(`[Event Triggered] Check ETA Change for master ${data.masterNo}`)
		if (data.data.lastStatusDetails && data.data.lastStatusDetails.estimatedDepartureDate) {
			console.log(`New ETD from SwivelTrack: ${data.data.lastStatusDetails.estimatedDepartureDate}`)
			console.log('New ETD from SwivelTrack', (helper.moment(data.data.lastStatusDetails.estimatedDepartureDate)).format('YYYY-MM-DD HH:ii:ss'))
			if (data.oldData.lastStatusDetails && data.oldData.lastStatusDetails.estimatedDepartureDate == null) {
				console.log("NEW DEPARTURE DATE FOR BILL %s: %s", data.data.id, data.data.lastStatusDetails.estimatedDepartureDate);
				helper.persistence.models.bill.findOne({ customer: data.data.customerId, masterNo: data.data.masterNo })
					.then((bill) => {
						console.log(`FM3000 ETA: ${bill.estimatedArrivalDate}`)
						if (bill.estimatedDepartureDate < data.data.lastStatusDetails.estimatedDepartureDate) {
							console.log(`ETD DELAY FOR BILL ${data.data.masterNo} CUSTOMER-ID ${data.data.customerId}: ${data.data.estimatedDepartureDate}`);
							return "DELAY";
						} else {
							return "DATESET";
						}
					})
			} else {
				if (data.data.lastStatusDetails.estimatedDepartureDate < data.oldData.lastStatusDetails.estimatedDepartureDate) {
					console.log(`ETD DELAY FOR BILL ${data.data.masterNo} CUSTOMER-ID ${data.data.customerId}: ${data.data.estimatedDepartureDate}`);
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
