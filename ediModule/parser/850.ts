
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

const moment = require('moment')

export const formatJson = {

  segmentSeperator : ['?'],
  elementSeperator : '',

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

          privateKey : `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEArHIaO2kLkKjmLa/p7hBjLYANycRFrg20g3mBJU1UuKORMe/FFE7hKaYVuoq5
85x5/uwBPC2Zxcq58b4vzM9eU0rhCT2CvwBbtnpGhc1jcLymGiyoKsB0sKEem47cP5oGfaWfeg+T
GGMgkTIYRblwi1D/obfJKZUJuBJngZdycRscW8HrSLuvTbmvMjthy+BCNlPckNS+6pgsXgmQWfCY
gLWsuiyADLDBvq1v72qLb2j6TY4d0TW1Sb46Zg+51AuuOngk/c9fITLGqA4sEIp8iY71wOhYe8tP
yI7Ym088ME6UIK6oZfnoNzy5Tc6Rw55PZ92actn7CFeUgvM4u8U4NQIDAQABAoIBAH+CQ0lIrAeE
C+ceWx/vuBXtyMQ3P7qqYZ6Rml/FpW59a5/8BcK1bKJKL2jmqQar3j0TrvobUcfB1eodUeTkNH/s
LyeQ9vtaPXZZRYosS2oR49QYzyQFeIMeL66gXNUeg8wmShyMJZzztyIFY5MywjgRZWPjrHf1vuD/
os9c938PbyViK9uO9XBZlJTnH2ErPI8I0QJaQsrFdtMvaPstXIJJc2g3uDdkX6n1Obo4WrjFX01J
9ChZ3yQUvVkrwMPSKdA3BMYPbyDfbIRIPUSh+wLX0hhPkoBLvgoudoCu1n0MmrRaM3LxET6BWgTC
dGbDvhJU2Wnr0YD10jxiSd9jvgECgYEA6wQgA7UsZ5xRck2oYVIOK3OvLMQN9+4vKGqPlF3AkLo9
VcWZ5kxONgY/TVkpWncF+lwdnnEt5NasSU6ASF/TyFcH7g3I4yIx/4BbStp8nWTh+lPfpcD540Im
B9ZBZHHP7+fZtDZA+zMCMQjcApthIEFufks7wN4fuSbJjvypdbUCgYEAu9fGqpvdgLK/uL72Tocm
tz2DrJZJv4QSU5i/iB6I4OE3mbHnIO7StHhnL0C1prqWfFg8hdmpdIzELoVmbX/YoS7zqWUJ4q/p
PFRZs/AmkL9Ik8a/nziUWlDJQ/texPFzxqqLg2BbyJVMAqfe+vD64AjG1nhoLoctniRDMufuSIEC
gYEAg+WbxhjvI/MyLrFw17XCqBZT8Q7TPBtcMhWkIUOAqHktpS6yUfLvThixfEqXD+OO4lTCdsLU
XAMzTC0XiAboCB74H11zKi5t2xSBp//5Qih1PxXFhfRJCod8apePuby6U81OfHqae6DEERsExx3H
I+A1EAJPNc40BajEJFCfFqUCgYEAnuB/iTfx3nPRkyn5XCwVw/DEmUo4MEM92PUeMrxY25PCGj4N
lp5JGxmndKEPw2iX9a4P6spR+GFDYXG1U7JJgPMcZk8uUEynQj657GaXx9/yPANjegE6ATXJNbW7
z2nFmegPvlvW5c3ZD3n7MFZ4atshiq8mtwvgupxDNiBTO4ECgYBcsrLd0Nxro0P199nQ6FF5u9eo
kXGMTibz+rkuFBiYNjM5wO4HuZbX3tIA9f72AGHv4yE+UZHdkbBQrHgPt/San/X2ReOxCIKiYchO
SpxX060DaRIImkOxr2NrNTcF8ZkpEHiRKeFxB0dQ8hnmqQt6LRj96kEeMnAXVK2rDsoJmg==
-----END RSA PRIVATE KEY-----`
        }

  },

  // the oubound name after parsing the edi
  outbound : 'someOutbound'

} as EdiSchedulerConfig

export default class EdiParser850 extends BaseEdiParser {

    constructor(
        protected readonly type: string,
        protected readonly formatJson: any,
        protected readonly allService: any

    ) {
        super(type, formatJson, allService)
    }

    async import(ediContent: string, partyGroupCode: string): Promise<any> {

        console.log(`import type  : ${this.type}`)

        const response = await this.callImportOutbound(ediContent, partyGroupCode)

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

    async export(partyGroupCode: string): Promise<any> {

        console.log(`export type  : ${this.type}`)

        const result = await this.callExportOutbound(partyGroupCode)

        return result

    }

}
