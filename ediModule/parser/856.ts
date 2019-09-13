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

      if (Array.isArray(ediJson['ST']))
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
              `${_.get(ediJson, 'ISA.createdDate')} ${_.get(ediJson, 'ISA.createdTime')}`
            )

            po.flexData.data[`${missingDateName2}DateEstimated`] = null
            po.flexData.data[`${missingDateName2}DateActual`] = moment.utc(
              `${_.get(ediJson, 'ISA.createdDate')} ${_.get(ediJson, 'ISA.createdTime')}`
          )
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
                po[`${name}PartyCode`] = _.get(N1, 'identificationCode')
                po[`${name}PartyName`] = _.get(N1, 'name')
              } else if (_.get(N1, 'organizationIdentifier') === 'Ship To') {
                name = 'shipTo'
                const index = _.get(N1, 'name').indexOf('#')
                if (index > 0)
                {
                  po[`${name}PartyCode`] = `${_.get(N1, 'name').substr(index + 1)} ${_.get(N1, 'identificationCode').substr(0, 9)}`
                  po[`${name}PartyName`] = _.get(N1, 'name').substr(0, index)
                }
                else
                {
                  po[`${name}PartyCode`] = _.get(N1, 'identificationCode').substr(0, 9)
                  po[`${name}PartyName`] = _.get(N1, 'name')
                }
              } else {
                name = _.get(N1, 'organizationIdentifier')
                po.flexData.data[`${name}PartyCode`] = _.get(N1, 'identificationCode')
                po.flexData.data[`${name}PartyName`] = _.get(N1, 'name')
                po.flexData.data[`${name}PartyAddress1`] =  _.get(N1, 'N3.addressInformation')
                po.flexData.data[`${name}PartyAddress1`] = _.get(N1, 'N3.additionalAddressInformation')
                po.flexData.data[`${name}PartyCityCode`] = _.get(N1, 'N4.cityName')
                po.flexData.data[`${name}PartyStateCode`] = _.get(N1, 'N4.stateOrProvinceCode')
                po.flexData.data[`${name}PartyZip`] = _.get(N1, 'N4.postalCode')
                po.flexData.data[`${name}PartyCountryCode`] = _.get(N1, 'N4.countryCode')
                po.flexData.data['moreParty'].push(name)
                continue
              }
              po[`${name} PartyAddress1`] = _.get(N1, 'N3.addressInformation')
              po[`${name} PartyAddress2`] = _.get(N1, 'N3.additionalAddressInformation')
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
              const product = {} as Product
                // console.log(`check product type ${typeof product}`)
              product['subLine'] = _.get(POC, 'SLN.assignedIdentification')
              product['poLineNo'] = null
              product['price'] = _.get(POC, 'unitPrice')
              product['priceUnit'] = _.get(POC, 'basisOfUnitPrice')
              product['sea'] = null
              product['style'] = null
              product['styleDesc'] = _.get(POC, 'PID.description', '').substr(0, 20).replace(/^[ ]+|[ ]+$/g, '')
              product['piece'] = null
              product['pieceDesc'] = _.get(POC, 'PID.description', '').substr(40, 20).replace(/^[ ]+|[ ]+$/g, '')
              product['color'] = null
              product['colorDesc'] =  _.get(POC, 'PID.description', '').substr(20, 20).replace(/^[ ]+|[ ]+$/g, '')
              product['pack'] = null
              product['packing'] = ''
              product['size'] = _.get(POC, 'SLN.productId3')
              product['upcen'] = _.get(POC, 'SLN.productId2')
              poItem.itemKey = _.get(POC, 'assignedIdentification')
              poItem['change'] = _.get(POC, 'lineItemChange')
              poItem['perPackageQuantity'] =  _.get(POC, 'PO4.pack')
              poItem.quantity = _.get(POC, 'quantityOrdered')
              poItem.quantityUnit = _.get(POC, 'unitOfMeasureCode')
              poItem['quantityChange'] = _.get(POC, 'quantityChange')
              poItem.volume = _.get(POC, 'PO4.grossVolumePerPack')
              poItem.htsCode = _.get(POC, 'SLN.productId2')
              poItem.product = product
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
    console.log(`export type  : ${entityJSON}`)
    console.log('=========================')
    const result = await super.export(entityJSON)

    console.log('.........................')
    return result
  }

}
