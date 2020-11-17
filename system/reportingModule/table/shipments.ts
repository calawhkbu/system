import { JqlDefinition } from 'modules/report/interface'


const documentFileNameList = [
  'Freight Invoice',
  'MBL',
  'HBL Original',
  'HBL Telex released',
  'Commercial Invoice',
  'Packing List',
  'OTHER'
]

export default {
  jqls: [
    {
      type: 'callDataService',
      dataServiceQuery: ['shipment', 'shipment']
    }
  ],
  columns: [
    { key: 'houseNo' },
    { key: 'jobNo' },
    { key: 'masterNo' },
    { key: 'bookingNo' },
    { key: 'poNos' },
    { key: 'containerNos' },
    { key: 'contractNos' },
    { key: 'commodity' },
    { key: 'vessel' },
    { key: 'voyageFlightNumber' },
    { key: 'divisionCode' },
    { key: 'serviceCode' },
    { key: 'incoTermsCode' },
    { key: 'freightTermsCode' },
    { key: 'otherTermsCode' },
    { key: 'moduleTypeCode' },
    { key: 'boundTypeCode' },
    { key: 'carrierName' },
    { key: 'nominatedTypeCode' },
    { key: 'isDirect' },
    { key: 'isCoload' },
    { key: 'jobDate' },
    { key: 'departureDateEstimated' },
    { key: 'departureDateActual' },
    { key: 'arrivalDateEstimated' },
    { key: 'arrivalDateActual' },
    { key: 'placeOfReceiptName' },
    { key: 'portOfLoadingName' },
    { key: 'portOfDischargeName' },
    { key: 'placeOfDeliveryName' },
    { key: 'finalDestinationName' },
    { key: 'officePartyName' },
    { key: 'shipperPartyName' },
    { key: 'consigneePartyName' },
    { key: 'linerAgentPartyName' },
    { key: 'roAgentPartyName' },
    { key: 'agentPartyName' },
    { key: 'controllingCustomerPartyName' },
    { key: 'id' },
    { key: 'shipId' },
    { key: 'picId' },
    { key: 'picEmail' },
    { key: 'team' },
    { key: 'haveCurrentTrackingNo' },
    { key: 'batchNumber' },
    { key: 'lastStatusCodeOrDescription' },
    { key: 'lastStatusDate' },
    { key: 'lastStatusWidget' },

    ...documentFileNameList.map(documentFileName => {

      return { key: `haveDocument_${documentFileName}` }

    })


  ]
} as JqlDefinition
