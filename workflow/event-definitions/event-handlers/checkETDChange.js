function CheckETD() {
  this.returns = ['DATESET', 'DELAY', 'CHANGED']
  this.handle = function(definition, data, handlerParameters, helper) {
    if (data.data.estimatedDepartureDate != null && helper.moment.isDate(data.data.estimatedDepartureDate)) {
      return data.oldData.estimatedDepartureDate === null
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
                var oldEstimatedDepartureDate = helper.moment(bill.estimatedDepartureDate)
                var newEstimatedDepartureDate = helper.moment(data.data.estimatedDepartureDate)
                if (!oldEstimatedDepartureDate.isSame(newEstimatedDepartureDate)) {
                  return resolve('DELAY')
                }
                return resolve('DATESET')
              })
              .catch(e => console.error(e) && resolve('ERROR'))
          })
        : // Compare ETA from YunDang this time and ETA from YunDang last time
          new Promise(resolve => {
            var oldEstimatedDepartureDate = helper.moment(data.oldData.estimatedDepartureDate)
            var newEstimatedDepartureDate = helper.moment(data.data.estimatedDepartureDate)
            if (!oldEstimatedDepartureDate.isSame(newEstimatedDepartureDate)) {
              return resolve('DELAY')
            }
            return resolve('DATESET')
          })
    }
    return 'DATESET'
  }
}

module.exports = new CheckETD()
