function lazadaNotificationHandler () {
  var statusMapping = require("./status-mapping.js");
  var getUrl = function (helper, action){
    // let hmac = helper.crypto.createHmac("sha512", new Buffer(constants.TOKEN, 'utf-8'));
    // let signed = hmac.update(new Buffer(encodeURIComponent(message), 'utf-8')).digest("hex");
    return `
      http://cbestaging.lazada.com/lzdelg-gw/cb-ftt/mawbsub/receive
      ?action=updateStatus
      &timestamp=${helper.moment().toISOString(true)}
      &userid=Swivel
      &signature=6700f708944732491dfebdf559422923c818e3c1fbd9df15e7e6688e097a81d3
    `;
  }
  var compare = function (oldTracking, newTracking, diff) {
    return oldTracking.lastStatus !== newTracking.lastStatus
    || oldTracking.lastStatusCode !== newTracking.lastStatusCode
    || oldTracking.lastStatusDate !== newTracking.lastStatusDate
    || oldTracking.estimatedDepartureDate !== newTracking.estimatedDepartureDate
    || oldTracking.estimatedArrivalDate !== newTracking.estimatedArrivalDate
    || oldTracking.actualDepartureDate !== newTracking.actualDepartureDate
    || oldTracking.actualArrivalDate !== newTracking.actualArrivalDate
    || diff(oldTracking.lastStatusDetails, newTracking.lastStatusDetails);
  }
  this.handle = function (appId, params, helper) {
    console.log('[LAZADA] Start sending data to lazada')
    var url = getUrl(helper, params.handlerParameters.action);
    var entity = params.data.modelName;
    var oldTracking = params.data.oldData;
    var newTracking = params.data.data;
    if (newTracking && newTracking.lastStatusDetails && compare(oldTracking, newTracking, helper.diff)) { // IF STATUS UPDATED
      const mawbObject = {
        ...newTracking.lastStatusDetails,
        history:
          newTracking.lastStatusDetails.history && newTracking.lastStatusDetails.history.length > 0
            ? newTracking.lastStatusDetails.history.map(({ statusDescription_cn, ...status }) => status)
            : []
      }
      console.log('[LAZADA] what to sent out', mawbObject)
      try {
        helper.restClient.post(url, mawbObject, (postData) => {
          if(Buffer.isBuffer(postData)){
            postData = postData.toString('utf8');
          }
          helper.saveLog(appId, url, entity, newTracking.id, JSON.stringify(mawbObject), JSON.stringify(postData), null);
          helper.emailer.sendFreeMail({
            to: ["ken.chan@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
            from: "administrator@swivelsoftware.com",
            subject: `Success to send Status update to Lazada (MAWB: ${newTracking.masterNo})`,
            html: `<p>URL: ${url}</p><p>Data Return:</p><br/><p>${JSON.stringify(postData)}</p>`
          }, {});
        })
      } catch (e) {
        helper.saveLog(appId, url, entity, newTracking.id, JSON.stringify(mawbObject), null, JSON.stringify(e));
        helper.emailer.sendFreeMail({
          to: ["ken.chan@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
          from: "administrator@swivelsoftware.com",
          subject: `Fail to send Status update to Lazada (MAWB: ${newTracking.masterNo})`,
          html: `<p>URL: ${url}</p><p>Error: ${JSON.stringify(e)}</p>`
        }, {});
      }
    }
  }
}

module.exports = new lazadaNotificationHandler();
