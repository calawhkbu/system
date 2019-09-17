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
import { stringify } from 'querystring'
import { type } from 'os'
import { createTracing } from 'trace_events'

const moment = require('moment')
const _ = require('lodash')

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

interface JSONObject {
  segement?: string,
  elementList?: string[]
}

export default class EdiParser856 extends BaseEdiParser {
  constructor(
    protected readonly partyGroupCode: string,
    protected readonly type: string,
    protected readonly formatJson: any,
    protected readonly allService: any
  ) {
    super(partyGroupCode, type, formatJson, allService)
  }

  async export(entityJSON: any): Promise<any> {
    const returnJSON = {}
    returnJSON['data'] = []
    const data = returnJSON['data']

    for (const element of entityJSON)
    {
      const ST: JSONObject = {

      }
      ST.segement = 'ST'
      ST.elementList = []
      ST.elementList.push('856')
      ST.elementList.push(`0000${(entityJSON.findIndex(x => x.id = element.id) + 1).toString()}`)
      data.push(ST)
      const BSN: JSONObject = {

      }
      BSN.segement = 'BSN'
      BSN.elementList = []
      BSN.elementList.push('00')
      BSN.elementList.push(_.get(element, 'bookingNo'))
      BSN.elementList.push('')
      BSN.elementList.push('')
      BSN.elementList.push('')

      data.push(BSN)

      const loopObjectList = []
      const getNumOfLoopItem = 1 + this.getNumOfPo(_.get(element, 'bookingPopacking')) + (_.get(element, 'bookingPopacking').length)
      console.log('================================')
      // console.log(_.get(element, 'bookingPopacking').length)
      console.log(getNumOfLoopItem)
      loopObjectList.push(this.getLoopObject(loopObjectList, getNumOfLoopItem, element))

      const CTT: JSONObject = {}
      CTT.segement = 'CTT'
      CTT.elementList = []

      const SE: JSONObject = {}
      SE.segement = 'SE'
      SE.elementList = []
      // SE.elementList.push((loopObjectList.length + 1).toString)
      SE.elementList.push(`0000${(entityJSON.findIndex(x => x.id = element.id) + 1).toString()}`)
      data.push(SE)

    data.push(loopObjectList)
    }
    return returnJSON
    const result = await super.export(entityJSON)

    console.log('.........................')
    return result
  }
  async getLoopObject(loopObjectList, getNumOfLoopItem, element)
  {
    if (getNumOfLoopItem === 1)
    {
      const V1: JSONObject = {}
      V1.segement = 'V1'
      V1.elementList = []
      V1.elementList.push(_.get(element, 'carrierCode'))
      V1.elementList.push(_.get(element, 'vesselName'))
      V1.elementList.push(_.get(element, 'voyageFlightNumber'))
      loopObjectList.unshift(V1)
      if (_.get(element, 'arrivalDateActual'))
      {
        const DTM: JSONObject = {}
        DTM.segement = 'DTM'
        DTM.elementList = []
        DTM.elementList.push('371')
        DTM.elementList.push(_.get(element, 'departureDateActual'))
        loopObjectList.unshift(DTM)
      }
      if (_.get(element, 'departureDateActual'))
      {
        const DTM: JSONObject = {}
        DTM.segement = 'DTM'
        DTM.elementList = []
        DTM.elementList.push('370')
        DTM.elementList.push(moment(_.get(element, 'departureDateActual')).format('YYYYMMDD'))
        loopObjectList.unshift(DTM)
      }
      if (_.get(element, 'placeOfDeliveryCode'))
      {
        const TD5: JSONObject = {}
        TD5.segement = 'TD5'
        TD5.elementList = []
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('KL')
        TD5.elementList.push(_.get(element, 'placeOfDeliveryCode'))
        loopObjectList.unshift(TD5)
      }
      if (_.get(element, 'portOfDischargeCode'))
      {
        const TD5: JSONObject = {}
        TD5.segement = 'TD5'
        TD5.elementList = []
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('PB')
        TD5.elementList.push(_.get(element, 'portOfDischargeCode'))
        loopObjectList.unshift(TD5)
      }
      if (_.get(element, 'portOfLoadingCode'))
      {
        const TD5: JSONObject = {}
        TD5.segement = 'TD5'
        TD5.elementList = []
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('OA')
        TD5.elementList.push(_.get(element, 'portOfLoadingCode'))
        loopObjectList.unshift(TD5)
      }
      const HL: JSONObject = {}
      HL.segement = 'HL'
      HL.elementList = []
      HL.elementList.push(getNumOfLoopItem.toString)
      HL.elementList.push('')
      if (_.get(element, 'moduleTypeCode') === 'SHIPMENT')
      {
        HL.elementList.push('S')
      }
      else if (_.get(element, 'moduleTypeCode') === 'AIR')
      {
        HL.elementList.push('A')
      }
      else
      {
        HL.elementList.push(_.get(element, 'moduleTypeCode'))
      }
      loopObjectList.unshift(HL)
      return loopObjectList
    }
    else
    {
      const Item = _.get(element, 'bookingPopacking')
      const lastGroupOfItem = Item[Item.length - 1]
      const poNo = _.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.poNo')
      const indexOfFirstMatch = Item.findIndex(x => x.purchaseOrderItem.purchaseOrder.poNo === poNo)
      const totalItemNo = Item.length - indexOfFirstMatch
      console.log(totalItemNo)
      console.log('===========================')
      for (let i = 0; i < totalItemNo; i++)
      {
        const HL: JSONObject = {}
        HL.segement = 'HL'
        HL.elementList = []
        HL.elementList.push((getNumOfLoopItem - i).toString())
        HL.elementList.push((getNumOfLoopItem - totalItemNo).toString())
        HL.elementList.push('I')
        loopObjectList.unshift(HL)
      }
      const PRF: JSONObject = {}
      PRF.segement = 'PRF'
      PRF.elementList = []
      PRF.elementList.push(poNo)
      PRF.elementList.push('')
      PRF.elementList.push('')
      PRF.elementList.push(moment(_.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.poDate')).format('YYYYMMDD'))
      loopObjectList.unshift(PRF)
      const HLO: JSONObject = {}
      HLO.segement = 'HL'
      HLO.elementList = []
      HLO.elementList.push((getNumOfLoopItem - totalItemNo).toString())
      HLO.elementList.push('1')
      HLO.elementList.push('O')
      loopObjectList.unshift(HLO)
      Item.splice(indexOfFirstMatch, totalItemNo)
      this.getLoopObject(loopObjectList, (getNumOfLoopItem - 1 - totalItemNo), element)
    }
  }
  getNumOfPo(Item)
  {
    const uniquePo = []
    for (const po of Item)
    {
      if (!uniquePo.includes(po.purchaseOrderItem.purchaseOrder.poNo))
      {
        uniquePo.push(po.purchaseOrderItem.purchaseOrder.poNo)
      }
    }
    // console.log('---------------------------')
    // console.log(uniquePo.length)
    return uniquePo.length
  }

}
