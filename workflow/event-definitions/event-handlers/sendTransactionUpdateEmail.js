function bookingEmail() {

	this.handle = function(definition, data, handlerParameters, helper) {
        helper.transactionEmail(definition,data, handlerParameters);
	}
}

module.exports = new bookingEmail();