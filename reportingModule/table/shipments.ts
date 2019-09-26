import { Query, FromTable, ResultColumn, ColumnExpression } from 'node-jql'

const query = new Query({

  // $select: [

  //   new ResultColumn(new ColumnExpression('houseNo'), 'houseNo'),
  //   new ResultColumn(new ColumnExpression('jobDate'), 'jobDate'),
  //   new ResultColumn(new ColumnExpression('masterNo'), 'masterNo'),

  //   new ResultColumn(new ColumnExpression('moduleTypeCode'), 'moduleType'),

  //   new ResultColumn(new ColumnExpression('bookingNo'), 'bookingNo'),
  //   new ResultColumn(new ColumnExpression('poNo'), 'poNo'),
  //   new ResultColumn(new ColumnExpression('contractNo'), 'contractNo'),
  //   new ResultColumn(new ColumnExpression('commodity'), 'commodity'),

  //   new ResultColumn(new ColumnExpression('voyage'), 'voyage'),
  //   new ResultColumn(new ColumnExpression('division'), 'division'),

  //   new ResultColumn(new ColumnExpression('isDirect'), 'isDirect'),
  //   new ResultColumn(new ColumnExpression('isCoload'), 'isCoload'),

  //   new ResultColumn(new ColumnExpression('carrierCode'), 'aaaaaaaa'),

  //   new ResultColumn(new ColumnExpression('serviceCode'), 'service'),
  //   new ResultColumn(new ColumnExpression('incoTermsCode'), 'incoTerms'),

  //   new ResultColumn(new ColumnExpression('freightTermsCode'), 'freightTerms'),

  //   new ResultColumn(new ColumnExpression('boundTypeCode'), 'boundType'),
  //   new ResultColumn(new ColumnExpression('nominatedTypeCode'), 'nominatedType'),

  //   new ResultColumn(new ColumnExpression('portOfLoadingCode'), 'portOfLoading'),
  //   new ResultColumn(new ColumnExpression('portOfDischargeCode'), 'portOfDischarge'),
  //   new ResultColumn(new ColumnExpression('placeOfReceiptCode'), 'placeOfReceipt'),
  //   new ResultColumn(new ColumnExpression('placeOfDeliveryCode'), 'placeOfDelivery'),
  //   new ResultColumn(new ColumnExpression('finalDestinationCode'), 'finalDestination'),

  //   new ResultColumn(new ColumnExpression('shipperPartyName'), 'shipper'),
  //   new ResultColumn(new ColumnExpression('consigneePartyName'), 'consignee'),
  //   new ResultColumn(new ColumnExpression('forwarderPartyName'), 'forwarder'),
  //   new ResultColumn(new ColumnExpression('linerAgentPartyName'), 'linerAgent'),
  //   new ResultColumn(new ColumnExpression('roAgentPartyName'), 'roAgent'),
  //   new ResultColumn(new ColumnExpression('agentPartyName'), 'agent'),
  //   new ResultColumn(new ColumnExpression('controllingCustomerPartyName'), 'controllingCustomer'),

  //   new ResultColumn(new ColumnExpression('salesmanCode'), 'salesmanCode'),

  // ],

  $from: new FromTable(
    {
      method: 'POST',
      url: 'api/shipment/query/shipment',
      columns: [
        { name: 'houseNo', type: 'string' },
        { name: 'jobDate', type: 'Date' },
        { name: 'masterNo', type: 'string' },
        { name: 'bookingNo', type: 'string' },
        { name: 'poNo', type: 'string' },
        { name: 'contractNo', type: 'string' },
        { name: 'commodity', type: 'string' },
        { name: 'carrierCode', type: 'string'},

        { name: 'voyage', type: 'string'},
        { name: 'division', type: 'string' },

        // ["FCL", "LCL", "CONSOL"]
        { name: 'serviceCode', type: 'string' },
        { name: 'incoTermsCode', type: 'string' },
        { name: 'freightTermsCode', type: 'string' },
        { name: 'otherTermsCode', type: 'string' },

        // ["SEA", "AIR", "ROAD"]
        { name: 'moduleTypeCode', type: 'string' },
        { name: 'boundTypeCode', type: 'string' },

        { name: 'nominatedTypeCode', type: 'string' },

        { name: 'isDirect', type: 'boolean' },
        { name: 'isCoload', type: 'boolean'},

        { name: 'portOfLoadingCode', type: 'string' },
        { name: 'portOfDischargeCode', type: 'string' },

        { name : 'placeOfReceiptCode', type : 'string'},
        { name : 'placeOfDeliveryCode', type : 'string'},
        { name : 'finalDestinationCode', type : 'string'},

        { name: 'departureDateEstimated', type: 'string'},
        { name: 'arrivalDateEstimated', type: 'string' },
        { name: 'departureDateActual', type: 'string' },
        { name: 'arrivalDateActual', type: 'string' },

        { name: 'shipperPartyName', type: 'string' },
        { name: 'consigneePartyName', type: 'string' },
        { name: 'forwarderPartyName', type: 'string' },
        { name: 'linerAgentPartyName', type: 'string' },
        { name: 'roAgentPartyName', type: 'string' },
        { name: 'agentPartyName', type: 'string' },
        { name: 'controllingCustomerPartyName', type: 'string'},

        { name: 'salesmanCode', type: 'string' },

      ],

      // data : {
      //   fields : [
      //     'houseNo',
      //     'jobDate',
      //     'masterNo',
      //     'carrierCode',
      //     'forwarderPartyName',
      //     'portOfLoadingCode',
      //     'portOfDischargeCode',
      //     'placeOfReceiptCode',
      //     'placeOfDeliveryCode',
      //     'finalDestination'
      //   ]
      // }

    },
    'shipment'
  ),
})

export default query.toJson()
