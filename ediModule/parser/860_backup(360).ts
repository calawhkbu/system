import { BaseEdiParser } from 'modules/edi/baseEdiParser'
import { CodeMasterService } from 'modules/sequelize/codeMaster/service'
import { ProductDbService } from 'modules/sequelize/product/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'
import { SwivelConfigService } from 'modules/swivel-config/service'
import { PurchaseOrder } from 'models/main/purchaseOrder'
import { PurchaseOrderItem } from 'models/main/purchaseOrderItem'
import { LocationService } from 'modules/sequelize/location/service'
import { ProductDefinitionField, Product } from 'models/main/product'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { EdiSchedulerConfig, EdiFormatJson } from 'modules/edi/service'
import { PurchaseOrderService } from 'modules/sequelize/purchaseOrder/service'
import { FlexData } from 'models/main/flexData'

const moment = require('moment')
const _ = require('lodash')

export const formatJson = {
  removeCharacter: ['\n', '\r', '\r\n', ''],
  segmentSeperator : ['?'],
  elementSeperator : [''],

  rootSegmentFormat : {
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
            name: 'Authorization Info Qualifier',
            key: 'authorizationInfoQualifier',
            type: 'string'
          },
          {
            index: 2,
            name: 'Authorization Information',
            key: 'authorizationInformation',
            type: 'string'
          },
          {
            index: 3,
            name: 'Security Info Qualifier ',
            key: 'securityInfoQualifier ',
            type: 'string'
          },
          {
            index: 4,
            name: 'Security Information',
            key: 'securityInformation',
            type: 'string'
          },
          {
            index: 5,
            name: 'Interchange Sender ID QL',
            key: 'interchangeSenderIdQl',
            type: 'string'
          },
          {
            index: 6,
            name: 'Interchange Sender ID',
            key: 'interchangeSenderId',
            type: 'string'
          },
          {
            index: 7,
            name: 'Interchange Receiver QL',
            key: 'interchangeReceiverQl',
            type: 'string'
          },
          {
            index: 8,
            name: 'Interchange Receiver ID',
            key: 'interchangeReceiverId',
            type: 'string',
            allowableValues: {
              valueOptions: [
                {
                  value: '6112390050',
                  name: 'GXS',
                  overrideValue: 'GXS'
                },
                {
                  value: '6112391050',
                  name: 'Inovis',
                  overrideValue: 'Inovis'
                },
                {
                  value: '6112392050',
                  name: 'InterTrade',
                  overrideValue: 'InterTrade'
                }
              ],
              allowAny: true
            }
          },
          {
            index: 9,
            name: 'Created Date',
            key: 'createdDate',
            type: 'date',
            format: 'yyMMdd'
          },
          {
            index: 10,
            name: 'Created Time',
            key: 'createdTime',
            type: 'time'
          },
          {
            index: 11,
            name: 'Interchange Standards ID',
            key: 'interchangeStandardsId',
            type: 'string'
          },
          {
            index: 12,
            name: 'Interchange Version ID',
            key: 'interchangeVersionId',
            type: 'string'
          },
          {
            index: 13,
            name: 'Interchange Control Number',
            key: 'interchangeControlNumber',
            type: 'string'
          },
          {
            index: 14,
            name: 'Acknowledgement Requested',
            key: 'acknowledgement Requested ',
            type: 'string'
          },
          {
            index: 15,
            name: 'Test Indicator',
            key: 'testIndicator',
            type: 'string',
            allowableValues: {
              valueOptions: [
                {
                  value: 'T',
                  name: 'Test',
                  overrideValue: 'Test'
                },
                {
                  value: 'P',
                  name: 'Prod',
                  overrideValue: 'Prod'
                }
              ],
              allowAny: true
            }
          },
          {
            index: 16,
            name: 'Sub Element Separator',
            key: 'subElementSeparator',
            type: 'string'
          }

        ]
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
            name: 'Functional ID',
            key: 'functionalId',
            type: 'string'
          },
          {
            index: 2,
            name: 'Application Sender ID',
            key: 'applicationSenderId',
            allowableValues: {
              valueOptions: [
                {
                  value: '6112390050',
                  name: 'GXS',
                  overrideValue: 'GXS'
                },
                {
                  value: '6112391050',
                  name: 'Inovis',
                  overrideValue: 'Inovis'
                },
                {
                  value: '6112392050',
                  name: 'InterTrade',
                  overrideValue: 'InterTrade'
                }
              ],
              allowAny: true
            },
            type: 'string'
          },
          {
            index: 3,
            name: 'Application Receiver ID',
            key: 'applicationReceiverId',
            type: 'string'
          },
          {
            index: 4,
            name: 'Data Interchange Date',
            key: 'dataInterchangeDate',
            type: 'date',
            Format: 'yyyyMMdd'
          },
          {
            index: 5,
            name: 'Data Interchange Time',
            key: 'dataInterchangeTime',
            type: 'time'
          },
          {
            index: 6,
            name: 'Data Interchange Control Number',
            key: 'dataInterchangeControlNumber',
            type: 'string'
          },
          {
            index: 7,
            name: 'Responsible Agency Code',
            key: 'responsibleAgencyCode',
            type: 'string'
          },
          {
            index: 8,
            name: 'Version ID',
            key: 'versionId',
            type: 'string'
          }

        ]

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
            name: 'Transaction Set Identifier Code',
            key: 'transactionSetIdentifierCode',
            type: 'string'
          },

          {
            index: 2,
            name: 'Transaction Set Control Number',
            key: 'transactionSetControlNumber',
            type: 'string'
          }

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
                name: 'Transaction Set Purpose',
                key: 'transactionSetPurpose',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '01',
                      name: 'Cancellation',
                      overrideValue: 'Cancellation'
                    },
                    {
                      value: '04',
                      name: 'Change',
                      overrideValue: 'Change'
                    }
                  ],
                  allowAny: true
                },
                type: 'string'
              },

              {
                index: 2,
                name: 'Purchase Order Type',
                key: 'purchaseOrderType',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'SA',
                      name: 'Stand-alone',
                      overrideValue: 'Stand-alone'
                    }
                  ],
                  allowAny: true
                },
                type: 'string'
              },

              {
                index: 3,
                name: 'Purchase Order Number',
                key: 'purchaseOrderNumber',
                type: 'string'
              },
              {
                index: 6,
                name: 'Purchase Order Date',
                key: 'purchaseOrderDate',
                type: 'date',
                format: 'yyyyMMdd'
              },
              {
                index: 11,
                name: 'Po Change Request Date',
                key: 'poChangeRequestDate',
                type: 'date',
                format: 'yyyyMMdd'
              }
            ]
          },
          {
            code: 'DTM',
            key: 'DTM',
            type: 'repeatObject',
            name: ' Data Element Separator (DES)',
            mandatory: false,
            elementFormatList: [
              {
                index : 1,
                name: 'Date/Time Qualifier',
                key: 'date/TimeQualifier',
                overrideValueIndex: 2,
                allowableValues: {
                  valueOptions: [
                    {
                      value: '037',
                      name: 'Start Ship',
                      overrideKey: 'startShip'
                    },
                    {
                      value: '038',
                      name: 'Last Ship',
                      overrideKey: 'lastShip'
                    }
                  ],
                  allowAny: true
                },
                type: 'string'
              },
              {
                index: 2,
                name: 'Date',
                key: 'Date',
                type: 'date',
                format: 'yyyyMMdd'
              }
            ]
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
                name: 'Organization Identifier ',
                key: 'organizationIdentifier',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'ST',
                      name: 'Ship to',
                      overrideValue: 'Ship To'
                    },
                    {
                      value: 'VN',
                      name: 'vendor',
                      overrideValue: 'Vendor'
                    },
                    {
                      value: 'SU',
                      name: 'Factory (Supplier)',
                      overrideValue: 'Factory (Supplier)'
                    }

                  ],
                  allowAny: true
                },
                type: 'string'
              },
              {
                index : 2,
                name: 'Organization Name ',
                key: 'organizationName',
                type: 'string'
              },
              {
                index : 3,
                name: 'Identification Code Qualifier',
                key: 'IdCodeQualifier',
                mandatory: false,
                allowableValues: {
                  valueOptions: [
                    {
                      value: '92',
                      name: 'Assigned by buyer',
                      overrideValue: 'Assigned By Buyer'
                    }
                  ],
                  allowAny: true
                },
                type: 'string'
              },
              {

                index : 4,
                name: 'Identification Code',
                key: 'identificationCode',
                type: 'string'
              }
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
                    name: 'Additional Name Information',
                    key: 'additionalNameInformation',
                    type: 'string'
                  },
                  {
                    index: 2,
                    name: 'Additional Name Information',
                    key: 'additional Name Information',
                    type: 'string'
                  }
                ]
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
                    name: 'Address Information',
                    key: 'addressInformation',
                    type: 'string'
                  },
                  {
                    index: 2,
                    name: 'Additional Address Information',
                    key: 'additionalAddressInformation',
                    type: 'string'
                  }
                ]
              },

              {
                code: 'N4',
                key: 'N4',
                type: 'object',
                mandatory: false,
                elementFormatList: [
                  {
                    index: 1,
                    name: 'City Name',
                    key: 'cityName',
                    type: 'string'
                  },
                  {
                    index: 2,
                    name: 'State Or Province Code',
                    key: 'stateOrProvinceCode',
                    type: 'string'
                  },
                  {
                    index: 3,
                    name: 'Postal Code',
                    key: 'postalCode',
                    type: 'string'
                  },
                  {
                    index: 4,
                    name: 'Country Code',
                    key: 'countryCode',
                    type: 'string'
                  }
                ]
              }
            ]
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
                name: 'Assigned Identification',
                key: 'assignedIdentification',
                type: 'string'
              },
              {
                index: 2,
                name: 'Line Item Change',
                key: 'lineItemChange',
                allowableValues: {
                  valueOptions: [
                    {
                    value: 'QI',
                    name: 'Quantity Increase',
                    overrideValue: 'Quantity Increase'
                    },
                    {
                      value: 'QD',
                      name: 'Quantity Decrease',
                      overrideValue: 'Quantity Decrease'
                    },
                    {
                      value: 'AI',
                      name: 'Add Item',
                      overrideValue: 'Add Item'
                    },
                    {
                      value: 'DI',
                      name: 'Delete Item',
                      overrideValue: 'Delete Item'
                    },
                    {
                      value: 'PC',
                      name: 'Price Change',
                      overrideValue: 'Price Change'
                    },
                    {
                      value: 'CA',
                      name: 'Changes to line items',
                      overrideValue: 'Changes to line items'
                    }

                  ],
                  allowAny: true
                },
                type: 'string'
              },
              {
                index: 3,
                name: 'Quantity Ordered',
                key: 'quantityOrdered',
                type: 'integer'
              },
              {
                index: 4,
                name: 'Quantity Change',
                key: 'quantityChange',
                type: 'integer'
              },
              {
                index: 5,
                name: 'Unit of Measure Code',
                key: 'unitOfMeasureCode',
                type: 'string'
              },
              {
                index: 6,
                name: 'Unit Price',
                key: 'unitPrice',
                type: 'decimal'
              },
              {
                index: 7,
                name: 'Basis of unit Price Code',
                key: 'basisOfUnitPriceCode',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'WE',
                      name: 'Wholesale/Each',
                      overrideValue: 'Wholesale/Each'
                    },
                    {
                      value: 'RE',
                      name: 'Retail/Each',
                      overrideValue: 'Retail/Each'
                    }
                  ],
                  allowAny: true
                },
                type: 'string'
              },
              {
                index: 8,
                name: 'Product ID Qualifier1',
                key: 'productIdQualifier1',
                type: 'string'
              },
              {
                index: 9,
                name: 'Product ID1',
                key: 'productId1',
                type: 'string'
              },
              {
                index: 10,
                name: 'Product ID Qualifier2',
                key: 'ProductIdQualifier2',
                type: 'string'
              },
              {
                index: 11,
                name: 'Product ID2',
                key: 'ProductId2',
                type: 'string'
              },
              {
                index: 12,
                name: 'Product ID Qualifier3',
                key: 'ProductIdQualifier3',
                type: 'string'
              },
              {
                index: 13,
                name: 'Product ID3',
                key: 'ProductId3',
                type: 'string'
              },
              {
                index: 14,
                name: 'Product ID Qualifier4',
                key: 'ProductIdQualifier4',
                type: 'string'
              },
              {
                index: 15,
                name: 'Product ID4',
                key: 'ProductId4',
                type: 'string'
              },
              {
                index: 16,
                name: 'Product ID Qualifier5',
                key: 'ProductIdQualifier5',
                type: 'string'
              },
              {
                index: 17,
                name: 'Product ID5',
                key: 'ProductId5',
                type: 'string'
              },
              {
                index: 18,
                name: 'Product ID Qualifier6',
                key: 'ProductIdQualifier6',
                type: 'string'
              },
              {
                index: 19,
                name: 'Product ID6',
                key: 'ProductId6',
                type: 'string'
              },
              {
                index: 20,
                name: 'Product ID Qualifier7',
                key: 'ProductIdQualifier7',
                type: 'string'
              },
              {
                index: 21,
                name: 'Product ID7',
                key: 'ProductId7',
                type: 'string'
              }

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
                    name: 'Class of Trade',
                    key: 'classOfTrade',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'RS',
                          name: 'Resale',
                          overrideValue: 'Resale'
                        }
                      ],
                      allowAny: true
                    },
                    type: 'string'
                  },
                  {
                    index: 2,
                    name: 'Price Code Qualifier',
                    key: 'priceCodeQualifier',
                    allowableValues: {
                      valueOptions: [
                        {
                          value: 'UCP',
                          name: 'Cost',
                          overrideValue: 'Cost'
                        },
                        {
                          value: 'RTL',
                          name: 'Resale Price',
                          overrideValue: 'Resale Price'
                        }
                      ],
                      allowAny: true
                    },
                    type: 'string'
                  },
                  {
                    index: 3,
                    name: 'Unit Price',
                    key: 'UnitPrice',
                    type: 'decimal'
                  }

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
                  name: 'Item Description Type',
                  key: 'itemDescriptionType',
                  allowableValues: {
                  valueOptions: [
                    {
                      value: 'F',
                      name: 'Freeform',
                      overrideValue: 'Freeform'
                    }
                  ],
                  allowAny: true
                },
                  type: 'string'
                },
                {
                  index: 2,
                  name: 'Product Characteristic Code',
                  key: 'productCharacteristicCode',
                  allowableValues: {
                  valueOptions: [
                    {
                      value: '08',
                      name: 'Product',
                      overrideValue: 'Product'
                    }
                  ],
                  allowAny: true
                },
                  type: 'string'
                },
                {
                  index: 5,
                  name: 'Description',
                  key: 'description',
                  type: 'string'
                }
                ]
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
                      name: 'Pack',
                      key: 'pack',
                      type: 'integer'
                    },
                    {
                      index: 2,
                      name: 'Size',
                      key: 'size',
                      type: 'integer'
                    },
                    {
                      index: 3,
                      name: 'Unit of Measure Code',
                      key: 'unitOfMeasureCode1',
                      allowableValues: {
                        valueOptions: [
                          {
                            value: 'EA',
                            name: 'Each (Unit)',
                            overrideValue: 'Each (Unit)'
                          }
                        ],
                        allowAny: true
                      },
                      type: 'string'
                    },
                    {
                      index: 4,
                      name: 'Packing Code',
                      key: 'packingCode',
                      type: 'string'
                    },
                    {
                      index: 8,
                      name: 'Gross Volume per Pack',
                      key: 'grossVolumePerPack',
                      type: 'integer'
                    },
                    {
                      index: 9,
                      name: 'Unit of Measure Code',
                      key: 'unitOfMeasureCode2',
                      allowableValues: {
                        valueOptions: [
                          {
                            value: 'EA',
                            name: 'EA'
                          }
                        ],
                        allowAny: true
                      },
                      type: 'string'
                    },
                    {
                      index: 14,
                      name: 'Inner Pack',
                      key: 'innerPack',
                      type: 'string'
                    },
                    {
                      index: 15,
                      name: 'Surface/Layer/Position Code',
                      key: 'surface/Layer/PositionCode',
                      allowableValues: {
                        valueOptions: [
                          {
                            value: 'AL',
                            name: 'All',
                            overrideValue: 'All'
                          }
                        ],
                        allowAny: true
                      },
                      type: 'string'
                    },
                    {
                      index: 18,
                      name: 'Number',
                      key: 'number',
                      type: 'integer'
                    }
                  ]
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
                  name: 'Assigned Identification',
                  key: 'assignedIdentification',
                  type: 'string'
                },
                {
                  index: 3,
                  name: 'Relationship Code',
                  key: 'relationshipCode',
                  allowableValues: {
                    valueOptions: [
                      {
                        value: 'I',
                        name: 'Included',
                        overrideValue: 'Included'
                      }
                    ],
                    allowAny: true
                  },
                  type: 'string'
                },
                {
                  index: 4,
                  name: 'Quantity',
                  key: 'quantity',
                  type: 'integer'
                },
                {
                  index: 5,
                  name: 'Unit of Measure Code',
                  key: 'unitOfMeasureCode',
                  allowableValues: {
                    valueOptions: [
                      {
                        value: 'EA',
                        name: 'Each',
                        overrideValue: 'Each'
                      }
                    ],
                    allowAny: true
                  },
                  type: 'string'
                },
                {
                  index: 6,
                  name: 'Unit Price',
                  key: 'unitPrice',
                  type: 'decimal'
                },
                {
                  index: 7,
                  name: 'Basis of Unit Price',
                  key: 'basisOfUnitPrice',
                  allowableValues: {
                    valueOptions: [
                      {
                        value: 'WE',
                        name: 'Wholesale/Each',
                        overrideValue: 'Wholesale/Each'
                      },
                      {
                        value: 'RE',
                        name: 'Retail/Each',
                        overrideValue: 'Retail/Each'
                      }
                    ],
                    allowAny: true
                  },
                  type: 'string'
                },
                {
                  index: 9,
                  name: 'Product ID Qualifier',
                  key: 'productIdQualifier1',
                  type: 'string'
                },
                {
                  index: 10,
                  name: 'Product ID',
                  key: 'productId1',
                  type: 'string'
                },
                {
                  index: 11,
                  name: 'Product ID Qualifier',
                  key: 'productIdQualifier2',
                  type: 'string'
                },
                {
                  index: 12,
                  name: 'Product ID',
                  key: 'productId2',
                  type: 'string'
                },
                {
                  index: 13,
                  name: 'Product ID Qualifier',
                  key: 'productIdQualifier3',
                  allowableValues: {
                    valueOptions: [
                      {
                        value: 'JP',
                        name: 'JP'
                      }
                    ],
                    allowAny: true
                  },
                  type: 'string'
                },
                {
                  index: 14,
                  name: 'Product/Service ID ',
                  key: 'productId3',
                  type: 'string'
                }
              ]
              },
            ]
          },
          {
            code: 'SDQ',
            key: 'SDQ',
            name: 'Destination/Quantity Data',
            mandatory: false,
            elementFormatList: [
              {
                index: 1,
                name: 'Unit of Measurement Code',
                key: 'unitOfMeasurementCode',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'EA',
                      name: 'Each',
                      overrideValue: 'Each'
                    },
                    {
                      value: 'CA',
                      name: 'Prepack',
                      overrideValue: 'Prepack'
                    }
                  ],
                  allowAny: true
                },
                type: 'string'
              },
              {
                index: 2,
                name: 'Location Qualifier',
                key: 'locationQualifier',
                allowableValues: {
                  valueOptions: [
                    {
                      value: '92',
                      name: 'Pack by Store',
                      overrideValue: 'Pack by Store'
                    }
                  ],
                  allowAny: true
                },
                type: 'string'
              },
              {
                index: 3,
                name: 'Location Identifier',
                key: 'locationIdentifier',
                type: 'string'
              },
              {
                index: 4,
                name: 'Quantity',
                key: 'Quantity',
                type: 'integer'
              }
            ]
          },
          {
            key: 'N9',
            code: 'N9',
            name: 'Reference Number',
            type: 'object',
            mandatory: false,
            elementFormatList: [
              {

                index: 1,
                name: 'Reference Number Qual',
                key: 'referenceNumberQual',
                allowableValues: {
                  valueOptions: [
                    {
                      value: 'DP',
                      name: 'Department',
                      overrideValue: 'Department'
                    },
                    {
                      value: 'MR',
                      name: 'MIC',
                      overrideValue: 'MIC'
                    },
                    {
                      value: 'BT',
                      name: 'Group Code',
                      overrideValue: 'Group Code'
                    },
                    {
                      value: 'JH',
                      name: 'Label Code',
                      overrideValue: 'Label Code'
                    },
                    {
                      value: 'OIC',
                      name: 'Label Type',
                      overrideValue: 'Label Type'
                    },
                    {
                      value: 'E9',
                      name: 'Hangtag Type',
                      overrideValue: 'Hangtag Type'
                    },
                    {
                      value: 'W9',
                      name: 'Special Packageing',
                      overrideValue: 'Special Packageing'
                    }

                  ],
                  allowAny: true
                },
                type: 'string'
              },
              {
                index: 2,
                name: 'Reference Number',
                key: 'referenceNumber',
                type: 'string'
              },
              {
                index: 3,
                name: 'Free-form Description',
                key: 'free-formDescription',
                type: 'string'
              }
            ]
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
                name: 'Number of Line Items',
                key: 'numberofLineItems',
                type: 'integer'
              }
            ]
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
                name: 'Number of Included Segments',
                key: 'numberofIncludedSegments',
                type: 'integer'
              },
              {
                index: 2,
                name: 'Transaction Set Control Num',
                key: 'transactionSetControlNum',
                type: 'string'
              }
            ]
          }

        ]
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
            name: 'Number of Included Transaction Sets ',
            key: 'numberOfIncludedTransactionSets ',
            type: 'integer'
          },
          {
            index: 2,
            name: 'Data Interchange Control Num',
            key: 'dataInterchangeControlNum',
            type: 'integer'
          }
        ]
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
            name: 'Number of Included Groups',
            key: 'numberofIncludedGroups',
            type: 'integer'
          },
          {

            index: 2,
            name: 'Interchange Control Number',
            key: 'interchangeControlNumber',
            type: 'string'
          }
        ]
      }

    ]

  }

} as EdiFormatJson

