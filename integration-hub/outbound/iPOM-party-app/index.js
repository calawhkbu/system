function iPOMPartyHandler() {
  this.handle = function(appId, params, helper) {
    const party = params.data
    helper.persistence.models.customer.findOne({ where: { id: party.customerId } }).then(customer => {
      if (customer && customer.configuration && customer.configuration.webService.purchaseOrder && customer.configuration.webService.purchaseOrder.partyApi) {
        let api = customer.configuration.webService.purchaseOrder.partyApi
        let payload = {
          data: {
            party,
            customerType: party.partyRoles[0].roleTypeCode === 'CUS' ? 'CUSTOMER' : 'VENDOR',
          },
          headers: { 'Content-Type': 'application/json' },
        }
        try {
          helper.restClient.post(api, payload, (data, res) => {
            if (Buffer.isBuffer(data)) data = data.toString('utf8').trim()
            if (data) {
              if (res.statusCode === 200) {
                console.log('[SUCCESS] Send party to iPOM')
                helper.saveLog(appId, api, 'party', party.id, JSON.stringify(payload), data, null)
              } else {
                helper.emailer.sendFreeMail(
                  {
                    to: ['ken.chan@swivelsoftware.com'].join(','), //TODO REMOVE HARD-CODED
                    from: 'administrator@swivelsoftware.com',
                    subject: `TEST - Fail to post party to iPOM [DATA SENT OUT]`,
                    html: `<p>Party:</p><br/><p>${JSON.stringify(payload)}</p><p>Data Returned:</p><br/><p>${postData}</p>`,
                  },
                  { party }
                )
                helper.saveLog(appId, api, 'party', party.id, JSON.stringify(payload), null, data)
              }
            }
          })
        } catch (e) {
          console.error(e.message, e.stack)
          helper.emailer.sendFreeMail(
            {
              to: ['ken.chan@swivelsoftware.com'].join(','), //TODO REMOVE HARD-CODED
              from: 'administrator@swivelsoftware.com',
              subject: `TEST - Fail to post party to iPOM [ERROR]`,
              html: `<p>Party:</p><br/><p>${JSON.stringify(payload)}</p><p>Error:</p><br/><p>${JSON.stringify(e.message)}</p><p>${e.stack}</p>`,
            },
            { party }
          )
          helper.saveLog(appId, api, 'party', party.id, JSON.stringify(payload), null, JSON.stringify(e))
        }
      }
    })
  }
}

module.exports = new iPOMPartyHandler()
