function iPOMHandler () {
  this.handle = function (appId, params, helper) {
    var purchaseOrder = params.data;
    helper.persistence.models.customer.findOne({ where: { id: purchaseOrder.customerId } })
      .then(customer => {
        if (customer && customer.configuration && customer.configuration.webService["purchaseOrder"]) {
          let api = customer.configuration.webService["purchaseOrder"].api;
          console.log(api)
          let reqPayLoad = {
            data: { purchaseOrder: purchaseOrder },
            headers: { "Content-Type": "application/json" }
          };
          try {
            helper.restClient.post(api, reqPayLoad, (postData, response) => {
              if (Buffer.isBuffer(postData)) {
                postData = postData.toString('utf8');
              }
              if (postData && postData.trim().length > 0) {
                const response = JSON.parse(postData.trim())[0]
                if (response.status === 200) {
                  console.log('success send to ipom')
                  helper.saveLog(appId, api, 'purchaseOrder', purchaseOrder.id, reqPayLoad, JSON.stringify(postData), null);
                } else {
                  helper.emailer.sendFreeMail({
                    to: ["ken.chan@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
                    from: "administrator@swivelsoftware.com",
                    subject: `TEST - Failed to post purchaseOrder to iPOM [DATA SENT OUT]`,
                    html: `<p>PO:</p><br/><p>${JSON.stringify(reqPayLoad)}</p><p>Data Return:</p><br/><p>${JSON.stringify(postData)}</p>`
                  }, {purchaseOrder: purchaseOrder});
                  helper.saveLog(appId, api, 'purchaseOrder', purchaseOrder.id, reqPayLoad, null, JSON.stringify(postData));
                }
              } else {
                helper.emailer.sendFreeMail({
                  to: ["ken.chan@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
                  from: "administrator@swivelsoftware.com",
                  subject: `TEST - Failed to post purchaseOrder to iPOM [DATA SENT OUT]`,
                  html: `<p>PO:</p><br/><p>${JSON.stringify(reqPayLoad)}</p><p>Data Return:</p><br/><p>${JSON.stringify(postData)}</p>`
                }, {purchaseOrder: purchaseOrder});
                helper.saveLog(appId, api, 'purchaseOrder', purchaseOrder.id, reqPayLoad, null, JSON.stringify(postData));
              }
            })
          } catch (e) {
            console.error(e.message, e.stack)
            helper.emailer.sendFreeMail({
              to: ["ken.chan@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
              from: "administrator@swivelsoftware.com",
              subject: `TEST - Failed to post purchaseOrder to iPOM [ERROR]`,
              html: `<p>PO:</p><br/><p>${reqPayLoad}</p><p>Error:</p><br/><p>${JSON.stringify(e.message)}</p><p>${e.stack}</p>`
            }, {purchaseOrder: purchaseOrder});
            helper.saveLog(appId, api, 'purchaseOrder', purchaseOrder.id, reqPayLoad, null, JSON.stringify(e));
          }
        }
      })
  }
}

module.exports = new iPOMHandler();
