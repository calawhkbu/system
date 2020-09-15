const app = {
  constants: {
    // DEMO KEY
    url: 'http://localhost:8081',
    // url: 'http://192.168.3.133:8081',
    // url: 'https://360demo-api.swivelsoftware.asia',
    authorizationToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInVzZXJuYW1lIjoiZGVidWdAZGVidWcuY29tIiwiaWF0IjoxNTY5Mzc3NjA4LCJleHAiOjE1NjkzNzc5MDh9.0R-G76TNIXi_4tkmvogMBhfO9DF5FRp3iHJsxaPX4m0',
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInVzZXJuYW1lIjoiZGVidWdAZGVidWcuY29tIiwiaWF0IjoxNTY5Mzc3NjA4fQ.234fxezQv-254GS1auNlRMiCPiTA7OspAPycUAZjgV0',

  },
  method: 'GET', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any, constants: { [key: string]: any }) => {
    const [jobNo, houseNo, division] = body['primaryKey'].split(constants.primaryKeySeperator)
    return `${constants.url}/chat/get-bill-messages/${encodeURIComponent(houseNo)}?orderBy=[[%22createdAt%22,%22asc%22]]`
  },
  requestHandler: (headers: any, body: any, constants: { [key: string]: any }) => ({
    headers: {
      'x-no-redis': true,
      'authorization': `Bearer ${constants.authorizationToken}`,
      'x-refresh-token': `${constants.refreshToken}`,
    },
  }),
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    const { data = [] } = JSON.parse(response.responseBody)
    return {
      responseBody: data.map(alert => {
        let newAlertType = alert.alertType
        switch (alert.alertType) {
          case 'Shipment ETA Changed':
            newAlertType = 'shipmentEtaChanged'
            break
          case 'Shipment ETD Changed':
            newAlertType = 'shipmentEtdChanged'
            break
          case 'Missing MBL':
            newAlertType = 'MblMissing'
            break
          case 'VGM Missing':
            newAlertType = 'VgmMissing'
            break
          case 'Prepaid Invoice Missing':
            newAlertType = 'prepaidInvoiceMissing'
            break
        }
        return {
          tableName: 'bill',
          primaryKey: '',
          alertCategory: alert.alertCategory,
          alertType: newAlertType,
          severity: alert.severity,
          status: 'closed',
          flexData: {
            customMessage: alert.message,
          },
        }
      }),
      responseOptions: response.responseOptions,
    }
  },
}
export default app
