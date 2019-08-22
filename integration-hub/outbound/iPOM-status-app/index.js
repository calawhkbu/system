function iPOMStatusHandler() {
  this.handle = function(appId, params, helper) {
    console.log(`[iPOM-status-app] Start`)
    const status = params.data
    if (status) {
      console.log(`[iPOM-status-app] have status`)
      return helper.persistence.models.booking.findOne({ where: { id: status.bookingId } }).then(booking => {
        if (booking) {
          console.log(`[iPOM-status-app] have booking`)
          return helper.persistence.models.customer.findOne({ where: { id: booking.customerId } }).then(customer => {
            if (customer && customer.configuration && customer.configuration.webService.purchaseOrder && customer.configuration.webService.purchaseOrder.statusApi) {
              console.log(`[iPOM-status-app] have customer`)
              const api = customer.configuration.webService.purchaseOrder.statusApi
              let payload = {
                data: {
                  bokjson: JSON.stringify({
                    bookingNumber: booking.bookingNo,
                    nextStatus: status.nextStatus,
                    remark: status.remark,
                  }),
                },
                headers: { 'Content-Type': 'application/json' },
              }
              try {
                helper.restClient.post(api, payload, (data, res) => {
                  if (Buffer.isBuffer(data)) data = data.toString('utf8').trim()
                  if (data) {
                    console.log('[iPOM-status-app] Send status to iPOM (success)')
                    helper.saveLog(appId, api, 'booking', booking.id, JSON.stringify(payload), JSON.stringify(data), null)
                  }
                })
              } catch (e) {
                console.error('[iPOM-status-app]', e.message, e.stack)
                helper.emailer.sendFreeMail(
                  {
                    to: ['ken.chan+ipom@swivelsoftware.com'].join(','), //TODO REMOVE HARD-CODED
                    from: 'administrator@swivelsoftware.com',
                    subject: `TEST - Fail to post status to iPOM [ERROR]`,
                    html: `<p>Payload:</p><br/><p>${JSON.stringify(payload)}</p><p>Error:</p><br/><p>${JSON.stringify(e.message)}</p><p>${e.stack}</p>`,
                  },
                  {}
                )
                helper.saveLog(appId, api, 'booking', booking.id, JSON.stringify(payload), null, JSON.stringify(e))
              }
            } else {
              console.error('[IPOM- status-app] no customer')
            }
          })
        }
        console.error('[IPOM- status-app] no booking')
      })
    }
    console.error('[IPOM- status-app] no status')
  }
}
module.exports = new iPOMStatusHandler()
