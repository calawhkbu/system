function iPOMHandler () {
  this.handle = function (appId, params, helper) {
    var purchaseOrder = params.data;
    helper.persistence.models.customer.findOne({ where: { id: purchaseOrder.customerId } })
      .then(customer => {
        if (customer && customer.configuration && customer.configuration.webService["purchaseOrder"]) {
          let api = customer.configuration.webService["purchaseOrder"].api;
          let reqPayLoad = JSON.stringify(purchaseOrder);
          try {
            console.log(api, reqPayLoad)
            helper.restClient.post(api, { data: reqPayLoad }, (postData, response) => {
              if (Buffer.isBuffer(postData)) {
                postData = postData.toString('utf8');
              }
              if (postData && postData.trim().length > 0) {
                helper.emailer.sendFreeMail({
                  to: ["ken.chan@swivelsoftware.com", "waiman.chan@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
                  from: "administrator@swivelsoftware.com",
                  subject: `TEST - Failed to post purchaseOrder to iPOM [DATA SENT OUT]`,
                  html: `<p>PO:${reqPayLoad}</p><p>Data Return:${JSON.stringify(postData)}</p>`
                }, {purchaseOrder: purchaseOrder});
                helper.saveLog(appId, api, 'purchaseOrder', purchaseOrder.id, reqPayLoad, null, JSON.stringify(postData));
              } else {
                helper.saveLog(appId, api, 'purchaseOrder', purchaseOrder.id, reqPayLoad, JSON.stringify(postData), null);
              }
            })
          } catch (e) {
            console.error(e.message, e.stack)
            helper.emailer.sendFreeMail({
              to: ["ken.chan@swivelsoftware.com", "waiman.chan@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
              from: "administrator@swivelsoftware.com",
              subject: `TEST - Failed to post purchaseOrder to iPOM [ERROR]`,
              html: `<p>PO:${reqPayLoad}</p><p>Error: ${JSON.stringify(e.message)}</p><p>${e.stack}</p>`
            }, {purchaseOrder: purchaseOrder});
            helper.saveLog(appId, api, 'purchaseOrder', purchaseOrder.id, reqPayLoad, null, JSON.stringify(e));
          }
        }
      })
  }
}

module.exports = new iPOMHandler();
