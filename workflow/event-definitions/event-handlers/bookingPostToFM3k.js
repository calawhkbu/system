function bookingPostToFM3k() {

	this.handle = function(definition, data, handlerParameters, helper) {
		helper.postBookingToFM3k(data);
	}
}

module.exports = new bookingPostToFM3k();
