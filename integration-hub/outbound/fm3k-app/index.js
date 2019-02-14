function fm3kHandler () {
  this.handle = function (appId, params, helper) {
    var booking = params.data;
    helper.persistence.models.customer.findOne({where: {id: booking.customerId}})
        .then(customer => {
          if(customer && customer.configuration && customer.configuration.webService["Booking"]) {
            let api = customer.wsURL + "/" + customer.configuration.webService["Booking"].api;
            try {
              var reqPayLoad = JSON.stringify({ ...booking, isUpdate: params.update });
              helper.restClient.post(api, {data: reqPayLoad}, (postData, response) => {
                if(Buffer.isBuffer(postData)){
                  postData = postData.toString('utf8');
                }
                if(postData && postData.trim().length > 0) {
                  helper.emailer.sendMail({
                    to: "alert@swivelsoftware.com",   //TODO REMOVE HARD-CODED
                    from: "alert@swivelsoftware.com",
                    subject: "TEST - Failed to post booking to Swivel ERP {{booking.portOfLoading.portCode}} -> {{booking.portOfDischarge.portCode}} [{{booking.bookingNo}}]",
                    text: "Please contact system administrator. {{error}}"
                  }, {booking: booking, error: postData});
                  helper.saveLog(appId, api, 'booking', booking.id, reqPayLoad, null, JSON.stringify(postData));
                } else {
                  helper.saveLog(appId, api, 'booking', booking.id, reqPayLoad, JSON.stringify(postData), null);
                }
              })
            } catch (e) {
              helper.saveLog(appId, api, 'booking', booking.id, reqPayLoad, null, JSON.stringify(e));
            }
          }
        })
  }
}

module.exports = new fm3kHandler();
