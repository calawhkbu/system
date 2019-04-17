function ENEAPPHandler () {
  this.handle = function (appId, params, helper) {
    var purchaseOrder = helper.persistence.models.purchaseOrder;
    // var purchaseOrderItem = helper.persistence.models.purchaseOrderItem;
    // purchaseOrder.hasMany(purchaseOrderItem);
    console.log('[ENE]', 'Sending Data...')
    const url = 'http://tzumimod.com/controllers/API/api.php';
    var { transactionPeople, people, bookingPartiesPeople, workflowStatusList, trackingReferences, ...booking } = params.data
    return Promise.all(
      booking.bookingPOPackings.reduce(
        (selected, bookingPOPacking) => {
          if (!selected.includes(bookingPOPacking.purchaseOrderId)) {
            selected.push(bookingPOPacking.purchaseOrderId)
          }
          return selected
        },
        []
      ).map(selectedPoID => {
        return purchaseOrder.findOne({
          // include: [
          //   { model: purchaseOrderItem }
          // ],
          where: { id: selectedPoID }
        })
      })
    )
      .then((purchaseOrders) => {
        const reqPayLoad = { ...booking, purchaseOrders }
        console.log('[ENE]', url)
        console.log('[ENE]', JSON.stringify(reqPayLoad))
        try {
          var curl = new helper.Curl();
          curl.setOpt(helper.Curl.option.URL, 'http://tzumimod.com/controllers/API/api.php')
          curl.setOpt(helper.Curl.option.POSTFIELDS, helper.querystring.stringify(reqPayLoad))
          curl.setOpt(helper.Curl.option.HTTPHEADER, [
            'Content-Type:application/json',
            'Token: Bearer kRXEe3eVDJJw/3bnhtzTOvLf4DlKjM6AzWrUGd+42vU='
          ]);
          curl.on( 'end', function( statusCode, body, headers ) {
            helper.saveLog(appId, url, 'booking', booking.id, JSON.stringify(reqPayLoad), JSON.stringify(body), null);
            helper.emailer.sendFreeMail({
              to: ["ken.chan+ene@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
              from: "administrator@swivelsoftware.com",
              subject: `TEST-ENEAPP [SUCCESS]`,
              html: `${JSON.stringify(body)}`
            }, {});
            this.close();
          });
          curl.on( 'error', function( err, curlErrorCode ) {
            helper.saveLog(appId, url, 'booking', booking.id, JSON.stringify(reqPayLoad), null, JSON.stringify(e));
            helper.emailer.sendFreeMail({
              to: ["ken.chan+ene@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
              from: "administrator@swivelsoftware.com",
              subject: `TEST-ENEAPP [FAIL]`,
              html: `${JSON.stringify(e)}`
            }, {});
            this.close();
          });
          return curl.perform();
        } catch (e) {
          console.error(e)
          helper.saveLog(appId, url, 'booking', booking.id, JSON.stringify(reqPayLoad), null, JSON.stringify(e));
          helper.emailer.sendFreeMail({
            to: ["ken.chan+ene@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
            from: "administrator@swivelsoftware.com",
            subject: `TEST-ENEAPP [FAIL]`,
            html: `${JSON.stringify(e)}`
          }, {});
        }
      })
      .catch(e => {
        console.error(JSON.stringify(e))
        helper.saveLog(appId, url, 'booking', booking.id, null, null, JSON.stringify(e));
        helper.emailer.sendFreeMail({
          to: ["ken.chan+ene@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
          from: "administrator@swivelsoftware.com",
          subject: `TEST-ENEAPP [FAIL]`,
          html: `${JSON.stringify(e)}`
        }, {});
      })
  }
}

module.exports = new ENEAPPHandler();
