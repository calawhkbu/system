
function logSendBird() {

    this.handle = function(definition, data, handlerParameters, helper) {
        helper.chat.sendNotificationToUser(definition,data,handlerParameters)
    }
}
module.exports = new logSendBird();