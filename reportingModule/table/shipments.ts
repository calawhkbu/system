import { Query, FromTable, ResultColumn, ColumnExpression } from 'node-jql'

const query = new Query({
  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment',
      columns: [

        { name: 'houseNo', type: 'string' },
        { name: 'jobNo', type: 'string' },
        { name: 'masterNo', type: 'string' },

        { name: 'bookingNo', type: 'string' },
        { name: 'poNos', type: 'string' },
        { name : 'containerNos', type : 'string' },
        { name: 'contractNos', type: 'string' },

        { name: 'commodity', type: 'string' },
        { name: 'vessel', type: 'string' },
        { name: 'voyageFlightNumber', type: 'string' },
        { name: 'divisionCode', type: 'string' },
        { name: 'serviceCode', type: 'string' },
        { name: 'incoTermsCode', type: 'string' },
        { name: 'freightTermsCode', type: 'string' },
        { name: 'otherTermsCode', type: 'string' },
        { name: 'moduleTypeCode', type: 'string' },
        { name: 'boundTypeCode', type: 'string' },
        { name: 'carrierName', type: 'string' },
        { name: 'nominatedTypeCode', type: 'string' },
        { name: 'isDirect', type: 'boolean' },
        { name: 'isCoload', type: 'boolean' },

        { name: 'jobDate', type: 'Date' },
        { name: 'departureDateEstimated', type: 'Date' },
        { name: 'departureDateActual', type: 'Date' },
        { name: 'arrivalDateEstimated', type: 'Date' },
        { name: 'arrivalDateActual', type: 'Date' },

        { name: 'placeOfReceiptName', type: 'string' },
        { name: 'portOfLoadingName', type: 'string' },
        { name: 'portOfDischargeName', type: 'string' },
        { name: 'placeOfDeliveryName', type: 'string' },
        { name: 'finalDestinationName', type: 'string' },

        { name: 'officePartyName', type: 'string' },
        { name: 'shipperPartyName', type: 'string' },
        { name: 'consigneePartyName', type: 'string' },
        { name: 'linerAgentPartyName', type: 'string' },
        { name: 'roAgentPartyName', type: 'string' },
        { name: 'agentPartyName', type: 'string' },
        { name: 'controllingCustomerPartyName', type: 'string' },

        { name: 'id', type: 'string' },
        { name: 'shipId', type: 'string' },
        { name: 'haveCurrentTrackingNo', type: 'string' },
        { name: 'batchNumber', type: 'string' },
        { name: 'lastStatusCodeOrDescription', type: 'string' },
        { name: 'lastStatusDate', type: 'string' },
        { name: 'lastStatusWidget', type: 'string' },
      ],
    },
    'shipment'
  ),
})

export default query.toJson()
