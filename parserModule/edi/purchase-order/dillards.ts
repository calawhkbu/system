import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'
import { createRequireFromPath } from 'module'

const moment = require('moment')
const _ = require('lodash')

const partyGroupCode = ''

export const formatJson = {
  check: {
    segmentCode: 'ST',
    elementIndex: 2,
    transactionSetCode: 'SE',
    transactionSetNoIndex: 1,
  },
  removeCharacter: ['=', 'o', ''],
  segmentSeperator: ['\r\n', '\r', '\n', '�'],
  elementSeperator: ['', '*'],
  mainBodyHead: 'ST',

  // segmentSeperator : ['?'],
  // elementSeperator : '',

  // [{
  //   ediType:'850'
  // }]
  ediFormatList: [
    {
      ediType: '850',
      rootSegmentFormat: {
        type: 'object',
        segmentFormatList: [
          {
            key: 'ISA',
            code: 'ISA',
            name: 'interchange Control Header',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Authorization Info Qualifier',
                key: 'authorizationInfoQualifier',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '00',
                      name: '00',
                      overrideValue: '00',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 2,
                maximumLen: 10,
                minimumLen: 10,
                name: 'Authorization Information',
                key: 'authorizationInformation',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '          ',
                      name: '          ',
                      overrideValue: '          ',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 3,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Security Info Qualifier ',
                key: 'securityInfoQualifier ',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '00',
                      name: '00',
                      overrideValue: '00',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 4,
                maximumLen: 10,
                minimumLen: 10,
                name: 'Security Information',
                key: 'securityInformation',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '          ',
                      name: '          ',
                      overrideValue: '          ',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 5,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Interchange Sender ID QL',
                key: 'interchangeSenderIdQl',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '08',
                      name: '08',
                      overrideValue: '08',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 6,
                maximumLen: 15,
                minimumLen: 15,
                name: 'Interchange Sender ID',
                key: 'interchangeSenderId',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '6112390050',
                      name: 'GXS',
                      overrideValue: 'GXS',
                    },
                    {
                      value: '6112391050',
                      name: 'Inovis',
                      overrideValue: 'Inovis',
                    },
                    {
                      value: '6112392050',
                      name: 'InterTrade',
                      overrideValue: 'InterTrade',
                    },
                  ],
                  allowAny: true,
                },
              },
              {
                index: 7,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Interchange Receiver QL',
                key: 'interchangeReceiverQl',
                type: 'string',
              },
              {
                index: 8,
                maximumLen: 15,
                minimumLen: 15,
                name: 'Interchange Receiver ID',
                key: 'interchangeReceiverId',
                type: 'string',
              },
              {
                index: 9,
                maximumLen: 6,
                minimumLen: 6,
                name: 'Created Date',
                key: 'createdDate',
                type: 'date',
                format: 'yyMMdd',
              },
              {
                index: 10,
                maximumLen: 4,
                minimumLen: 4,
                name: 'Created Time',
                key: 'createdTime',
                type: 'time',
              },
              {
                index: 11,
                maximumLen: 1,
                minimumLen: 1,
                name: 'Interchange Standards ID',
                key: 'interchangeStandardsId',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'U',
                      name: 'U',
                      overrideValue: 'U',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 12,
                maximumLen: 5,
                minimumLen: 5,
                name: 'Interchange Version ID',
                key: 'interchangeVersionId',
                type: 'string',
              },
              {
                index: 13,
                maximumLen: 9,
                minimumLen: 9,
                name: 'Interchange Control Number',
                key: 'interchangeControlNumber',
                type: 'string',
              },
              {
                index: 14,
                maximumLen: 1,
                minimumLen: 1,
                name: 'Acknowledgement Requested',
                key: 'acknowledgementRequested ',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '0',
                      name: '0',
                      overrideValue: '0',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 15,
                maximumLen: 1,
                minimumLen: 1,
                name: 'Test Indicator',
                key: 'testIndicator',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'T',
                      name: 'Test',
                      overrideValue: 'Test',
                    },
                    {
                      value: 'P',
                      name: 'Prod',
                      overrideValue: 'Prod',
                    },
                  ],
                  allowAny: true,
                },
              },
              {
                index: 16,
                maximumLen: 1,
                minimumLen: 1,
                name: 'Sub Element Separator',
                key: 'subElementSeparator',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '>',
                      name: '>',
                      overrideValue: '>',
                    },
                  ],
                  allowAny: false,
                },
              },
            ],
          },
          {
            key: 'GS',
            code: 'GS',
            name: 'Funtional Group Header',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Functional ID',
                key: 'functionalId',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'PO',
                      name: 'PO',
                      overrideValue: 'PO',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 2,
                maximumLen: 10,
                minimumLen: 10,
                name: 'Application Sender ID',
                key: 'applicationSenderId',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '6112390050',
                      name: 'GXS',
                      overrideValue: 'GXS',
                    },
                    {
                      value: '6112391050',
                      name: 'Inovis',
                      overrideValue: 'Inovis',
                    },
                    {
                      value: '6112392050',
                      name: 'InterTrade',
                      overrideValue: 'InterTrade',
                    },
                  ],
                  allowAny: true,
                },
                type: 'string',
              },
              {
                index: 3,
                maximumLen: 12,
                minimumLen: 2,
                name: 'Application Receiver ID',
                key: 'applicationReceiverId',
                type: 'string',
              },
              {
                index: 4,
                maximumLen: 8,
                minimumLen: 8,
                name: 'Data Interchange Date',
                key: 'dataInterchangeDate',
                type: 'date',
                Format: 'yyyyMMdd',
              },
              {
                index: 5,
                maximumLen: 4,
                minimumLen: 4,
                name: 'Data Interchange Time',
                key: 'dataInterchangeTime',
                type: 'time',
              },
              {
                index: 6,
                maximumLen: 9,
                minimumLen: 1,
                name: 'Data Interchange Control Number',
                key: 'dataInterchangeControlNumber',
                type: 'string',
              },
              {
                index: 7,
                maximumLen: 2,
                minimumLen: 1,
                name: 'Responsible Agency Code',
                key: 'responsibleAgencyCode',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'X',
                      name: 'X',
                      overrideValue: 'X',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 8,
                maximumLen: 12,
                minimumLen: 1,
                name: 'Version ID',
                key: 'versionId',
                type: 'string',
              },
            ],
          },
          {
            key: 'ST',
            code: 'ST',
            name: 'Transaction Set Header',
            type: 'list',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 3,
                minimumLen: 3,
                name: 'Transaction Set Identifier Code',
                key: 'transactionSetIdentifierCode',
                type: 'string',
              },

              {
                index: 2,
                maximumLen: 9,
                minimumLen: 4,
                name: 'Transaction Set Control Number',
                key: 'transactionSetControlNumber',
                type: 'integer',
              },
            ],
            segmentFormatList: [
              {
                key: 'BEG',
                code: 'BEG',
                name: 'Beginning Segement',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Transaction Set Purpose',
                    key: 'transactionSetPurpose',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: '00',
                          name: 'Original',
                          overrideValue: 'Original',
                        },
                        {
                          value: '07',
                          name: 'Duplicate',
                          overrideValue: 'Duplicate',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },

                  {
                    index: 2,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Purchase Order Type',
                    key: 'purchaseOrderType',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'SA',
                          name: 'Stand-alone',
                          overrideValue: 'Stand-alone',
                        },
                        {
                          value: 'DS',
                          name: 'Drop Ship',
                          overrideValue: 'Drop Ship',
                        },
                        {
                          value: 'DR',
                          name: 'Direct Ship',
                          overrideValue: 'Direct Ship',
                        },
                        {
                          value: 'PE',
                          name: 'Port of Entry',
                          overrideValue: 'Port of Entry',
                        },
                        {
                          value: 'RE',
                          name: 'Replenishment',
                          overrideValue: 'Replenishment',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },

                  {
                    index: 3,
                    maximumLen: 10,
                    minimumLen: 10,
                    name: 'Purchase Order Number',
                    key: 'purchaseOrderNumber',
                    type: 'string',
                  },
                  {
                    index: 5,
                    maximumLen: 8,
                    minimumLen: 8,
                    name: 'Purchase Order Date',
                    key: 'purchaseOrderDate',
                    type: 'date',
                    format: 'yyyyMMdd',
                  },
                ],
              },
              {
                key: 'CUR',
                code: 'CUR',
                name: 'Currency',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    name: 'Entity Identifier Code',
                    key: 'entityIdentifierCode',
                    type: 'string',
                  },
                  {
                    index: 2,
                    name: 'Currency Code',
                    key: 'currencyCode',
                    type: 'string',
                  },
                ],
              },
              {
                key: 'REF',
                code: 'REF',
                name: 'Reference Number',
                type: 'repeatObject',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Reference Number Qualifier',
                    key: 'referenceNumberQualifier',
                    overrideValueIndex: 2,
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'DP',
                          name: 'Dept Number',
                          overrideKey: 'DeptNumber',
                        },
                        {
                          value: 'IA',
                          name: 'Vendor',
                          overrideKey: 'Vendor',
                        },
                        {
                          value: '19',
                          name: 'Division ID',
                          overrideKey: 'DivisionID',
                        },
                        {
                          value: 'CO',
                          name: 'Customer Order',
                          overrideKey: 'Customer Order',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Reference Number',
                    key: 'referenceNumber',
                    type: 'string',
                  },
                ],
              },
              {
                code: 'PER',
                key: 'PER',
                name: 'Admin Contact',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Contact function code',
                    key: 'contactFunctionCode',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'DM',
                          name: 'DM',
                          overrideValue: 'DM',
                        },
                      ],
                      allowAny: false,
                    },
                  },

                  {
                    index: 2,
                    maximumLen: 60,
                    minimumLen: 1,
                    name: 'Name',
                    key: 'name',
                    mandatory: false,
                    type: 'string',
                  },
                ],
              },
              {
                code: 'FOB',
                key: 'FOB',
                name: 'F.O.B. Instructions',
                type: 'list',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Shipment Method of Payment',
                    key: 'shipmentMethodOfPayment',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'CA',
                          name: 'Advance Collect',
                          overrideValue: 'Advance Collect',
                        },
                        {
                          value: 'PA',
                          name: 'Advance Prepay',
                          overrideValue: 'Advance Prepay',
                        },
                        {
                          value: 'CC',
                          name: 'Collect',
                          overrideValue: 'Collect',
                        },
                        {
                          value: 'PP',
                          name: 'Prepaid',
                          overrideValue: 'Prepaid',
                        },
                        {
                          value: 'MX',
                          name: 'Mixed',
                          overrideValue: 'Mixed',
                        },
                        {
                          value: 'BP',
                          name: 'Paid by Buyer',
                          overrideValue: 'Paid by Buyer',
                        },
                        {
                          value: 'AC',
                          name: 'Air Collect',
                          overrideValue: 'Air Collect',
                        },
                        {
                          value: 'AP',
                          name: 'Air Prepaid',
                          overrideValue: 'Air Prepaid',
                        },
                      ],

                      allowAny: true,
                    },
                    type: 'string',
                  },

                  {
                    index: 2,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Location Qualifier1',
                    key: 'locationQualifier1',
                    mandatory: false,

                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'DE',
                          name: 'Destination (Shipping)',
                          overrideValue: 'Destination (Shipping)',
                        },
                        {
                          value: 'OR',
                          name: 'Origin (Shipping Point)',
                          overrideValue: 'Origin (Shipping Point)',
                        },
                        {
                          value: 'OV',
                          name: 'On vessel',
                          overrideValue: 'On vessel',
                        },
                        {
                          value: 'OF',
                          name: 'Other FOB Point',
                          overrideValue: 'Other FOB Point',
                        },
                      ],
                      allowAny: true,
                    },

                    type: 'string',
                  },
                  {
                    index: 3,
                    maximumLen: 5,
                    minimumLen: 2,
                    name: 'description1',
                    key: 'description1',
                    type: 'string',
                  },
                  {
                    index: 6,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Location Qualifier2',
                    key: 'locationQualifier2',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'CA',
                          name: 'Country of Origin',
                          overrideValue: 'Country of Origin',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 7,
                    maximumLen: 20,
                    minimumLen: 1,
                    name: 'Description2',
                    key: 'description2',
                    type: 'string',
                  },
                ],
              },
              {
                key: 'SAC',
                code: 'SAC',
                name: 'Service, Promotion, Allowance or Charge',
                type: 'list',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 1,
                    minimumLen: 1,
                    name: 'Allowance or Charge Ind.',
                    key: 'allowanceOrChargeInd.',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'N',
                          name: 'No Allowance/Chrg',
                          overrideValue: 'No Allowance/Chrg',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 3,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Agency Qualifier Code',
                    key: 'agencyQualifiercode',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'VI',
                          name: 'VI',
                          overrideValue: 'VI',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 4,
                    maximumLen: 4,
                    minimumLen: 4,
                    name: 'Agency Services,Promotion Allowance/Charge Code',
                    key: 'agencyServices,PromotionAllowance/ChargeCode',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'OHRO',
                          name: 'Rush Order',
                          overrideValue: 'Rush Order',
                        },
                        {
                          value: 'OHPR',
                          name: 'Promo Order',
                          overrideValue: 'Promo Order',
                        },
                        {
                          value: 'OHSO',
                          name: 'Custom Express',
                          overrideValue: 'Custom Express',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                ],
              },
              {
                code: 'TD5',
                key: 'TD5',
                name: 'Carrier Details',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 4,
                    maximumLen: 2,
                    minimumLen: 1,
                    name: 'Transportation Method/Type',
                    key: 'transportationMethod/Type',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'A',
                          name: 'Air',
                          overrideValue: 'Air',
                        },
                        {
                          value: 'S',
                          name: 'Sea',
                          overrideValue: 'Sea',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 5,
                    maximumLen: 35,
                    minimumLen: 1,
                    name: 'Routing',
                    key: 'routing',
                    type: 'string',
                  },
                ],
              },
              {
                key: 'N9',
                code: 'N9',
                name: 'Reference Number',
                type: 'list',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Reference Number Qual',
                    key: 'referenceNumberQual',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'AH',
                          name: 'Agreement',
                          overrideValue: 'Agreement',
                        },
                        {
                          value: 'KD',
                          name: 'Special Services',
                          overrideValue: 'Special Services',
                        },
                        {
                          value: 'SH',
                          name: 'Gift Message',
                          overrideValue: 'Gift Message',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 30,
                    minimumLen: 30,
                    name: 'Reference Number',
                    key: 'referenceNumber',
                    type: 'string',
                  },
                ],
                segmentFormatList: [
                  {
                    code: 'MTX',
                    key: 'MTX',
                    type: 'list',
                    name: 'Message Text',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 2,
                        maximumLen: 78,
                        minimumLen: 1,
                        name: 'Message Text',
                        key: 'messageText',
                        type: 'string',
                      },
                    ],
                  },
                  {
                    code: 'MSG',
                    key: 'MSG',
                    type: 'list',
                    name: 'Message Text',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 78,
                        minimumLen: 1,
                        name: 'Message Text',
                        key: 'messageText',
                        type: 'string',
                      },
                    ],
                  },
                ],
              },

              {
                code: 'DTM',
                key: 'DTM',
                type: 'repeatObject',
                name: ' Data Element Separator (DES)',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 3,
                    minimumLen: 3,
                    name: 'Date/Time Qualifier',
                    key: 'date/TimeQualifier',
                    overrideValueIndex: 2,
                    allowableValues: {
                      valueOptions: [
                        {
                          value: '037',
                          name: 'Ship Not Before',
                          overrideKey: 'shipNotBefore',
                        },
                        {
                          value: '038',
                          name: 'Do Not Ship After',
                          overrideKey: 'doNotShipAfter',
                        },
                        {
                          value: '015',
                          name: 'Promo start',
                          overrideKey: 'promoStart',
                        },
                        {
                          value: '071',
                          name: 'First Arrive',
                          overrideKey: 'firstArrive',
                        },
                        {
                          value: '074',
                          name: 'Last Arrive',
                          overrideKey: 'lastArrive',
                        },
                        {
                          value: '063',
                          name: 'Do Not Deliver After',
                          overrideKey: 'doNotDeliverAfter',
                        },
                        {
                          value: '064',
                          name: 'Do Not Ship Before',
                          overrideKey: 'doNotShipBefore',
                        },
                        {
                          value: '010',
                          name: 'Requested Ship Date From Supplier Warehouse',
                          overrideKey: 'requestedShipDateFromSupplierWarehouse',
                        },
                      ],
                      allowAny: false,
                    },
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 8,
                    minimumLen: 8,
                    name: 'Date',
                    key: 'Date',
                    type: 'date',
                    format: 'yyyyMMdd',
                  },
                ],
              },
              {
                key: 'ITD',
                code: 'ITD',
                name: 'Term of Sales/Deferred Term of Sales',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Terms Type Code',
                    key: 'termsTypeCode',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: '08',
                          name: 'Basic Discount',
                          overrideValue: 'Basic Discount',
                        },
                        {
                          value: '05',
                          name: 'No Discount',
                          overrideValue: 'No Discount',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 2,
                    minimumLen: 1,
                    name: 'Terms Basis Date Code',
                    key: 'termsBasisDateCode',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: '2',
                          name: 'Delivery date',
                          overrideValue: 'Delivery date',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 3,
                    maximumLen: 6,
                    minimumLen: 1,
                    name: 'Terms Discount Percent',
                    key: 'termsDiscountPercent',
                    type: 'integer',
                  },
                  {
                    index: 5,
                    maximumLen: 3,
                    minimumLen: 1,
                    name: 'Terms Discount Days Due ',
                    key: 'termsDiscountDaysDue',
                    type: 'integer',
                  },
                  {
                    index: 7,
                    maximumLen: 3,
                    minimumLen: 1,
                    name: 'Terms Net Days',
                    key: 'termsNetDays',
                    type: 'integer',
                  },
                ],
              },
              {
                code: 'N1',
                key: 'N1',
                name: 'Name',
                mandatory: false,
                type: 'list',

                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Organization Identifier ',
                    key: 'organizationIdentifier',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'BY',
                          name: 'Buying party',
                          overrideValue: 'Buying party',
                        },
                        {
                          value: 'BT',
                          name: 'Bill to party',
                          overrideValue: 'Bill to party',
                        },
                        {
                          value: 'SE',
                          name: 'Selling party',
                          overrideValue: 'Selling Party',
                        },
                        {
                          value: 'RI',
                          name: 'Remit-to',
                          overrideValue: 'Remit-to',
                        },
                        {
                          value: 'ST',
                          name: 'Ship to',
                          overrideValue: 'Ship To',
                        },
                        {
                          value: 'VN',
                          name: 'vendor',
                          overrideValue: 'vendor',
                        },
                        {
                          value: 'MA',
                          name: 'Party to Ship To',
                          overrideValue: 'Party To Ship To',
                        },
                        {
                          value: 'AG',
                          name: 'Agent',
                          overrideValue: 'agent',
                        },
                        {
                          value: 'SU',
                          name: 'Factory (Supplier)',
                          overrideValue: 'factory(Supplier)',
                        },
                        {
                          value: 'MP',
                          name: 'Ship from',
                          overrideValue: 'Ship From',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 60,
                    minimumLen: 1,
                    name: 'name',
                    key: 'name',
                    type: 'string',
                  },
                  {
                    index: 3,
                    maximumLen: 2,
                    minimumLen: 1,
                    name: 'Identification Code Qualifier',
                    key: 'IdCodeQualifier',
                    mandatory: false,
                    allowableValues: {
                      valueOptions: [
                        {
                          value: '92',
                          name: 'Assigned by buyer',
                          overrideValue: 'Assigned By Buyer',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 4,
                    maximumLen: 7,
                    minimumLen: 4,
                    name: 'Identification Code',
                    key: 'identificationCode',
                    type: 'string',
                  },
                ],

                segmentFormatList: [
                  {
                    code: 'N2',
                    key: 'N2',
                    name: 'Additional Name Information ',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 55,
                        minimumLen: 1,
                        name: 'Additional Name Information1',
                        key: 'additionalNameInformation1',
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 55,
                        minimumLen: 1,
                        name: 'Additional Name Information2',
                        key: 'additionalNameInformation2',
                        type: 'string',
                      },
                    ],
                  },
                  {
                    code: 'N3',
                    key: 'N3',
                    name: 'Address Information',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 55,
                        minimumLen: 1,
                        name: 'Address Information',
                        key: 'addressInformation',
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 55,
                        minimumLen: 1,
                        name: 'Additional Address Information',
                        key: 'additionalAddressInformation',
                        type: 'string',
                      },
                    ],
                  },
                  {
                    code: 'N4',
                    key: 'N4',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 30,
                        minimumLen: 2,
                        name: 'City Name',
                        key: 'cityName',
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'State Or Province Code',
                        key: 'stateOrProvinceCode',
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 15,
                        minimumLen: 3,
                        name: 'Postal Code',
                        key: 'postalCode',
                        type: 'string',
                      },
                      {
                        index: 4,
                        maximumLen: 3,
                        minimumLen: 2,
                        name: 'Country Code',
                        key: 'countryCode',
                        type: 'string',
                      },
                    ],
                  },
                ],
              },
              {
                code: 'PO1',
                key: 'PO1',
                name: 'Purchase Order Baseline Item Data',
                type: 'list',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 6,
                    minimumLen: 6,
                    name: 'PO Line Number',
                    key: 'poLineNumber',
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 9,
                    minimumLen: 1,
                    name: 'Quantity Ordered',
                    key: 'quantityOrdered',
                    type: 'integer',
                  },
                  {
                    index: 3,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Unit Of Measure Code',
                    key: 'unitOfMeasureCode',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'EA',
                          name: 'Each(Unit)',
                          overrideValue: 'Each',
                        },
                        {
                          value: 'CA',
                          name: 'Case(Prepack)',
                          overrideValue: 'Prepack',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 4,
                    maximumLen: 14,
                    minimumLen: 1,
                    name: 'Unit Price',
                    key: 'unitPrice',
                    type: 'decimal',
                  },
                  {
                    index: 5,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Basis of Unit Price',
                    key: 'basisOfUnitPrice',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'LE',
                          name: 'Catalog Price Each',
                          overrideValue: 'Catalog Price Each',
                        },
                        {
                          value: 'NC',
                          name: 'No Charge',
                          overrideValue: 'No Charge',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 6,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product ID Qualifier1',
                    key: 'productIdQualifier1',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'UP',
                          name: 'UP',
                          overrideValue: 'UP',
                        },
                        {
                          value: 'EN',
                          name: 'EN',
                          overrideValue: 'EN',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 7,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product ID1',
                    key: 'productId1',
                    type: 'string',
                  },
                  {
                    index: 8,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product/Service ID Qualifier2',
                    key: 'productIdQualifier2',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'IZ',
                          name: 'IZ',
                          overrideValue: 'IZ',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 9,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product/Service ID2',
                    key: 'productId2',
                    type: 'string',
                  },
                  {
                    index: 10,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product/Service ID Qualifier3',
                    key: 'productIdQualifier3',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'IN',
                          name: 'IN',
                          overrideValue: 'IN',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 11,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product/Service ID3',
                    key: 'productId3',
                    type: 'string',
                  },
                  {
                    index: 12,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product/Service ID Qualifier4',
                    key: 'productIdQualifier4',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'BO',
                          name: 'OR',
                          overrideValue: 'OR',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 13,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product/Service ID4',
                    key: 'productId4',
                    type: 'string',
                  },
                  {
                    index: 14,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product/Service ID Qualifier5',
                    key: 'productIdQualifier5',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'VA',
                          name: 'VA',
                          overrideValue: 'VA',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 15,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product/Service ID5',
                    key: 'productId5',
                    type: 'string',
                  },
                  {
                    index: 16,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product/Service ID Qualifier6',
                    key: 'productIdQualifier6',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'JP',
                          name: 'Pre-pack',
                          overrideValue: 'Pre-pack',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 17,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product/Service ID6',
                    key: 'productId6',
                    type: 'string',
                  },
                  {
                    index: 18,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product/Service ID Qualifier7',
                    key: 'productIdQualifier7',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'CG',
                          name: 'Coordinate Group',
                          overrideValue: 'Coordinate Group',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 19,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product/Service ID8',
                    key: 'productId7',
                    type: 'string',
                  },
                ],
                segmentFormatList: [
                  {
                    key: 'CTP',
                    code: 'CTP',
                    name: 'Pricing Information',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Class of Trade',
                        key: 'classOfTrade',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'RS',
                              name: 'Resale',
                              overrideValue: 'Resale',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 3,
                        minimumLen: 3,
                        name: 'Price Code Qualifier',
                        key: 'priceCodeQualifier',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'RTL',
                              name: 'Resale Price',
                              overrideValue: 'Resale Price',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 14,
                        minimumLen: 1,
                        name: 'Unit Price',
                        key: 'unitPrice',
                        type: 'decimal',
                      },
                    ],
                    segmentFormatList: [],
                  },
                  {
                    key: 'CUR',
                    code: 'CUR',
                    name: 'Currency',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        name: 'Entity Identifier Code',
                        key: 'entityIdentifierCode',
                        type: 'string',
                      },
                      {
                        index: 2,
                        name: 'Currency Code',
                        key: 'currencyCode',
                        type: 'string',
                      },
                    ],
                  },
                  {
                    key: 'MEA',
                    code: 'MEA',
                    name: 'Measurements',
                    type: 'Object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Class of Trade',
                        key: 'classOfTrade',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'SH',
                              name: 'Shipping Tolerance',
                              overrideValue: 'Shipping Tolerance',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 3,
                        minimumLen: 3,
                        name: 'Price Code Qualifier',
                        key: 'priceCodeQualifier',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'PO',
                              name: 'Percent of Order',
                              overrideValue: 'Percent of Order',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 14,
                        minimumLen: 1,
                        name: 'Unit Price',
                        key: 'UnitPrice',
                        type: 'decimal',
                      },
                    ],
                  },
                  {
                    code: 'PID',
                    key: 'PID',
                    name: 'product/Item Description',
                    mandatory: false,
                    type: 'list',

                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 1,
                        minimumLen: 1,
                        name: 'Item Description Type',
                        key: 'itemDescriptionType',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'F',
                              name: 'Free Form',
                              overrideValue: 'Free Form',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product Characteristic Code',
                        key: 'productCharacteristicCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: '08',
                              name: 'Product Description',
                              overrideValue: 'Product Description',
                            },
                            {
                              value: '75',
                              name: 'Buyers Color Desc',
                              overrideValue: 'Buyers Color Desc',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },

                      {
                        index: 5,
                        maximumLen: 30,
                        minimumLen: 1,
                        name: 'Description',
                        key: 'description',
                        type: 'string',
                      },
                    ],
                  },

                  {
                    code: 'PO4',
                    key: 'PO4',
                    name: 'ItemPhysicalDetails',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 6,
                        minimumLen: 1,
                        name: 'Pack',
                        key: 'pack',
                        type: 'integer',
                      },
                      {
                        index: 2,
                        maximumLen: 8,
                        minimumLen: 1,
                        name: 'Size',
                        key: 'size',
                        type: 'integer',
                      },
                      {
                        index: 3,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Unit of Measure Code1',
                        key: 'unitOfMeasureCode1',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'EA',
                              name: 'Each (Unit)',
                              overrideValue: 'Each (Unit)',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 4,
                        maximumLen: 3,
                        minimumLen: 3,
                        name: 'Packing Code',
                        key: 'PackingCode',
                        type: 'string',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'CTN',
                              name: 'CTN',
                              overrideValue: 'CTN',
                            },
                          ],
                          allowAny: false,
                        },
                      },
                      {
                        index: 8,
                        maximumLen: 9,
                        minimumLen: 1,
                        name: 'Gross Volume per Pack',
                        key: 'grossVolumePerPack',
                        type: 'integer',
                      },
                      {
                        index: 9,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Unit of Measure Code2',
                        key: 'unitOfMeasureCode2',
                        type: 'string',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'EA',
                              name: 'EA',
                              overrideValue: 'EA',
                            },
                          ],
                          allowAny: false,
                        },
                      },
                      {
                        index: 14,
                        maximumLen: 5,
                        minimumLen: 1,
                        name: 'Inner Pack',
                        key: 'innerPack',
                        type: 'string',
                      },
                      {
                        index: 15,
                        maximumLen: 5,
                        minimumLen: 1,
                        name: 'Surface/Layer/Position Code',
                        key: 'surface/Layer/PositionCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'AL',
                              name: 'All',
                              overrideValue: 'All',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 18,
                        maximumLen: 9,
                        minimumLen: 1,
                        name: 'Number',
                        key: 'number',
                        type: 'integer',
                      },
                    ],
                  },
                  {
                    code: 'SDQ',
                    key: 'SDQ',
                    name: 'Destination/Quantity Data',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Unit of Measurement Code',
                        key: 'unitOfMeasurementCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'EA',
                              name: 'Each',
                              overrideValue: 'Each',
                            },
                            {
                              value: 'CA',
                              name: 'Prepack',
                              overrideValue: 'Prepack',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Location Qualifier',
                        key: 'locationQualifier',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: '92',
                              name: 'Pack by Store',
                              overrideValue: 'Pack by Store',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 4,
                        minimumLen: 4,
                        name: 'Location Identifier',
                        key: 'locationIdentifier',
                        type: 'string',
                      },
                      {
                        index: 4,
                        maximumLen: 10,
                        minimumLen: 1,
                        name: 'Quantity',
                        key: 'quantity',
                        type: 'integer',
                      },
                    ],
                  },
                  {
                    key: 'N9',
                    code: 'N9',
                    name: 'Reference Number',
                    type: 'list',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 3,
                        minimumLen: 2,
                        name: 'Reference Number Qual',
                        key: 'referenceNumberQual',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'DP',
                              name: 'Department',
                              overrideValue: 'department',
                            },
                            {
                              value: 'MR',
                              name: 'MIC',
                              overrideValue: 'mic',
                            },
                            {
                              value: 'BT',
                              name: 'Group Code',
                              overrideValue: 'groupCode',
                            },
                            {
                              value: 'JH',
                              name: 'Label Code',
                              overrideValue: 'labelCode',
                            },
                            {
                              value: 'OIC',
                              name: 'Label Type',
                              overrideValue: 'label',
                            },
                            {
                              value: 'E9',
                              name: 'Hangtag Type',
                              overrideValue: 'hangtag',
                            },
                            {
                              value: '2I',
                              name: 'Tracking',
                              overrideValue: 'tracking',
                            },
                            {
                              value: 'PM',
                              name: 'Concatenated Style',
                              overrideValue: 'concatenated',
                            },
                            {
                              value: 'TS',
                              name: 'HTS',
                              overrideValue: 'hts',
                            },
                            {
                              value: 'W9',
                              name: 'Special Packageing',
                              overrideValue: 'specialPackageing',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 8,
                        minimumLen: 1,
                        name: 'Reference Number',
                        key: 'referenceNumber',
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 30,
                        minimumLen: 1,
                        name: 'Free-form Description',
                        key: 'free-formDescription',
                        type: 'string',
                      },
                    ],
                  },
                  {
                    code: 'SLN',
                    key: 'SLN',
                    name: 'Subline Item Detail',
                    mandatory: false,
                    type: 'list',
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 6,
                        minimumLen: 6,
                        name: 'Assigned Identification',
                        key: 'assignedIdentification',
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 1,
                        minimumLen: 1,
                        name: 'Relationship Code',
                        key: 'relationshipCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'I',
                              name: 'Included',
                              overrideValue: 'Included',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 4,
                        maximumLen: 15,
                        minimumLen: 1,
                        name: 'Quantity',
                        key: 'quantity',
                        type: 'integer',
                      },
                      {
                        index: 5,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Unit of Measure Code',
                        key: 'unitOfMeasureCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'EA',
                              name: 'Each',
                              overrideValue: 'Each',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 6,
                        maximumLen: 17,
                        minimumLen: 1,
                        name: 'Unit Price',
                        key: 'unitPrice',
                        type: 'decimal',
                      },
                      {
                        index: 7,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Basis of Unit Price',
                        key: 'basisOfUnitPrice',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'LE',
                              name: 'Catalog Price Each',
                              overrideValue: 'Catalog Price Each',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 9,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product ID Qualifier',
                        key: 'productIdQualifier1',
                        type: 'string',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'UP',
                              name: 'UP',
                              overrideValue: 'UP',
                            },
                          ],
                          allowAny: false,
                        },
                      },
                      {
                        index: 10,
                        maximumLen: 3,
                        minimumLen: 3,
                        name: 'Product ID',
                        key: 'ProductId1',
                        type: 'string',
                      },
                      {
                        index: 11,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product/Service ID Qualifier',
                        key: 'productIdQualifier2',
                        type: 'string',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'IZ',
                              name: 'IZ',
                              overrideValue: 'IZ',
                            },
                          ],
                          allowAny: false,
                        },
                      },
                      {
                        index: 12,
                        maximumLen: 48,
                        minimumLen: 1,
                        name: 'Product ID',
                        key: 'productId2',
                        type: 'string',
                      },
                      {
                        index: 13,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product ID Qualifier',
                        key: 'productIdQualifier3',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'JP',
                              name: 'PrepackNameSize',
                              overrideValue: 'Prepack Name Size',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 14,
                        maximumLen: 48,
                        minimumLen: 1,
                        name: 'Product/Service ID',
                        key: 'productId3',
                        type: 'string',
                      },
                      {
                        index: 17,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product/Service ID Qualifier',
                        key: 'productIdQualifier4',
                        type: 'string',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'BO',
                              name: 'BO',
                              overrideValue: 'BO',
                            },
                          ],
                          allowAny: false,
                        },
                      },
                      {
                        index: 18,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product/Service ID',
                        key: 'productId4',
                        type: 'string',
                      },
                    ],
                  },
                ],
              },
              {
                key: 'CTP',
                code: 'CTP',
                name: 'Pricing Information',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Class of Trade',
                    key: 'classOfTrade',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'RS',
                          name: 'Resale',
                          overrideValue: 'Resale',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 3,
                    minimumLen: 3,
                    name: 'Price Code Qualifier',
                    key: 'priceCodeQualifier',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'RTL',
                          name: 'Resale Price',
                          overrideValue: 'Resale Price',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 3,
                    maximumLen: 14,
                    minimumLen: 1,
                    name: 'Unit Price',
                    key: 'unitPrice',
                    type: 'decimal',
                  },
                ],
                segmentFormatList: [],
              },
              {
                code: 'SE',
                key: 'SE',
                name: 'Transaction Set Trailer',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 6,
                    minimumLen: 1,
                    name: 'Number of Included Segments',
                    key: 'numberofIncludedSegments',
                    type: 'integer',
                  },
                  {
                    index: 2,
                    maximumLen: 9,
                    minimumLen: 4,
                    name: 'Transaction Set Control Number',
                    key: 'transactionSetControlNumber',
                    type: 'integer',
                  },
                ],
              },
              {
                code: 'CTT',
                key: 'CTT',
                name: 'Transaction Total',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 6,
                    minimumLen: 1,
                    name: 'Number of Line Items',
                    key: 'numberofLineItems',
                    type: 'integer',
                  },
                ],
              },
            ],
          },
          {
            code: 'GE',
            key: 'GE',
            name: 'Group Control Trailer',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 6,
                minimumLen: 1,
                name: 'Number of Included Transaction Sets ',
                key: 'numberOfIncludedTransactionSets',
                type: 'integer',
              },
              {
                index: 2,
                maximumLen: 9,
                minimumLen: 1,
                name: 'Data Interchange Control Num',
                key: 'dataInterchangeControlNum',
                type: 'integer',
              },
            ],
          },
          {
            key: 'IEA',
            code: 'IEA',
            name: 'Interchange Control Trailer',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 5,
                minimumLen: 1,
                name: 'Number of Included Groups',
                key: 'numberofIncludedGroups',
                type: 'integer',
              },
              {
                index: 2,
                maximumLen: 9,
                minimumLen: 9,
                name: 'Interchange Control Number',
                key: 'interchangeControlNumber',
                type: 'string',
              },
            ],
          },
        ],
      },
    },
    {
      ediType: '860',
      rootSegmentFormat: {
        type: 'object',
        segmentFormatList: [
          {
            key: 'ISA',
            code: 'ISA',
            name: 'interchange Control Header',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Authorization Info Qualifier',
                key: 'authorizationInfoQualifier',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '00',
                      name: '00',
                      overrideValue: '00',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 2,
                maximumLen: 10,
                minimumLen: 10,
                name: 'Authorization Information',
                key: 'authorizationInformation',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '          ',
                      name: '          ',
                      overrideValue: '          ',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 3,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Security Info Qualifier ',
                key: 'securityInfoQualifier ',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '00',
                      name: '00',
                      overrideValue: '00',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 4,
                maximumLen: 10,
                minimumLen: 10,
                name: 'Security Information',
                key: 'securityInformation',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '          ',
                      name: '          ',
                      overrideValue: '          ',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 5,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Interchange Sender ID QL',
                key: 'interchangeSenderIdQl',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '08',
                      name: '08',
                      overrideValue: '08',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 6,
                maximumLen: 15,
                minimumLen: 15,
                name: 'Interchange Sender ID',
                key: 'interchangeSenderId',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '6112390050',
                      name: 'GXS',
                      overrideValue: 'GXS',
                    },
                    {
                      value: '6112391050',
                      name: 'Inovis',
                      overrideValue: 'Inovis',
                    },
                    {
                      value: '6112392050',
                      name: 'InterTrade',
                      overrideValue: 'InterTrade',
                    },
                  ],
                  allowAny: true,
                },
              },
              {
                index: 7,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Interchange Receiver QL',
                key: 'interchangeReceiverQl',
                type: 'string',
              },
              {
                index: 8,
                maximumLen: 15,
                minimumLen: 15,
                name: 'Interchange Receiver ID',
                key: 'interchangeReceiverId',
                type: 'string',
              },
              {
                index: 9,
                maximumLen: 6,
                minimumLen: 6,
                name: 'Created Date',
                key: 'createdDate',
                type: 'date',
                format: 'yyMMdd',
              },
              {
                index: 10,
                maximumLen: 4,
                minimumLen: 4,
                name: 'Created Time',
                key: 'createdTime',
                type: 'time',
              },
              {
                index: 11,
                maximumLen: 1,
                minimumLen: 1,
                name: 'Interchange Standards ID',
                key: 'interchangeStandardsId',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'U',
                      name: 'U',
                      overrideValue: 'U',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 12,
                maximumLen: 5,
                minimumLen: 5,
                name: 'Interchange Version ID',
                key: 'interchangeVersionId',
                type: 'string',
              },
              {
                index: 13,
                maximumLen: 9,
                minimumLen: 9,
                name: 'Interchange Control Number',
                key: 'interchangeControlNumber',
                type: 'string',
              },
              {
                index: 14,
                maximumLen: 1,
                minimumLen: 1,
                name: 'Acknowledgement Requested',
                key: 'acknowledgement Requested ',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '0',
                      name: '0',
                      overrideValue: '0',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 15,
                maximumLen: 1,
                minimumLen: 1,
                name: 'Test Indicator',
                key: 'testIndicator',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'T',
                      name: 'Test',
                      overrideValue: 'Test',
                    },
                    {
                      value: 'P',
                      name: 'Prod',
                      overrideValue: 'Prod',
                    },
                  ],
                  allowAny: true,
                },
              },
              {
                index: 16,
                maximumLen: 1,
                minimumLen: 1,
                name: 'Sub Element Separator',
                key: 'subElementSeparator',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '>',
                      name: '>',
                      overrideValue: '>',
                    },
                  ],
                  allowAny: false,
                },
              },
            ],
          },
          {
            key: 'GS',
            code: 'GS',
            name: 'Funtional Group Header',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 2,
                minimumLen: 2,
                name: 'Functional ID',
                key: 'functionalId',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'PC',
                      name: 'PC',
                      overrideValue: 'PC',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 2,
                maximumLen: 10,
                minimumLen: 10,
                name: 'Application Sender ID',
                key: 'applicationSenderId',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '6112390050',
                      name: 'GXS',
                      overrideValue: 'GXS',
                    },
                    {
                      value: '6112391050',
                      name: 'Inovis',
                      overrideValue: 'Inovis',
                    },
                    {
                      value: '6112392050',
                      name: 'InterTrade',
                      overrideValue: 'InterTrade',
                    },
                  ],
                  allowAny: true,
                },
                type: 'string',
              },
              {
                index: 3,
                maximumLen: 15,
                minimumLen: 2,
                name: 'Application Receiver ID',
                key: 'applicationReceiverId',
                type: 'string',
              },
              {
                index: 4,
                maximumLen: 8,
                minimumLen: 8,
                name: 'Data Interchange Date',
                key: 'dataInterchangeDate',
                type: 'date',
                Format: 'yyyyMMdd',
              },
              {
                index: 5,
                maximumLen: 4,
                minimumLen: 4,
                name: 'Data Interchange Time',
                key: 'dataInterchangeTime',
                type: 'time',
              },
              {
                index: 6,
                maximumLen: 9,
                minimumLen: 1,
                name: 'Data Interchange Control Number',
                key: 'dataInterchangeControlNumber',
                type: 'string',
              },
              {
                index: 7,
                maximumLen: 2,
                minimumLen: 1,
                name: 'Responsible Agency Code',
                key: 'responsibleAgencyCode',
                type: 'string',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'X',
                      name: 'X',
                      overrideValue: 'X',
                    },
                  ],
                  allowAny: false,
                },
              },
              {
                index: 8,
                maximumLen: 12,
                minimumLen: 1,
                name: 'Version ID',
                key: 'versionId',
                type: 'string',
              },
            ],
          },
          {
            key: 'ST',
            code: 'ST',
            name: 'Transaction Set Header',
            type: 'list',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 3,
                minimumLen: 3,
                name: 'Transaction Set Identifier Code',
                key: 'transactionSetIdentifierCode',
                type: 'string',
              },
              {
                index: 2,
                maximumLen: 9,
                minimumLen: 4,
                name: 'Transaction Set Control Number',
                key: 'transactionSetControlNumber',
                type: 'integer',
              },
            ],
            segmentFormatList: [
              {
                key: 'BCH',
                code: 'BCH',
                name: 'Beginning Segement',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Transaction Set Purpose',
                    key: 'transactionSetPurpose',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: '01',
                          name: 'Cancellation',
                          overrideValue: 'Cancellation',
                        },
                        {
                          value: '04',
                          name: 'Change',
                          overrideValue: 'Change',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },

                  {
                    index: 2,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Purchase Order Type',
                    key: 'purchaseOrderType',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'SA',
                          name: 'Stand-alone',
                          overrideValue: 'Stand-alone',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 3,
                    maximumLen: 10,
                    minimumLen: 10,
                    name: 'Purchase Order Number',
                    key: 'purchaseOrderNumber',
                    type: 'string',
                  },
                  {
                    index: 6,
                    maximumLen: 8,
                    minimumLen: 8,
                    name: 'Purchase Order Date',
                    key: 'purchaseOrderDate',
                    type: 'date',
                    format: 'yyyyMMdd',
                  },
                  {
                    index: 11,
                    maximumLen: 8,
                    minimumLen: 8,
                    name: 'Po Change Request Date',
                    key: 'poChangeRequestDate',
                    type: 'date',
                    format: 'yyyyMMdd',
                  },
                ],
              },
              {
                code: 'DTM',
                key: 'DTM',
                type: 'repeatObject',
                name: ' Data Element Separator (DES)',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 3,
                    minimumLen: 3,
                    name: 'Date/Time Qualifier',
                    key: 'date/TimeQualifier',
                    overrideValueIndex: 2,
                    allowableValues: {
                      valueOptions: [
                        {
                          value: '037',
                          name: 'Start Ship',
                          overrideKey: 'startShip',
                        },
                        {
                          value: '038',
                          name: 'Last Ship',
                          overrideKey: 'lastShip',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 8,
                    minimumLen: 8,
                    name: 'Date',
                    key: 'Date',
                    type: 'date',
                    format: 'yyyyMMdd',
                  },
                ],
              },
              {
                code: 'N1',
                key: 'N1',
                name: 'Name',
                mandatory: false,
                type: 'list',

                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Organization Identifier ',
                    key: 'organizationIdentifier',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'ST',
                          name: 'Ship to',
                          overrideValue: 'Ship To',
                        },
                        {
                          value: 'MA',
                          name: 'Party to Ship To',
                          overrideValue: 'Party to Ship To',
                        },
                        {
                          value: 'AG',
                          name: 'Agent',
                          overrideValue: 'agent',
                        },
                        {
                          value: 'VN',
                          name: 'vendor',
                          overrideValue: 'vendor',
                        },
                        {
                          value: 'SU',
                          name: 'Factory (Supplier)',
                          overrideValue: 'factory(Supplier)',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 60,
                    minimumLen: 1,
                    name: 'Organization Name',
                    key: 'name',
                    type: 'string',
                  },
                  {
                    index: 3,
                    maximumLen: 2,
                    minimumLen: 1,
                    name: 'Identification Code Qualifier',
                    key: 'IdCodeQualifier',
                    mandatory: false,
                    allowableValues: {
                      valueOptions: [
                        {
                          value: '92',
                          name: 'Assigned by buyer',
                          overrideValue: 'Assigned By Buyer',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 4,
                    maximumLen: 4,
                    minimumLen: 4,
                    name: 'Identification Code',
                    key: 'identificationCode',
                    type: 'string',
                  },
                ],
                segmentFormatList: [
                  {
                    code: 'N2',
                    key: 'N2',
                    name: 'Additional Name Information ',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 55,
                        minimumLen: 1,
                        name: 'Additional Name Information',
                        key: 'additionalNameInformation1',
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 55,
                        minimumLen: 1,
                        name: 'Additional Name Information',
                        key: 'additionalNameInformation2',
                        type: 'string',
                      },
                    ],
                  },
                  {
                    code: 'N3',
                    key: 'N3',
                    name: 'Address Information',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 55,
                        minimumLen: 1,
                        name: 'Address Information',
                        key: 'addressInformation',
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 55,
                        minimumLen: 1,
                        name: 'Additional Address Information',
                        key: 'additionalAddressInformation',
                        type: 'string',
                      },
                    ],
                  },

                  {
                    code: 'N4',
                    key: 'N4',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 30,
                        minimumLen: 2,
                        name: 'City Name',
                        key: 'cityName',
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'State Or Province Code',
                        key: 'stateOrProvinceCode',
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 15,
                        minimumLen: 3,
                        name: 'Postal Code',
                        key: 'postalCode',
                        type: 'string',
                      },
                      {
                        index: 4,
                        maximumLen: 3,
                        minimumLen: 2,
                        name: 'Country Code',
                        key: 'countryCode',
                        type: 'string',
                      },
                    ],
                  },
                ],
              },
              {
                code: 'POC',
                key: 'POC',
                name: 'Line Item Change',
                type: 'list',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 11,
                    minimumLen: 1,
                    name: 'Assigned Identification',
                    key: 'assignedIdentification',
                    type: 'string',
                  },
                  {
                    index: 2,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Line Item Change',
                    key: 'lineItemChange',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'QI',
                          name: 'Quantity Increase',
                          overrideValue: 'Quantity Increase',
                        },
                        {
                          value: 'QD',
                          name: 'Quantity Decrease',
                          overrideValue: 'Quantity Decrease',
                        },
                        {
                          value: 'AI',
                          name: 'Add Item',
                          overrideValue: 'Add Item',
                        },
                        {
                          value: 'DI',
                          name: 'Delete Item',
                          overrideValue: 'Delete Item',
                        },
                        {
                          value: 'PC',
                          name: 'Price Change',
                          overrideValue: 'Price Change',
                        },
                        {
                          value: 'CA',
                          name: 'Changes to line items',
                          overrideValue: 'Changes to line items',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 3,
                    maximumLen: 9,
                    minimumLen: 9,
                    name: 'Quantity Ordered',
                    key: 'quantityOrdered',
                    type: 'integer',
                  },
                  {
                    index: 4,
                    maximumLen: 9,
                    minimumLen: 9,
                    name: 'Quantity Change',
                    key: 'quantityChange',
                    type: 'integer',
                  },
                  {
                    index: 5,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Unit of Measure Code',
                    key: 'unitOfMeasureCode',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'EA',
                          name: 'each',
                          overrideValue: 'each',
                        },
                        {
                          value: 'CA',
                          name: 'case',
                          overrideValue: 'case',
                        },
                      ],
                      allowAny: true,
                    },
                  },
                  {
                    index: 6,
                    maximumLen: 14,
                    minimumLen: 1,
                    name: 'Unit Price',
                    key: 'unitPrice',
                    type: 'decimal',
                  },
                  {
                    index: 7,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Basis of unit Price Code',
                    key: 'basisOfUnitPriceCode',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'WE',
                          name: 'Wholesale/Each',
                          overrideValue: 'Wholesale/Each',
                        },
                        {
                          value: 'RE',
                          name: 'Retail/Each',
                          overrideValue: 'Retail/Each',
                        },
                      ],
                      allowAny: true,
                    },
                    type: 'string',
                  },
                  {
                    index: 8,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product ID Qualifier1',
                    key: 'productIdQualifier1',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'UP',
                          name: 'UP',
                          overrideValue: 'UP',
                        },
                        {
                          value: 'EN',
                          name: 'EN',
                          overrideValue: 'EN',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 9,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product ID1',
                    key: 'productId1',
                    type: 'string',
                  },
                  {
                    index: 10,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product ID Qualifier2',
                    key: 'productIdQualifier2',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'IZ',
                          name: 'IZ',
                          overrideValue: 'IZ',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 11,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product ID2',
                    key: 'productId2',
                    type: 'string',
                  },
                  {
                    index: 12,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product ID Qualifier3',
                    key: 'productIdQualifier3',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'IN',
                          name: 'IN',
                          overrideValue: 'IN',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 13,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product ID3',
                    key: 'productId3',
                    type: 'string',
                  },
                  {
                    index: 14,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product ID Qualifier4',
                    key: 'productIdQualifier4',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'BO',
                          name: 'BO',
                          overrideValue: 'BO',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 15,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product ID4',
                    key: 'productId4',
                    type: 'string',
                  },
                  {
                    index: 16,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product ID Qualifier5',
                    key: 'productIdQualifier5',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'VA',
                          name: 'VA',
                          overrideValue: 'VA',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 17,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product ID5',
                    key: 'productId5',
                    type: 'string',
                  },
                  {
                    index: 18,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product ID Qualifier6',
                    key: 'productIdQualifier6',
                    type: 'string',
                  },
                  {
                    index: 19,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product ID6',
                    key: 'productId6',
                    type: 'string',
                  },
                  {
                    index: 20,
                    maximumLen: 2,
                    minimumLen: 2,
                    name: 'Product ID Qualifier7',
                    key: 'productIdQualifier7',
                    type: 'string',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'JP',
                          name: 'JP',
                          overrideValue: 'JP',
                        },
                      ],
                      allowAny: false,
                    },
                  },
                  {
                    index: 21,
                    maximumLen: 30,
                    minimumLen: 1,
                    name: 'Product ID7',
                    key: 'productId7',
                    type: 'string',
                  },
                ],
                segmentFormatList: [
                  {
                    key: 'CTP',
                    code: 'CTP',
                    name: 'Pricing Information',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Class of Trade',
                        key: 'classOfTrade',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'RS',
                              name: 'Resale',
                              overrideValue: 'Resale',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 3,
                        minimumLen: 3,
                        name: 'Price Code Qualifier',
                        key: 'priceCodeQualifier',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'UCP',
                              name: 'Cost',
                              overrideValue: 'Cost',
                            },
                            {
                              value: 'RTL',
                              name: 'Resale Price',
                              overrideValue: 'Resale Price',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 14,
                        minimumLen: 1,
                        name: 'Unit Price',
                        key: 'unitPrice',
                        type: 'decimal',
                      },
                    ],
                  },
                  {
                    code: 'PID',
                    key: 'PID',
                    name: 'product/Item Description',
                    mandatory: false,
                    type: 'list',

                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 1,
                        minimumLen: 1,
                        name: 'Item Description Type',
                        key: 'itemDescriptionType',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'F',
                              name: 'Freeform',
                              overrideValue: 'Freeform',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 2,
                        minimumLen: 3,
                        name: 'Product Characteristic Code',
                        key: 'productCharacteristicCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: '08',
                              name: 'Product',
                              overrideValue: 'Product',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 5,
                        maximumLen: 80,
                        minimumLen: 1,
                        name: 'Description',
                        key: 'description',
                        type: 'string',
                      },
                    ],
                  },

                  {
                    code: 'PO4',
                    key: 'PO4',
                    name: 'ItemPhysicalDetails',
                    type: 'object',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 6,
                        minimumLen: 1,
                        name: 'Pack',
                        key: 'pack',
                        type: 'integer',
                      },
                      {
                        index: 2,
                        maximumLen: 8,
                        minimumLen: 1,
                        name: 'Size',
                        key: 'size',
                        type: 'integer',
                      },
                      {
                        index: 3,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Unit of Measure Code',
                        key: 'unitOfMeasureCode1',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'EA',
                              name: 'Each (Unit)',
                              overrideValue: 'Each (Unit)',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 4,
                        maximumLen: 3,
                        minimumLen: 3,
                        name: 'Packing Code',
                        key: 'packingCode',
                        type: 'string',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'CTN',
                              name: 'CTN',
                              overrideValue: 'CTN',
                            },
                          ],
                          allowAny: false,
                        },
                      },
                      {
                        index: 8,
                        maximumLen: 9,
                        minimumLen: 1,
                        name: 'Gross Volume per Pack',
                        key: 'grossVolumePerPack',
                        type: 'integer',
                      },
                      {
                        index: 9,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Unit of Measure Code',
                        key: 'unitOfMeasureCode2',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'EA',
                              name: 'EA',
                              overrideValue: 'EA',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 14,
                        maximumLen: 5,
                        minimumLen: 1,
                        name: 'Inner Pack',
                        key: 'innerPack',
                        type: 'string',
                      },
                      {
                        index: 15,
                        maximumLen: 5,
                        minimumLen: 1,
                        name: 'Surface/Layer/Position Code',
                        key: 'surface/Layer/PositionCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'AL',
                              name: 'All',
                              overrideValue: 'All',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 18,
                        maximumLen: 9,
                        minimumLen: 1,
                        name: 'Number',
                        key: 'number',
                        type: 'integer',
                      },
                    ],
                  },
                  {
                    code: 'SLN',
                    key: 'SLN',
                    name: 'Subline Item Detail',
                    mandatory: false,
                    type: 'list',
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 6,
                        minimumLen: 1,
                        name: 'Assigned Identification',
                        key: 'assignedIdentification',
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 1,
                        minimumLen: 1,
                        name: 'Relationship Code',
                        key: 'relationshipCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'I',
                              name: 'Included',
                              overrideValue: 'Included',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 4,
                        maximumLen: 15,
                        minimumLen: 1,
                        name: 'Quantity',
                        key: 'quantity',
                        type: 'integer',
                      },
                      {
                        index: 5,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Unit of Measure Code',
                        key: 'unitOfMeasureCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'EA',
                              name: 'Each',
                              overrideValue: 'Each',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 6,
                        maximumLen: 14,
                        minimumLen: 1,
                        name: 'Unit Price',
                        key: 'unitPrice',
                        type: 'decimal',
                      },
                      {
                        index: 7,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Basis of Unit Price',
                        key: 'basisOfUnitPrice',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'WE',
                              name: 'Wholesale/Each',
                              overrideValue: 'Wholesale/Each',
                            },
                            {
                              value: 'RE',
                              name: 'Retail/Each',
                              overrideValue: 'Retail/Each',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 9,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product ID Qualifier',
                        key: 'productIdQualifier1',
                        type: 'string',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'UP',
                              name: 'UP',
                              overrideValue: 'UP',
                            },
                            {
                              value: 'EN',
                              name: 'EN',
                              overrideValue: 'EN',
                            },
                          ],
                          allowAny: false,
                        },
                      },
                      {
                        index: 10,
                        maximumLen: 30,
                        minimumLen: 1,
                        name: 'Product ID',
                        key: 'productId1',
                        type: 'string',
                      },
                      {
                        index: 11,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product ID Qualifier',
                        key: 'productIdQualifier2',
                        type: 'string',
                      },
                      {
                        index: 12,
                        maximumLen: 30,
                        minimumLen: 1,
                        name: 'Product ID',
                        key: 'productId2',
                        type: 'string',
                      },
                      {
                        index: 13,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Product ID Qualifier',
                        key: 'productIdQualifier3',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'JP',
                              name: 'JP',
                              overrideValue: 'JP',
                            },
                          ],
                          allowAny: false,
                        },
                        type: 'string',
                      },
                      {
                        index: 14,
                        maximumLen: 30,
                        minimumLen: 1,
                        name: 'Product/Service ID ',
                        key: 'productId3',
                        type: 'string',
                      },
                    ],
                  },
                  {
                    code: 'SDQ',
                    key: 'SDQ',
                    name: 'Destination/Quantity Data',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 2,
                        minimumLen: 2,
                        name: 'Unit of Measurement Code',
                        key: 'unitOfMeasurementCode',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'EA',
                              name: 'Each',
                              overrideValue: 'Each',
                            },
                            {
                              value: 'CA',
                              name: 'Prepack',
                              overrideValue: 'Prepack',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 2,
                        minimumLen: 1,
                        name: 'Location Qualifier',
                        key: 'locationQualifier',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: '92',
                              name: 'Pack by Store',
                              overrideValue: 'Pack by Store',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 17,
                        minimumLen: 2,
                        name: 'Location Identifier',
                        key: 'locationIdentifier',
                        type: 'string',
                      },
                      {
                        index: 4,
                        maximumLen: 10,
                        minimumLen: 1,
                        name: 'Quantity',
                        key: 'Quantity',
                        type: 'integer',
                      },
                    ],
                  },
                  {
                    key: 'N9',
                    code: 'N9',
                    name: 'Reference Number',
                    type: 'list',
                    mandatory: false,
                    elementFormatList: [
                      {
                        index: 1,
                        maximumLen: 3,
                        minimumLen: 2,
                        name: 'Reference Number Qual',
                        key: 'referenceNumberQual',
                        allowableValues: {
                          valueOptions: [
                            {
                              value: 'DP',
                              name: 'Department',
                              overrideValue: 'department',
                            },
                            {
                              value: 'MR',
                              name: 'MIC',
                              overrideValue: 'mic',
                            },
                            {
                              value: 'BT',
                              name: 'Group Code',
                              overrideValue: 'groupCode',
                            },
                            {
                              value: 'JH',
                              name: 'Label Code',
                              overrideValue: 'labelCode',
                            },
                            {
                              value: 'OIC',
                              name: 'Label Type',
                              overrideValue: 'label',
                            },
                            {
                              value: 'E9',
                              name: 'Hangtag Type',
                              overrideValue: 'hangtag',
                            },
                            {
                              value: 'W9',
                              name: 'Special Packageing',
                              overrideValue: 'specialPackageing',
                            },
                          ],
                          allowAny: true,
                        },
                        type: 'string',
                      },
                      {
                        index: 2,
                        maximumLen: 18,
                        minimumLen: 1,
                        name: 'Reference Number',
                        key: 'referenceNumber',
                        type: 'string',
                      },
                      {
                        index: 3,
                        maximumLen: 30,
                        minimumLen: 1,
                        name: 'Free-form Description',
                        key: 'free-formDescription',
                        type: 'string',
                      },
                    ],
                  },
                ],
              },
              {
                code: 'CTT',
                key: 'CTT',
                name: 'Transaction Total',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 6,
                    minimumLen: 1,
                    name: 'Number of Line Items',
                    key: 'numberofLineItems',
                    type: 'integer',
                  },
                ],
              },
              {
                code: 'SE',
                key: 'SE',
                name: 'Transaction Set Trailer',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    maximumLen: 6,
                    minimumLen: 1,
                    name: 'Number of Included Segments',
                    key: 'numberofIncludedSegments',
                    type: 'integer',
                  },
                  {
                    index: 2,
                    maximumLen: 9,
                    minimumLen: 4,
                    name: 'Transaction Set Control Number',
                    key: 'transactionSetControlNumber',
                    type: 'integer',
                  },
                ],
              },
            ],
          },
          {
            code: 'GE',
            key: 'GE',
            name: 'Group Control Trailer',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 6,
                minimumLen: 1,
                name: 'Number of Included Transaction Sets ',
                key: 'numberOfIncludedTransactionSets',
                type: 'integer',
              },
              {
                index: 2,
                maximumLen: 9,
                minimumLen: 1,
                name: 'Data Interchange Control Num',
                key: 'dataInterchangeControlNum',
                type: 'integer',
              },
            ],
          },
          {
            key: 'IEA',
            code: 'IEA',
            name: 'Interchange Control Trailer',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                maximumLen: 5,
                minimumLen: 1,
                name: 'Number of Included Groups',
                key: 'numberofIncludedGroups',
                type: 'integer',
              },
              {
                index: 2,
                maximumLen: 9,
                minimumLen: 9,
                name: 'Interchange Control Number',
                key: 'interchangeControlNumber',
                type: 'string',
              },
            ],
          },
        ],
      },
    },
  ],
} as EdiFormatJson

