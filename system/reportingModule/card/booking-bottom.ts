import { JqlDefinition } from 'modules/report/interface'

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['booking', 'booking'],
      onResult(res): any[] {
        return res.map(row => {
          return {
            id: row.bookingId,
            moduleTypeCode: row.moduleTypeCode,
            bookingNo: row.bookingNo,
            shipperPartyName: row.shipperPartyName,
            consigneePartyName: row.consigneePartyName,
            portOfLoadingCode: row.portOfLoadingCode,
            portOfDischargeCode: row.portOfDischargeCode,
            departureDateEstimated: row.departureDateEstimated,
            arrivalDateEstimated: row.arrivalDateEstimated,
          }
        })
      }
    }
  ]
} as JqlDefinition
