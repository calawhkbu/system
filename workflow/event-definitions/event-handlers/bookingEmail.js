function bookingEmail() {

	this.handle = function(definition, data, handlerParameters, helper) {
        helper.notifications.handlerNotification(definition,data, handlerParameters);
	}
}

module.exports = new bookingEmail();