interface ParserError {
  category?: string
  errorType?: string
  errorIdex?: number
  mainHeadIndex?: number
  afterMainHeadLocation?: number
  segmentPosition?: string
  errorID?: string
  message?: string
}

export default class Edi850Parser extends BaseEdiParser {
  constructor(
    protected readonly allService: {
      swivelConfigService: SwivelConfigService
      outboundService: OutboundService
    }
  ) {
    super(allService, {}, { import: { formatJson, ediType: 'dillards' } })
  }

  async import(ediString: string): Promise<any> {
    // console.log(`import type  : ${this.type}`)
    const { jsonData, errorList, ediType } = await super.import(ediString)
    // const poList: any[] = []
    // return jsonData
    const error = errorList.find(x => x.errorType === 'Transaction Set Trailer all Missing')
    if ((!jsonData || jsonData.length === 0) && error) {
      // undefined or empty array
      throw new Error(error.message)
    }
    // return jsonData

    const holeEdi: any = {
      partyGroupCode,
      edi: true,
      ISASenderIdQl: _.get(jsonData, 'ISA.interchangeSenderIdQl'),
      ISASenderId: _.get(jsonData, 'ISA.interchangeSenderId'),
      ISAReceiverQl: _.get(jsonData, 'ISA.interchangeReceiverQl'),
      ISAReceiverId: _.get(jsonData, 'ISA.interchangeReceiverId'),
      testOrProd: _.get(jsonData, 'ISA.testIndicator'),
      interchangeControlNumber: _.get(jsonData, 'ISA.interchangeControlNumber'),
      senderId: _.get(jsonData, 'GS.applicationSenderId'),
      receiverId: _.get(jsonData, 'GS.applicationReceiverId'),
      dataInterchangeControlNumber: _.get(jsonData, 'GS.dataInterchangeControlNumber'),
      versionId: _.get(jsonData, 'GS.versionId'),
      ediType,
      noSent:
        _.get(jsonData, 'GE.numberOfIncludedTransactionSets') ||
        _.get(jsonData, 'GE.dataInterchangeControlNum'),
      errors: errorList,
      poList: [],
    }
    const sts = _.get(jsonData, 'ST', []) || []
    const stIdList = []
    if (sts.length) {
      for (const ST of sts) {
        const stId = _.get(ST, 'transactionSetControlNumber')
        stIdList.push(stId)
      }
    }
    for (let i = 1; i <= holeEdi.noSent; i++) {
      if (!stIdList.includes(i)) {
        const error: ParserError = {
          category: 'transactionSetSyntaxError',
          errorType: 'Transaction set Trailer Missing',
          errorIdex: 0,
          mainHeadIndex: i,
          segmentPosition: '0',
          errorID: 'ST',
          message: 'Some Transaction set Trailer Missing!',
        }
        errorList.push(error)
      }
    }

    if (ediType === '850') {
      if (sts.length) {
        for (const ST of sts) {
          // if (_.get(ST, 'transactionSetIdentifierCode') !== '850') {
          //   throw new Error('not correct edi type')
          // }
          if (
            _.get(ST, 'transactionSetControlNumber') !== _.get(ST, 'SE.transactionSetControlNumber')
          ) {
            const error: ParserError = {
              category: 'transactionSetSyntaxError',
              errorType: 'Transaction Set in Header & Trailer Do Not Match',
              errorIdex: 0,
              mainHeadIndex: parseInt(_.get(ST, 'transactionSetControlNumber'), 10),
              segmentPosition: '0',
              errorID: '',
              message: 'Transaction Set in Header & Trailer Do Not Match',
            }
            errorList.push(error)
          }
          const po: any = {
            partyGroupCode,
            edi: true,
            errors: errorList,
            poNo: _.get(ST, 'BEG.purchaseOrderNumber'),
            poDate: _.get(ST, 'BEG.purchaseOrderDate')
            ? moment.utc(_.get(ST, 'BEG.purchaseOrderDate')).toDate()
            : null,
            poOrder: _.get(ST, 'transactionSetControlNumber'),
            consigneeId: _.get(ST, 'REF.DeptNumber'),
            vendorId: _.get(ST, 'REF.Vendor'),
            divisionId: _.get(ST, 'REF.DivisionID'),
            buyer: _.get(ST, 'PER.name'),
            shipNotBefore: _.get(ST, 'DTM.shipNotBefore')
              ? moment.utc(_.get(ST, 'DTM.shipNotBefore')).toDate()
              : null,
            doNotShipAfter: _.get(ST, 'DTM.doNotShipAfter')
              ? moment.utc(_.get(ST, 'DTM.doNotShipAfter')).toDate()
              : null,
            firstArrive: _.get(ST, 'DTM.firstArrive')
              ? moment.utc(_.get(ST, 'DTM.firstArrive')).toDate()
              : _.get(ST, 'DTM.shipNotBefore')
              ? moment.utc(_.get(ST, 'DTM.shipNotBefore')).toDate()
              : null,
            lastArrive: _.get(ST, 'DTM.lasttArrive')
              ? moment.utc(_.get(ST, 'DTM.lasttArrive')).toDate()
              : null,
            mode: _.get(ST, 'TD5.transportationMethod/Type')
          }
          const fob = _.get(ST, 'FOB', []) || []
          if (fob.length)
          {
            po.portOfLoadingCounrty = fob.find(x => x.locationQualifier1 === 'On vessel').description1
            po.portOfLoading = fob.find(x => x.locationQualifier1 === 'Other FOB Point').description1
          }
          else
          {
            po.portOfLoadingCounrty = _.get(fob, 'locationQualifier1') === 'On vessel'
              ? _.get(fob, 'description1')
              : null
            po.portOfLoading = _.get(fob, 'locationQualifier1') === 'Other FOB Point'
              ? _.get(fob, 'description1')
              : null
          }
          let n1s = _.get(ST, 'N1', []) || []
          if (n1s && !n1s.length)
          {
            n1s = [n1s]
          }
          if (n1s.length) {
            const partyMapper = {
              'Ship From': 'shipper',
              'Ship To': 'shipTo',
            }
            for (const N1 of n1s) {
              const role = _.get(N1, 'organizationIdentifier')
              if (partyMapper[role]) {
                const newRole = partyMapper[role]
                if (newRole === 'shipper') {
                  _.set(po, `${newRole}PartyCode`, _.get(N1, 'identificationCode'))
                  _.set(po, `${newRole}PartyName`, _.get(N1, 'name'))
                }
                if (newRole === 'shipTo') {
                  const index = (_.get(N1, 'name') || '').indexOf('#')
                  _.set(
                    po,
                    `${newRole}PartyCode`,
                    `${(_.get(N1, 'name') || '').substr(index + 1)} ${_.get(
                      N1,
                      'identificationCode'
                    ).substr(0, 9)}`.trim()
                  )
                  _.set(
                    po,
                    `${newRole}PartyName`,
                    (_.get(N1, 'name') || '').substr(0, index) || _.get(N1, 'name')
                  )
                }
                _.set(po, `${newRole}AdditionalName1`, _.get(N1, 'N2.additionalNameInformation1'))
                _.set(po, `${newRole}AdditionalName2`, _.get(N1, 'N2.additionalNameInformation2'))
                _.set(po, `${newRole}PartyAddress1`, _.get(N1, 'N3.addressInformation'))
                _.set(po, `${newRole}PartyAddress2`, _.get(N1, 'N3.additionalAddressInformation'))
                _.set(po, `${newRole}PartyStateCode`, _.get(N1, 'N4.stateOrProvinceCode'))
                _.set(po, `${newRole}PartyCountryCode`, _.get(N1, 'N4.countryCode'))
                _.set(po, `${newRole}PartyStateZip`, _.get(N1, 'N4.postalCode'))
              } else {
                _.set(po, `${role.replace(/\s/g, '')}PartyName`, _.get(N1, 'name'))
                _.set(po, `${role.replace(/\s/g, '')}PartyCode`, _.get(N1, 'identificationCode'))
                _.set(po, `${role.replace(/\s/g, '')}AdditionalName1`, _.get(N1, 'N2.additionalNameInformation1'))
                _.set(po, `${role.replace(/\s/g, '')}AdditionalName2`, _.get(N1, 'N2.additionalNameInformation2'))
                _.set(
                  po,
                  `${role.replace(/\s/g, '')}PartyAddress1`,
                  _.get(N1, 'N3.addressInformation')
                )
                _.set(
                  po,
                  `${role.replace(/\s/g, '')}PartyAddress2`,
                  _.get(N1, 'N3.additionalAddressInformation')
                )
                _.set(
                  po,
                  `${role.replace(/\s/g, '')}PartyStateCode`,
                  _.get(N1, 'N4.stateOrProvinceCode')
                )
                _.set(po, `${role.replace(/\s/g, '')}PartyCountryCode`, _.get(N1, 'N4.countryCode'))
                _.set(po, `${role.replace(/\s/g, '')}PartyStateZip`, _.get(N1, 'N4.postalCode'))
              }
            }
          }
          if (_.get(jsonData, 'ISA.createdDate') && _.get(jsonData, 'ISA.createdTime')) {
            const datetime = moment.utc(
              `${_.get(jsonData, 'ISA.createdDate')} ${_.get(jsonData, 'ISA.createdTime')}`
            )
            _.set(po, 'ediCreatedDateActual', datetime)
          }
          if (
            _.get(jsonData, 'GS.dataInterchangeDate') &&
            _.get(jsonData, 'GS.dataInterchangeTime')
          ) {
            const datetime = moment.utc(
              `${_.get(jsonData, 'GS.dataInterchangeDate')} ${_.get(
                jsonData,
                'GS.dataInterchangeTime'
              )}`
            )
            _.set(po, 'dataInterchangeDateActual', datetime)
          }
          if (_.get(ST, 'promoStart')) {
            _.set(po, 'promoStart', moment.utc(_.get(ST, 'DTM.promoStart')))
          }
          if (_.get(ST, 'DTM.lastArrive')) {
            _.set(po, 'lastArrive', moment.utc(_.get(ST, 'DTM.lastArrive')))
          }
          const po1 = _.get(ST, 'PO1', []) || []
          if (po1.length) {
            const poItemList: any[] = []
            for (const PO1 of po1) {
              // k<ST['PO1'].length
              let sln = _.get(PO1, 'SLN')
              if (!_.get(PO1, 'SLN').length)
              {
                sln = [sln]
              }
              const packInfoList = []
              for (const SLN of sln)
              {
                const packInfo: any = {
                  subLine: _.get(SLN, 'assignedIdentification'),
                  unitPrice: _.get(SLN, 'unitPrice'),
                  size: (_.get(SLN, 'productId2') || ''),
                  quantity: _.get(SLN, 'quantity'),
                  quantityUnit: _.get(SLN, 'unitOfMeasureCode'),
                }
                packInfoList.push(packInfo)
              }
              const product: any = {
                // sdqQuantityPerPackage: _.get(PO1, 'SDQ.quantity'),
                quantityPerPackage: _.get(PO1, 'PO4.pack'),
                productDescription: _.get(PO1, 'PID.description'),
                quantity: _.get(PO1, 'quantityOrdered'),
                quantityUnit: _.get(PO1, 'unitOfMeasureCode'),
                volume: _.get(PO1, 'PO4.grossVolumePerPack'),
                product: {
                  // subLine: _.get(PO1, 'SLN.assignedIdentification'),
                  poLineNo: _.get(PO1, 'poLineNumber'),
                  // unitPrice: _.get(PO1, 'SLN.unitPrice'),
                  priceUnit: _.get(PO1, 'basisOfUnitPrice'),
                  upcen: _.get(PO1, 'productId1').trim(),
                  // size: (_.get(PO1, 'SLN.productId2') || ''),
                  colorDesc: _.get(PO1, 'productId4'),
                  pack: _.get(PO1, 'poLineNumber'),
                  buyerSKU: _.get(PO1, 'productId3'),
                  style: _.get(PO1, 'productId5'),
                  price: _.get(PO1, 'productId6'),
                },
                packInfo : packInfoList,
              }
              let n9s = _.get(PO1, 'N9', []) || []
              if (n9s && !n9s.length)
              {
                n9s = [n9s]
              }
              if (n9s.length)
              {
                for (const n9 of n9s)
                {
                  product[_.get(n9, 'referenceNumberQual')] = _.get(n9, 'referenceNumber')
                }
              }
              poItemList.push(product)

            }
            if (poItemList.length) {
              _.set(po, 'purchaseOrderItems', poItemList)
            }
          }
          holeEdi.poList.push(po)
        }
      }
    } else if (ediType === '860') {
      if (sts.length) {
        for (const ST of sts) {
          if (
            _.get(ST, 'transactionSetControlNumber') !== _.get(ST, 'SE.transactionSetControlNumber')
          ) {
            const error: ParserError = {
              category: 'transactionSetSyntaxError',
              errorType: 'Transaction Set in Header & Trailer Do Not Match',
              errorIdex: 0,
              mainHeadIndex: 0,
              segmentPosition: '0',
              errorID: '',
              message: 'Transaction Set in Header & Trailer Do Not Match',
            }
            errorList.push(error)
          }
          const po: any = {
            partyGroupCode,
            update: true,
            edi: true,
            poOrder: _.get(ST, 'transactionSetControlNumber'),
            errors: errorList,
            isChange: _.get(ST, 'BCH.transactionSetPurpose') === 'Change',
            purpose: _.get(ST, 'BCH.transactionSetPurpose'),
            poNo: _.get(ST, 'BCH.purchaseOrderNumber'),
            poDate: _.get(ST, 'BCH.purchaseOrderDate')
              ? moment.utc(_.get(ST, 'BCH.purchaseOrderDate')).toDate()
              : null,
            dontShipBeforeDate: _.get(ST, 'DTM.startShip')
              ? moment.utc(_.get(ST, 'DTM.startShip')).toDate()
              : null,
            dontShipAfterDate: _.get(ST, 'DTM.lastShip')
              ? moment.utc(_.get(ST, 'DTM.lastShip')).toDate()
              : null,
            exitFactoryDateActual: _.get(ST, 'DTM.firstArrive')
              ? moment.utc(_.get(ST, 'DTM.firstArrive')).toDate()
              : _.get(ST, 'DTM.startShip')
              ? moment.utc(_.get(ST, 'DTM.startShip')).toDate()
              : null,
            consigneeId: _.get(ST, 'REF.DeptNumber'),
            venderId: _.get(ST, 'REF.Vender'),
            divisionId: _.get(ST, 'REF.DivisionID')
          }
          const poc = _.get(ST, 'POC', []) || []
          if (poc.length) {
            const poItemList: any[] = []
            for (const POC of poc) {
              let sln = _.get(POC, 'SLN')
              if (!_.get(POC, 'SLN').length)
              {
                sln = [sln]
              }
              const packInfoList = []
              for (const SLN of sln)
              {
                const packInfo: any = {
                  subLine: _.get(SLN, 'assignedIdentification'),
                  unitPrice: _.get(SLN, 'unitPrice'),
                  size: (_.get(SLN, 'productId2') || ''),
                  quantity: _.get(SLN, 'quantity'),
                  quantityUnit: _.get(SLN, 'unitOfMeasureCode'),
                }
                packInfoList.push(packInfo)
              }
              const poItem: any = {
                perPackageQuantity: _.get(POC, 'PO4.pack'),
                addItem: _.get(POC, 'lineItemChange') === 'Add Item',
                priceChange: _.get(POC, 'lineItemChange') === 'Price Change',
                changesLineItems: _.get(POC, 'lineItemChange') === 'Changes to line items',
                deleteItem: _.get(POC, 'lineItemChange') === 'Delete Item',
                isQuantityChange: _.get(POC, 'lineItemChange') === 'Quantity Increase' || _.get(POC, 'lineItemChange') === 'Quantity Decrease',
                // quantity: _.get(POC, 'quantityOrdered'),
                quantityUnit: _.get(POC, 'unitOfMeasureCode'),
                quantityChange: _.get(POC, 'quantityChange'),
                volume: _.get(POC, 'PO4.grossVolumePerPack'),
                // htsCode: _.get(POC, 'SLN.productId2'),
                product: {
                  poLineNo: _.get(POC, 'assignedIdentification'),
                  // subLine: _.get(POC, 'SLN.assignedIdentification'),
                  // unitPrice: _.get(POC, 'SLN.unitPrice'),
                  priceUnit: _.get(POC, 'basisOfUnitPriceCode'),
                  upcen: _.get(POC, 'productId1').trim(),
                  // size: (_.get(POC, 'SLN.productId2') || ''),
                  colorDesc: _.get(POC, 'productId4'),
                  pack: _.get(POC, 'assignedIdentification'),
                  buyerSKU: _.get(POC, 'productId3'),
                  style: _.get(POC, 'productId5'),
                  price: _.get(POC, 'productId6'),
                },
                packInfo : packInfoList,
              }
              if (_.get(POC, 'lineItemChange') === 'Add Item')
              {
                poItem['quantity'] = _.get(POC, 'quantityOrdered') ||  _.get(POC, 'quantityChange')
              }
              if (_.get(POC, 'lineItemChange') === 'Quantity Increase' || _.get(POC, 'lineItemChange') === 'Quantity Decrease')
              {
                if (_.get(POC, 'lineItemChange') === 'Quantity Increase')
                {
                  poItem['quantityChangeSign'] = '+'
                }
                else if (_.get(POC, 'lineItemChange') === 'Quantity Decrease')
                {
                  poItem['quantityChangeSign'] = '-'
                }
              }
              if (_.get(POC, 'CTP'))
              {
                poItem['product']['unitPrice'] =  _.get(POC, 'CTP.unitPrice')
              }
              let n9s = _.get(POC, 'N9', []) || []
              if (n9s && !n9s.length)
              {
                n9s = [n9s]
              }
              if (n9s.length)
              {
                for (const n9 of n9s)
                {
                  poItem[_.get(n9, 'referenceNumberQual')] = _.get(n9, 'referenceNumber')
                }
              }
              poItemList.push(poItem)
            }
            if (poItemList.length) {
              _.set(po, 'purchaseOrderItems', poItemList)
            }
          }
          let n1s = _.get(ST, 'N1', []) || []
          if (n1s && !n1s.length)
          {
            n1s = [n1s]
          }
          if (n1s.length) {
            const partyMapper = {
              'Ship From': 'shipper',
              'Ship To': 'shipTo',
            }
            for (const N1 of n1s) {
              const role = _.get(N1, 'organizationIdentifier')
              if (partyMapper[role]) {
                const newRole = partyMapper[role]
                if (newRole === 'shipper') {
                  _.set(po, `${newRole}PartyCode`, _.get(N1, 'identificationCode'))
                  _.set(po, `${newRole}PartyName`, _.get(N1, 'name'))
                }
                if (newRole === 'shipTo') {
                  const index = (_.get(N1, 'name') || '').indexOf('#')
                  _.set(
                    po,
                    `${newRole}PartyCode`,
                    `${(_.get(N1, 'name') || '').substr(index + 1)} ${_.get(
                      N1,
                      'identificationCode'
                    ).substr(0, 9)}`.trim()
                  )
                  _.set(
                    po,
                    `${newRole}PartyName`,
                    (_.get(N1, 'name') || '').substr(0, index) || _.get(N1, 'name')
                  )
                }
                _.set(po, `${newRole}AdditionalName1`, _.get(N1, 'N2.additionalNameInformation1'))
                _.set(po, `${newRole}AdditionalName2`, _.get(N1, 'N2.additionalNameInformation2'))
                _.set(po, `${newRole}PartyAddress1`, _.get(N1, 'N3.addressInformation'))
                _.set(po, `${newRole}PartyAddress2`, _.get(N1, 'N3.additionalAddressInformation'))
                _.set(po, `${newRole}PartyStateCode`, _.get(N1, 'N4.stateOrProvinceCode'))
                _.set(po, `${newRole}PartyCountryCode`, _.get(N1, 'N4.countryCode'))
                _.set(po, `${newRole}PartyStateZip`, _.get(N1, 'N4.postalCode'))
              } else {
                _.set(po, `${role.replace(/\s/g, '')}PartyName`, _.get(N1, 'name'))
                _.set(po, `${role.replace(/\s/g, '')}PartyCode`, _.get(N1, 'identificationCode'))
                _.set(po, `${role.replace(/\s/g, '')}AdditionalName1`, _.get(N1, 'N2.additionalNameInformation1'))
                _.set(po, `${role.replace(/\s/g, '')}AdditionalName2`, _.get(N1, 'N2.additionalNameInformation2'))
                _.set(
                  po,
                  `${role.replace(/\s/g, '')}PartyAddress1`,
                  _.get(N1, 'N3.addressInformation')
                )
                _.set(
                  po,
                  `${role.replace(/\s/g, '')}PartyAddress2`,
                  _.get(N1, 'N3.additionalAddressInformation')
                )
                _.set(
                  po,
                  `${role.replace(/\s/g, '')}PartyStateCode`,
                  _.get(N1, 'N4.stateOrProvinceCode')
                )
                _.set(po, `${role.replace(/\s/g, '')}PartyCountryCode`, _.get(N1, 'N4.countryCode'))
                _.set(po, `${role.replace(/\s/g, '')}PartyStateZip`, _.get(N1, 'N4.postalCode'))
              }
            }
          }
          if (_.get(jsonData, 'ISA.createdDate') && _.get(jsonData, 'ISA.createdTime')) {
            const datetime = moment.utc(
              `${_.get(jsonData, 'ISA.createdDate')} ${_.get(jsonData, 'ISA.createdTime')}`
            )
            _.set(po, 'ediCreatedDateActual', datetime)
          }
          if (
            _.get(jsonData, 'GS.dataInterchangeDate') &&
            _.get(jsonData, 'GS.dataInterchangeTime')
          ) {
            const datetime = moment.utc(
              `${_.get(jsonData, 'GS.dataInterchangeDate')} ${_.get(
                jsonData,
                'GS.dataInterchangeTime'
              )}`
            )
            _.set(po, 'dataInterchangeDateActual', datetime)
          }
          if (_.get(ST, 'promoStart')) {
            _.set(po, 'promoStart', moment.utc(_.get(ST, 'DTM.promoStart')))
          }
          if (_.get(ST, 'DTM.lastArrive')) {
            _.set(po, 'lastArrive', moment.utc(_.get(ST, 'DTM.lastArrive')))
          }

          holeEdi.poList.push(po)
        }
      }
    }

    // return errorList
    return holeEdi
  }
  async export(entityJSON: any): Promise<any> {
    const result = await super.export(entityJSON)
    return result
  }
}