export const schedulerConfig = {

  active : true,

  schedule : '0 * * ? * *',

  // very important !!!!!! must use absolute path and end with slash
  searchPath : '/home/ec2-user/ftptest/',

  searchExtension : ['edi', 'txt'],

  // searchPath : 'C:\\home\\ec2-user\\ftptest\\',

  searchStorage : {

      handlerName : 'sftp',
      config: {

          os : 'linux',

          host: '13.229.70.248',
          port: '22',
          username: 'ec2-user',

          privateKey : `privateKey`
        }

  },

  // the oubound name after parsing the edi
  outbound : 'someOutbound'

} as EdiSchedulerConfig

export default class EdiParser850 extends BaseEdiParser {
  constructor(
    protected readonly partyGroupCode: string,
    protected readonly type: string,
    protected readonly formatJson: any,
    protected readonly allService: any
  ) {
    super(partyGroupCode, type, formatJson, allService)
  }
  async import(base64EdiString: string): Promise<any> {
    // console.log(`import type  : ${this.type}`)
      const response = await super.import(base64EdiString)

      const ediJson = response['jsonData']
      // hardcode
      const user = { username : 'ediImport' , selectedPartyGroup : { code : this.partyGroupCode } } as JwtPayload

      const poList = [] as PurchaseOrder[]

      const products = []

      // console.log(_.get(response, 'ST[0].BCH'))

      if (!ediJson)
      {
        return ediJson
      }

      if (ediJson['ST'] && Array.isArray(ediJson['ST']))
      {

        for (const ST of ediJson['ST']) {
          const po: PurchaseOrder = {
            flexData: {
              data: {},
            },
          } as PurchaseOrder

          const poItemList = [] as PurchaseOrderItem[]
          po.edi = true
          po.flexData.data['moreParty'] = []
          po.flexData.data['moreDate'] = []

          const missingDateName1 = 'ediCreated'
          const missingDateName2 = 'dataInterchange'
          if (_.get(ediJson, 'ISA.createdDate') && _.get(ediJson, 'ISA.createdTime'))
          {
            po.flexData.data[`${missingDateName1}DateEstimated`] = null
            po.flexData.data[`${missingDateName1}DateActual`] = moment.utc(
              `${_.get(ediJson, 'ISA.createdDate')} ${_.get(ediJson, 'ISA.createdTime')}`)

            po.flexData.data[`${missingDateName2}DateEstimated`] = null
            po.flexData.data[`${missingDateName2}DateActual`] = moment.utc(
              `${_.get(ediJson, 'ISA.createdDate')} ${_.get(ediJson, 'ISA.createdTime')}`)
          }
          po.flexData.data['moreDate'].push(missingDateName1)
          po.flexData.data['moreDate'].push(missingDateName2)
          po['purpose'] = _.get(ST, 'BCH.transactionSetPurpose')
          po['poNo'] = _.get(ST, 'BCH.purchaseOrderNumber')
          if (_.get(ST, 'BCH.purchaseOrderDate'))
          {
            po.poDate = moment.utc(_.get(ST, 'BCH.purchaseOrderDate')).toDate()
          }
          if (_.get(ST, 'BCH.poChangeRequestDate'))
          {
            po.flexData.data['changeRequestDate'] =  moment.utc(_.get(ST, 'BCH.poChangeRequestDate')).toDate()
            po.flexData.data['moreDate'].push('changeRequestDate')
          }
          if (_.get(ST, 'DTM.doNotShipBefore'))
          {
            po.dontShipBeforeDate = moment.utc(ST['DTM']['doNotShipBefore']).toDate()
          }
          if (_.get(ST, 'DTM.doNotDeliverAfter')){
            po.dontShipAfterDate = moment.utc(ST['DTM']['doNotDeliverAfter']).toDate()
          }
          if (_.get(ST, 'DTM.requestedShipDateFromSupplierWarehouse')){
            po.exitFactoryDateActual = moment.utc(_.get(ST, 'DTM.requestedShipDateFromSupplierWarehouse')).toDate()
          }

          // console.log("Value:"+ST['N1'][i]['organizationIdentifier'])
          // console.log(`True or False: ${ST['N1'][i]['organizationIdentifier']==='Ship from'}`)
          // console.log(`Length ${ST['N1'].length}`)
          if (Array.isArray(ST['N1']))
          {
            for (const N1 of ST['N1']) {
              // console.log("Value:"+N1['organizationIdentifier'])

              let name

              if (_.get(N1, 'organizationIdentifier') === 'Ship From') {
                name = 'shipper'
              } else if (_.get(N1, 'organizationIdentifier') === 'Ship To') {
                name = 'shipTo'
              } else {
                name = _.get(N1, 'organizationIdentifier')
                po.flexData.data[`${name}PartyCode`] = _.get(N1, 'identificationCode')
                po.flexData.data[`${name}PartyName`] = _.get(N1, 'name')
                po.flexData.data[`${name}PartyAddress`] =
                  `${_.get(N1, 'N3.addressInformation')} ${_.get(N1, 'N3.additionalAddressInformation')}`
                po.flexData.data[`${name}PartyCityCode`] = _.get(N1, 'N4.cityName')
                po.flexData.data[`${name}PartyStateCode`] = _.get(N1, 'N4.stateOrProvinceCode')
                po.flexData.data[`${name}PartyZip`] = _.get(N1, 'N4.postalCode')
                po.flexData.data[`${name}PartyCountryCode`] = _.get(N1, 'N4.countryCode')
                po.flexData.data['moreParty'].push(name)
                continue
              }

              po[`${name}  PartyCode`] = _.get(N1, 'identificationCode')
              po[`${name} PartyName`] = _.get(N1, 'name')
              po[`${name} PartyAddress`] =
                `${_.get(N1, 'N3.addressInformation')} ${_.get(N1, 'N3.additionalAddressInformation')}`
              po[`${name}PartyCityCode`] = _.get(N1, 'N4.cityName')
              po[`${name}PartyStateCode`] = _.get(N1, 'N4.stateOrProvinceCode')
              po[`${name}PartyZip`] = _.get(N1, 'N4.postalCode')
              po[`${name}PartyCountryCode`] = _.get(N1, 'N4.countryCode')
            }
          }
          if (Array.isArray(ST['POC']))
          {
            for (const POC of ST['POC'])
            {
              const poItem = {} as PurchaseOrderItem
              const ProductDefinitionField1 = {} as ProductDefinitionField
              ProductDefinitionField1.fieldName = 'colour'
              let product = products.find(
                product => product.productCode === _.get(POC['productId1'] || '')
              )
              if (!product) {
                product = await (this.allService.productDbService as ProductDbService).findOne(
                  {
                    where: {
                      productCode: POC['productId1']
                    },
                  },
                  user
                )
                // console.log(`check product type ${typeof product}`)
                if (!product) {
                  product = {} as Product
                  product.productCode = _.get(POC, 'productId1', '')
                  if (POC['PID'])
                  {
                    product.name = _.get(POC, 'PID.description', '').substr(0, 20).replace(/^[ ]+|[ ]+$/g, '')
                    ProductDefinitionField1.type = 'string'
                    ProductDefinitionField1.values = _.get(POC, 'ProductId4')
                    // console.log(`ProductDefinitionField: ${ProductDefinitionField1.values}`)
                    // console.log(`Type: ${typeof product.definition}`)

                    product.definition = []
                    product.definition.push(ProductDefinitionField1)
                  }
                } else {
                  products.push(product)
                }
              }

              poItem.itemKey = _.get(POC, 'assignedIdentification')
              poItem['change'] = _.get(POC, 'lineItemChange')
              poItem.quantity = _.get(POC, 'quantityOrdered')
              poItem.quantityUnit = _.get(POC, 'unitOfMeasureCode')
              poItem['quantityChange'] = _.get(POC, 'quantityChange')
              poItem.volume = _.get(POC, 'PO4.grossVolumePerPack')
              poItem.htsCode = _.get(POC, 'SLN.productId2')
              const flexData = {data: {}} as FlexData
              flexData.data[ProductDefinitionField1.fieldName] = (POC['productId1'] || '').substr(15, 3)
              poItem.product = product
              poItem.flexData = flexData
              poItemList.push(poItem)

            }
          }

          po.purchaseOrderItems = poItemList

          po.errors = response['errorList']

          poList.push(po)
        }
      }
    return poList
  }
  async export(entityJSON: any): Promise<any> {
    console.log(`export type  : ${this.type}`)
    const result = await super.export(entityJSON)
    return result
  }

}
