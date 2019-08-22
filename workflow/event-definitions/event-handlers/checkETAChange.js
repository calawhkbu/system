function CheckETA() {
  this.returns = ['DATESET', 'DELAY']
  this.handle = function(definition, data, handlerParameters, helper) {
    if (data.data.estimatedArrivalDate != null && helper.moment.isDate(data.data.estimatedArrivalDate)) {
      return data.oldData.estimatedArrivalDate === null
        ? // Compare ETA from FM3000 and ETA from YunDang this time
          new Promise(resolve => {
            helper.persistence.models.bill
              .findOne({
                where: {
                  customerId: data.data.customerId,
                  masterNo: data.data.masterNo,
                },
              })
              .then(bill => {
                var oldEstimatedArrivalDate = helper.moment(bill.estimatedArrivalDate)
                var newEstimatedArrivalDate = helper.moment(data.data.estimatedArrivalDate)
                if (!oldEstimatedArrivalDate.isSame(newEstimatedArrivalDate)) {
                  return resolve('DELAY')
                }
                return resolve('DATESET')
              })
              .catch(e => console.error(e) && resolve('ERROR'))
          })
        : // Compare ETA from YunDang this time and ETA from YunDang last time
          new Promise(resolve => {
            var oldEstimatedArrivalDate = helper.moment(data.oldData.estimatedArrivalDate)
            var newEstimatedArrivalDate = helper.moment(data.data.estimatedArrivalDate)
            if (!oldEstimatedArrivalDate.isSame(newEstimatedArrivalDate)) {
              return resolve('DELAY')
            }
            return resolve('DATESET')
          })
    }
    return 'DATESET'
  }
}

module.exports = new CheckETA()
