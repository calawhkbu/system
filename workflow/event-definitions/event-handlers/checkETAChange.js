
function CheckETA() {
	this.returns = ["DATESET", "DELAY"];
	this.handle = function(definition, data, handlerParameters, helper) {
		console.log(`[Event Triggered] Check ETA Change for master ${data.data.masterNo}`)
		if (data.data.estimatedArrivalDate) {
			console.log(`New ETA from SwivelTrack: ${data.data.estimatedArrivalDate}`)
			if (data.oldData.estimatedArrivalDate == null) {
				helper.persistence.models.bill.findOne({ customer: data.data.customerId, masterNo: data.data.masterNo })
					.then((bill) => {
						console.log(`FM3000 ETA: ${bill.estimatedArrivalDate}`)
						if (bill.estimatedArrivalDate > data.data.estimatedArrivalDate) {
							console.log(`ETA DELAY FOR BILL ${data.data.masterNo} CUSTOMERID ${data.data.customerId}: ${data.data.estimatedDepartureDate}`);
							return "DELAY";
						} else {
							return "DATESET";
						}
					})
			} else {
				if (data.data.estimatedArrivalDate > data.oldData.estimatedArrivalDate) {
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
