function fm3kHandler () {
  this.handle = function (appId, params, helper) {
    console.log('here')
    var booking = params.data;
    helper.persistence.models.customer.findOne({where: {id: booking.customerId}})
        .then(customer => {
          if (customer.id === 49) {
            Object.keys(booking.bookingParties).map(p1 => {
              booking.bookingParties[p1].contact = booking.bookingParties[p1].contact.split(';')[0]
              booking.bookingParties[p1].contact = booking.bookingParties[p1].contact.substring(0, 50)
              booking.bookingParties[p1].phone = booking.bookingParties[p1].phone.split(';')[0]
              booking.bookingParties[p1].phone = booking.bookingParties[p1].phone.substring(0, 50)
              booking.bookingParties[p1].email = booking.bookingParties[p1].email.split(';')[0]
              booking.bookingParties[p1].email = booking.bookingParties[p1].email.substring(0, 50)
            })
          }
          console.log(booking)
          console.log('customer', customer)
          if(customer && customer.configuration && customer.configuration.webService["Booking"]) {
            let api = customer.wsURL + "/" + customer.configuration.webService["Booking"].api;
            try {
              var reqPayLoad = JSON.stringify({ ...booking, isUpdate: params.update });
              console.log('api', api)
              helper.restClient.post(api, {data: reqPayLoad}, (postData, response) => {
                console.log('sent to FM3000')
                if(Buffer.isBuffer(postData)){
                  postData = postData.toString('utf8');
                }
                if(postData && postData.trim().length > 0) {
                  try {
                    helper.emailer.sendMail({
                      to: ["ken.chan@swivelsoftware.com"],   //TODO REMOVE HARD-CODED
                      from: "alert@swivelsoftware.com",
                      subject: "TEST - Failed to post booking to Swivel ERP",
                      text: "Please contact system administrator."
                    }, {booking: booking, error: postData});
                  } catch (e) {
                  }
                  helper.saveLog(appId, api, 'booking', booking.id, reqPayLoad, null, JSON.stringify(postData));
                } else {
                  helper.saveLog(appId, api, 'booking', booking.id, reqPayLoad, JSON.stringify(postData), null);
                }
              })
            } catch (e) {
              console.error('fm3000', e)
              helper.saveLog(appId, api, 'booking', booking.id, reqPayLoad, null, JSON.stringify(e));
            }
          }
        })
  }
}

module.exports = new fm3kHandler();
