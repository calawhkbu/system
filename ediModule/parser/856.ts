
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
import { EdiSchedulerConfig, EdiFormatJson } from 'modules/edi/interface'

const moment = require('moment')

export const formatJson = {

removeCharacter: [],
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

      }
    ]
  }

} as EdiFormatJson

export const schedulerConfig = {

    active: true,
    schedule: '0 * * ? * *',
    ediFile: {
      path: '/home/ec2-user/ftptest/',
      extensions: ['edi', 'txt'],
      storageConfig: {
  
        handlerName : 'sftp',
        config: {
  
            os : 'linux',
  
            host: '13.229.70.248',
            port: '22',
            username: 'ec2-user',
  
            privateKey : `privateKey`
          }
      }
    },
    // the oubound name after parsing the edi
    outbound : 'someOutbound'
  
  } as EdiSchedulerConfig
  
export default class EdiParser856 extends BaseEdiParser {
  constructor(
    protected readonly partyGroupCode: string,
    protected readonly type: string,
    protected readonly formatJson: any,
    protected readonly allService: any
  ) {
    super(partyGroupCode, type, formatJson, allService)
  }
  async import(base64EdiString: string): Promise<any> {
    console.log(`import type  : ${this.type}`)
    const response = super.import(base64EdiString)

        // const products = []

        // const ediJson = response['jsonData']

        // // hardcode
        // const user = { username : 'ediImport' , selectedPartyGroup : { code : partyGroupCode } } as JwtPayload

        // const poList = [] as PurchaseOrder[]
        // for (const ST of ediJson['ST']) {
        //   const po: PurchaseOrder = {
        //     flexData: {
        //       data: {},
        //     },
        //   } as PurchaseOrder

        //   const poItemList = [] as PurchaseOrderItem[]

        //   const missingDateName1 = 'ediCreated'
        //   po.flexData.data[missingDateName1 + 'DateEstimated'] = null
        //   console.log(
        //     `Time: ${moment(ediJson['ISA']['createdDate'] + ' ' + ediJson['ISA']['createdTime'])}`
        //   )
        //   po.flexData.data[missingDateName1 + 'DateActual'] = moment(
        //     ediJson['ISA']['createdDate'] + ' ' + ediJson['ISA']['createdTime']
        //   )

        //   const missingDateName2 = 'dataInterchange'
        //   po.flexData.data[missingDateName2 + 'DateEstimated'] = null
        //   po.flexData.data[missingDateName2 + 'DateActual'] = moment(
        //     ediJson['ISA']['createdDate'] + ' ' + ediJson['ISA']['createdTime']
        //   )

        //   po.poNo = ST['BEG']['purchaseOrderNumber']
        //   po.poDate = moment(ST['BEG']['purchaseOrderDate']).toDate()
        //   po.dontShipBeforeDate = moment(ST['DTM']['doNotShipBefore']).toDate()
        //   po.dontShipAfterDate = moment(ST['DTM']['doNotDeliverAfter']).toDate()
        //   po.exitFactoryDateActual = moment(
        //     ST['DTM']['requestedShipDateFromSupplierWarehouse']
        //   ).toDate()

        //   // console.log("Value:"+ST['N1'][i]['organizationIdentifier'])
        //   // console.log(`True or False: ${ST['N1'][i]['organizationIdentifier']==='Ship from'}`)
        //   // console.log(`Length ${ST['N1'].length}`)

        //   for (const N1 of ST['N1']) {
        //     // console.log("Value:"+N1['organizationIdentifier'])

        //     let name
        //     const city = await (this.allService.LocationService as LocationService).findOne(
        //       {
        //         where: {
        //           name: N1['N4']['cityName'],
        //         },
        //       },
        //       user
        //     )

        //     if (N1['organizationIdentifier'] === 'Ship From') {
        //       name = 'shipper'
        //     } else if (N1['organizationIdentifier'] === 'Ship To') {
        //       name = 'shipTo'
        //     } else {
        //       name = N1['organizationIdentifier']
        //       po.flexData.data[name + 'PartyCode'] = N1['identificationCode']
        //       po.flexData.data[name + 'PartyName'] = N1['name']
        //       po.flexData.data[name + 'PartyAddress'] =
        //         N1['N3']['addressInformation'] + ' ' + N1['N3']['additionalAddressInformation']
        //       if (typeof city !== 'undefined') {
        //         po.flexData.data[name + 'PartyCityCode'] = city.locationCode
        //       }
        //       po.flexData.data[name + 'PartyStateCode'] = N1['N4']['stateOrProvinceCode']
        //       po.flexData.data[name + 'PartyZip'] = N1['N4']['postalCode']
        //       po.flexData.data[name + 'PartyCountryCode'] = N1['N4']['countryCode']
        //       po.flexData.data['moreParty'] = []
        //       po.flexData.data['moreParty'].push(name)
        //       continue
        //     }

        //     po[name + 'PartyCode'] = N1['identificationCode']
        //     po[name + 'PartyName'] = N1['name']
        //     po[name + 'PartyAddress'] =
        //       N1['N3']['addressInformation'] + ' ' + N1['N3']['additionalAddressInformation']
        //     if (typeof city !== 'undefined') {
        //       po[name + 'PartyCityCode'] = city.locationCode
        //     }
        //     po[name + 'PartyStateCode'] = N1['N4']['stateOrProvinceCode']
        //     po[name + 'PartyZip'] = N1['N4']['postalCode']
        //     po[name + 'PartyCountryCode'] = N1['N4']['countryCode']
        //   }
        //   po.flexData.data['moreDate'] = []
        //   po.flexData.data['moreDate'].push(missingDateName1)
        //   po.flexData.data['moreDate'].push(missingDateName2)

        //   for (const PO1 of ST['PO1']) // k<ST['PO1'].length
        //   {
        //     const poItem = {} as PurchaseOrderItem
        //     const ProductDefinitionField1 = {} as ProductDefinitionField
        //     const ProductDefinitionField2 = {} as ProductDefinitionField
        //     // console.log(`check product code ${PO1['productId'].substr(3,11)}`)
        //     let product = products.find(
        //       product => product.productCode === PO1['productId'].substr(3, 12).trim()
        //     )

        //     // console.log(`producttype: ${typeof product}`)

        //     if (!product) {
        //       product = await (this.allService.ProductDbService as ProductDbService).findOne(
        //         {
        //           where: {
        //             productCode: PO1['productId'].substr(3, 12).trim(),
        //           },
        //         },
        //         user
        //       )
        //       // console.log(`check product type ${typeof product}`)
        //       if (!product) {
        //         product = {} as Product
        //         product.productCode = PO1['productId'].substr(3, 11)
        //         const descriptionName = PO1['PID'][0]['description']
        //         // console.log(`Description: ${descriptionName}`)
        //         const nameIndex = descriptionName.indexOf(' ')
        //         product.name = descriptionName.substr(0, nameIndex)
        //         ProductDefinitionField1.fieldName = 'colour'
        //         ProductDefinitionField1.type = 'string'
        //         ProductDefinitionField1.values = PO1['productId'].substr(15, 3)
        //         // console.log(`ProductDefinitionField: ${ProductDefinitionField1.values}`)
        //         // console.log(`Type: ${typeof product.definition}`)

        //         product.definition = []
        //         product.definition.push(ProductDefinitionField1)

        //         ProductDefinitionField2.fieldName = 'material'
        //         ProductDefinitionField2.type = 'string'
        //         ProductDefinitionField2.values = PO1['productId'].substr(18, 6)
        //         // console.log(`ProductDefinitionField: ${ProductDefinitionField2.values}`)
        //         product.definition.push(ProductDefinitionField2)
        //       } else {
        //         products.push(product)
        //       }
        //     }

        //     poItem.quantity = PO1['quantityOrdered']
        //     poItem.quantityUnit = PO1['unitOfMeasureCode']
        //     poItem.htsCode = PO1['SLN']['productId2']

        //     poItem.product = product
        //     poItemList.push(poItem)
        //   }

        //   po.purchaseOrderItems = poItemList

        //   poList.push(po)
        // }
    return response
  }
  async export(entityJSON: any): Promise<any> {
    console.log(`export type  : ${this.type}`)
    const result = await super.export(entityJSON)
    return result
  }

}
