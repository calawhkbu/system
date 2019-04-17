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
        let reqPayLoad = {
          data: { ...booking, purchaseOrders },
          headers: {
            "Content-Type": "application/json",
            "Token": "Bearer kRXEe3eVDJJw/3bnhtzTOvLf4DlKjM6AzWrUGd+42vU="
          }
        };
        console.log('[ENE]', JSON.stringify(reqPayLoad))
        try {
          console.log('[ENE] Ready...')
          return helper.restClient.post(url, reqPayLoad, (postData) => {
            console.log('[ENE] RETURN')
            if (Buffer.isBuffer(postData)) {
              postData = postData.toString('utf8');
            }
            console.log('[ENE]', `return ${postData}`)
            helper.saveLog(appId, url, 'booking', booking.id, JSON.stringify(reqPayLoad), postData, null);
            helper.emailer.sendFreeMail({
              to: ["ken.chan+ene@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
              from: "administrator@swivelsoftware.com",
              subject: `TEST-ENEAPP [SUCCESS]`,
              html: `${reqPayLoad.data}`
            }, {});
          })
        } catch (e) {
          console.error(JSON.stringify(e))
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
