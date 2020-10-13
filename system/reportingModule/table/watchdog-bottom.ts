import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment'],
      onResult(res): any[] {
        return res.map(row => {
          return {
            id: row.shipmentId,
            moduleTypeCode: row.moduleTypeCode,
            houseNo: row.houseNo,
          }
        })
      }
    }
  ]
} as JqlDefinition

