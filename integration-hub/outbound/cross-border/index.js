function lazadaNotificationHandler () {
  var getUrl = function (helper){
    var time = helper.moment().utcOffset("+08:00").format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
    var message = encodeURIComponent(`action=updateStatus&timestamp=${time}&userid=Swivel`)
    var signed = helper.crypto.createHmac("sha256", 'LJADLFUADKJLKUW').update(message).digest("hex");
    return `http://cbestaging.lazada.com/lzdelg-gw/cb-ftt/mawbsub/receive?${message}&signature=${signed}`;
  }
  var transform = function (details) {
    return {
      mawb: details.mawb,
      isClosed: details.isClosed,
      lastStatusCode: details.lastStatusCode,
      lastStatusDate: details.lastStatusDate,
      flightNo: details.flightNo,
      estimatedDepartureDate: details.estimatedDepartureDate,
      actualDepartureDate: details.actualDepartureDate,
      estimatedArrivalDate: details.estimatedArrivalDate,
      actualDepartureDate: details.actualDepartureDate,
      history: details.history && details.history.length > 0 ? details.history.map(({ updatedAt, statusPlaceType, statusDescription_cn, ...status }) => status) : [],
      billCargoTracking: details.billCargoTracking
    }
  }
  var compareValue = function (oldValue, newValue) {
    console.log(oldValue, newValue, oldValue !== newValue)
    return oldValue !== newValue
  }
  var compareObject = function (oldObject, newObject, diff, moment) {
    const d = diff(oldObject, newObject)
    if (d) {
      return d.reduce(
        (difference, diffValue) => {
          console.log(`[LAZADA] checking ... (${diffValue.lhs}, ${diffValue.rhs})`)
          if (diffValue.lhs && diffValue.rhs) {
            if (moment.isDate(diffValue.lhs) || moment.isDate(diffValue.rhs)) {
              difference = difference || moment(diffValue.lhs).isSame(moment(diffValue.rhs))
            } else {
              difference = difference || compareValue(diffValue.lhs, diffValue.rhs)
            }
          }
          return difference
        },
        false
      )
    }
    return false
  }
  this.handle = function (appId, params, helper) {
    console.log('[LAZADA] Start sending data to lazada')
    var url = getUrl(helper);
    var entity = params.data.modelName;
    var oldTracking = params.data.oldData;
    var newTracking = params.data.data;
    if (oldTracking && newTracking && oldTracking.lastStatusDetails && newTracking.lastStatusDetails) {
      var oldTransform = transform(oldTracking.lastStatusDetails);
      var newTransform = transform(newTracking.lastStatusDetails);
      if (compareObject(oldTransform, newTransform, helper.diff, helper.moment)) {
        console.log('[LAZADA] DATA Changed')
        try {
          helper.restClient.post(url, { data: newTransform, headers: { "Content-Type": "application/json" } }, (postData) => {
            if (Buffer.isBuffer(postData)) {
              postData = postData.toString('utf8');
            }
            console.log(`[LAZADA] return ${JSON.stringify(postData)}`)
            if (postData && postData.response && postData.response.success) {
              helper.saveLog(appId, url, entity, newTracking.id, JSON.stringify(newTransform), JSON.stringify(postData), null);
            } else {
              helper.saveLog(appId, url, entity, newTracking.id, JSON.stringify(newTransform), null, JSON.stringify(postData));
              helper.emailer.sendFreeMail({
                to: ["ken.chan+lazada@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
                from: "administrator@swivelsoftware.com",
                subject: `Lazada return not success (MAWB: ${newTracking.masterNo})`,
                html: `<p>Data Return: ${JSON.stringify(postData)}</p>`
              }, {});
            }
          })
        } catch (e) {
          console.log(JSON.stringify(e))
          helper.saveLog(appId, url, entity, newTracking.id, JSON.stringify(newTransform), null, JSON.stringify(e));
          helper.emailer.sendFreeMail({
            to: ["ken.chan+lazada@swivelsoftware.com"].join(','),   //TODO REMOVE HARD-CODED
            from: "administrator@swivelsoftware.com",
            subject: `Lazada error (MAWB: ${newTracking.masterNo})`,
            html: `<p>Data Error: ${JSON.stringify(e)}</p>`
          }, {});
        }
      }
    }
  }
}

module.exports = new lazadaNotificationHandler();
