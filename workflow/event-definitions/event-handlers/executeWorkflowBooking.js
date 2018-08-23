function ExecuteWorkflowBooking() {
	this.returns = [];
	this.handle = function(definition, data, handlerParameters, helper) {
		helper.wfManager.onEnter(data.customerId, "booking", data.data.id, data.data.status, {booking: data.data});
	}
}

module.exports = new ExecuteWorkflowBooking();