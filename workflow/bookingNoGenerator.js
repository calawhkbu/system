
function bookingNoGenerator() {

	this.generate = function(booking, helper) {
		console.log("INSIDE GENERATE");
        let salt = Math.random() * 1000;
		if (salt < 1000) salt += 1000;
		return booking.customerId + "-" + helper.moment().format('YYMMDD') + Math.floor(salt);
	}
}

module.exports = new bookingNoGenerator();
