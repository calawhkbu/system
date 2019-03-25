function lazadaNotificationHandler () {
  var statusMapping = require("./status-mapping.js");
  var getUrl = function (helper, action){
    // let hmac = helper.crypto.createHmac("sha512", new Buffer(constants.TOKEN, 'utf-8'));
    // let signed = hmac.update(new Buffer(encodeURIComponent(message), 'utf-8')).digest("hex");
    return `http://cbestaging.lazada.com/lzdelg-gw/cb-ftt/mawbsub/receive?action=updateStatus&timestamp=${helper.moment().toISOString(true)}&userid=Swivel&signature=6700f708944732491dfebdf559422923c818e3c1fbd9df15e7e6688e097a81d3`;
  }
  var transform = function (details) {
    const { lastPort, isAtPort, history, lastActualUpdateDate, billCargoTracking, billContainerTracking, ...other } = details
    return {
      ...other,
      history: history && history.length > 0 ? history.map(({ updatedAt, statusPlaceType, statusDescription_cn, ...status }) => status) : [],
      billCargoTracking: billCargoTracking
    }
  }
  var compare = function (oldTracking, newTracking, diff) {
    console.log(oldTracking.lastStatus, newTracking.lastStatus, oldTracking.lastStatus !== newTracking.lastStatus)
    console.log(oldTracking.lastStatusCode, newTracking.lastStatusCode, oldTracking.lastStatusCode !== newTracking.lastStatusCode)
    console.log(oldTracking.lastStatusDate, newTracking.lastStatusDate, oldTracking.lastStatusDate !== newTracking.lastStatusDate)
    console.log(oldTracking.estimatedDepartureDate, newTracking.estimatedDepartureDate, oldTracking.estimatedDepartureDate !== newTracking.estimatedDepartureDate)
    console.log(oldTracking.estimatedArrivalDate, newTracking.estimatedArrivalDate, oldTracking.estimatedArrivalDate !== newTracking.estimatedArrivalDate)
    console.log(oldTracking.actualDepartureDate, newTracking.actualDepartureDate, oldTracking.actualDepartureDate !== newTracking.actualDepartureDate)
    console.log(oldTracking.actualArrivalDate, newTracking.actualArrivalDate, oldTracking.actualArrivalDate !== newTracking.actualArrivalDate)
    console.log(JSON.stringify(diff(oldTracking.lastStatusDetails, newTracking.lastStatusDetails)))

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
    var oldTransform = transform(oldTracking.lastStatusDetails);
    var newTransform = transform(newTracking.lastStatusDetails);
    console.log(JSON.stringify(helper.diff(oldTransform, newTransform)))
    if (newTracking && newTracking.lastStatusDetails && compare(oldTracking, newTracking, helper.diff)) { // IF STATUS UPDATED
      try {
        helper.restClient.post(url, { data: newTransform, headers: { "Content-Type": "application/json" } }, (postData) => {
          if(Buffer.isBuffer(postData)){
            postData = postData.toString('utf8');
          }
          if (postData.success) {
            helper.saveLog(appId, url, entity, newTracking.id, JSON.stringify(newTransform), JSON.stringify(postData), null);
          } else {
            helper.saveLog(appId, url, entity, newTracking.id, JSON.stringify(newTransform), null, JSON.stringify(postData));
            helper.emailer.sendFreeMail({
              to: ["ken.chan+lazada@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
              from: "administrator@swivelsoftware.com",
              subject: `Fial to send data to lazada (MAWB: ${newTracking.masterNo})`,
              html: `<p>Data Return: ${JSON.stringify(postData)}</p>`
            }, {});
          }
        })
      } catch (e) {
        helper.saveLog(appId, url, entity, newTracking.id, JSON.stringify(newTransform), null, JSON.stringify(e));
        helper.emailer.sendFreeMail({
          to: ["ken.chan+lazada@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
          from: "administrator@swivelsoftware.com",
          subject: `Fail to send Status update to Lazada (MAWB: ${newTracking.masterNo})`,
          html: `<p>Data Return: ${JSON.stringify(e)}</p>`
        }, {});
      }
    }
  }
}

module.exports = new lazadaNotificationHandler();
