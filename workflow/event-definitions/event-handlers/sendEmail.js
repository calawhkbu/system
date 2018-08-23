function sendEmail() {

	this.handle = function(definition, data, handlerParameters, helper) {
		helper.emailer.sendMail({
			from: handlerParameters.from,
			to: handlerParameters.to,
			subject: handlerParameters.subject,
			text: handlerParameters.text,
			template: data.template,
			language: data.language
		}, data);
	}
}

module.exports = new sendEmail();