import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'
import { type } from 'os'
import { format } from 'path'

const moment = require('moment')
const _ = require('lodash')

export const formatJson = {
  removeCharacter: [],
  segmentSeperator: ['\r\n'],
  elementSeperator: ['*'],
  // elementSeperator: [''],
  formatType: {
    resultType: 'oneContent',
    header: [
      {
        name: 'ISA',
        type: 'header',
        elementList: [
          {
            element: '00000',
            type: 'hardcode',
            max: 2,
            min: 2
          },
          {
            element: '          ',
            type: 'hardcode',
            max: 10,
            min: 10
          },
          {
            element: '00',
            type: 'hardcode'
          },
        ],
      },
      {
        name: 'GS',
        type: 'header',
        elementList: [
          {
            element: 'now',
            type: 'datetime',
            format: 'yyyyMMdd'
          }
        ]
      },
    ],
    content: {
      contentLocation: '',
      contentInfo: [
        {
          name: 'ST',
          type: 'content',
          elementList: [
            {
              element: '856',
              type: 'hardcode',
            },
            {
              element: 'content',
              type: 'sequence',
              max: 4,
              min: 4,
              padDirection: 'L',
              padChar: '0',
            }
          ]
        },
        {
          name: 'BSN',
          type: 'content',
          elementList: [
            {
              element: '00',
              type: 'hardcode',
            },
            {
              element: 'bookingNo',
              type: 'variable',
            },
            {
              element: 'createdAt',
              type: 'datetime',
              format: 'yyyyMMdd'
            },
            {
              element: 'createdAt',
              type: 'datetime',
              format: 'HHmm'
            },
            {
              element: '0004',
              type: 'hardcode',
            },
          ]
        },
        {
          name: 'HL',
          type: 'content',
          isLoop: true,
          jsonLocation: '',
          elementList: [
            {
              element: '1',
              type: 'sequence',
              layer: 0,
            },
            {
              element: '',
              type: 'not use',
            },
            {
              element: 'S',
              type: 'hardcode',
            },
          ],
          subSegmentList: [
            {
              name: 'MEA',
              type: 'content',
              elementList: [
                {
                  type: 'not use',
                },
                {
                  element: 'WT',
                  type: 'hardcode',
                },
                {
                  element: 'bookingPOPackings',
                  type: 'total',
                  totalValue: 'bookWeight',
                },
                {
                  element: 'KG',
                  type: 'hardcode',
                }
              ]
            },
            {
              name: 'MEA',
              type: 'content',
              elementList: [
                {
                  type: 'not use',
                },
                {
                  element: 'NM',
                  type: 'hardcode',
                },
                {
                  element: 'bookingPOPackings',
                  type: 'total',
                  totalValue: 'totalNoOfList',
                },
                {
                  element: 'CT',
                  type: 'hardcode',
                }
              ]
            },
            {
              name: 'TD5',
              type: 'content',
              elementList: [
                {
                  element: 'O',
                  type: 'hardcode',
                },
                {
                  element: '2',
                  type: 'hardcode',
                },
                {
                  element: 'carrierCode',
                  type: 'variable',
                },
                {
                  element: '',
                  type: 'not use',
                },
                {
                  element: '',
                  type: 'not use',
                },
                {
                  element: '',
                  type: 'not use',
                },
                {
                  element: 'KL',
                  type: 'hardcode',
                },
                {
                  element: 'portOfLoading',
                  type: 'variable',
                },
              ]
            },
            {
              name: 'TD3',
              type: 'content',
              isLoop: true,
              jsonLocation: 'bookingContainers',
              elementList: [
                {
                  type: 'not use',
                },
                {
                  element: 'containerNo',
                  type: 'variable',
                  startAt: 0,
                  length: 4,
                },
                {
                  element: 'containerNo',
                  type: 'variable',
                  startAt: 4,
                },
                {
                  type: 'not use',
                },
                {
                  type: 'not use',
                },
                {
                  type: 'not use',
                },
                {
                  type: 'not use',
                },
                {
                  type: 'not use',
                },
                {
                  element: 'sealNo1',
                  type: 'variable',
                },
                {
                  element: 'containerType',
                  type: 'variable',
                  match: {
                    '20OT': 2251,
                    '40OT': 4351,
                    '40HRF': 4662,
                    '45HRF': 9532,
                    '20RF': 2232,
                    '40RF': 4332,
                    '40HC': 4500,
                    '45HC': 9500,
                  },
                  // hasDefault: true,
                  // defaultValue: '1234',
                },
              ]
            },
            {
              name: 'REF',
              type: 'content',
              elementList: [
                {
                  element: 'KK',
                  type: 'hardcode',
                },
                {
                  element: 'service',
                  type: 'variable',
                  match: {
                    CFS: 'CFS/CY',
                    CY: 'CFS/CY',
                  },
                  default: 'MICP'
                }
              ]
            },
            {
              name: 'DTM',
              type: 'content',
              elementList: [
                {
                  element: '370',
                  type: 'hardcode',
                },
                {
                  element: 'estimatedDepartureDate',
                  type: 'datetime',
                  format: 'yyyyMMdd'
                }
              ]
            },
            {
              name: 'V1',
              type: 'content',
              elementList: [
                {
                  element: 'vesselCode',
                  type: 'variable',
                },
                {
                  element: 'vesselName',
                  type: 'variable',
                },
                {
                  type: 'not use'
                },
                {
                  element: 'voyageFlightNumber',
                  type: 'variable',
                }
              ]
            },
            {
              name: 'HL',
              type: 'content',
              isLoop: true,
              cumulatedPreviousLayer: true,
              jsonLocation: '',
              elementList: [
                {
                  type: 'sequence',
                  layer: 0,
                },
                {
                  type: 'sequence',
                  layer: 1,
                },
                {
                  element: 'O',
                  type: 'hardcode',
                },
              ],
              subSegmentList: [
                {
                  name: 'PRF',
                  type: 'content',
                  elementList: [
                    {
                      element: 'poNo',
                      type: 'variable',
                    },
                    {
                      element: 'poDate',
                      type: 'variable'
                    }
                  ],
                },
                {
                  name: 'HL',
                  type: 'content',
                  cumulatedPreviousLayer: true,
                  isLoop: true,
                  jsonLocation: 'bookingPOPackings',
                  elementList: [
                    {
                      type: 'sequence',
                      layer: 0,
                    },
                    {
                      type: 'sequence',
                      layer: 1,
                    },
                    {
                      element: 'I',
                      type: 'hardcode',
                    },
                  ],
                  subSegmentList: [
                    {
                      name: 'LIN',
                      type: 'content',
                      elementList: [
                        {
                          element: 'loopSeqeunce',
                          type: 'sequence',
                        },
                        {
                          element: 'SK',
                          type: 'hardcode'
                        },
                        {
                          element: 'style',
                          type: 'variable'
                        },
                        {
                          element: 'BO',
                          type: 'hardcode'
                        },
                        {
                          element: 'colorDesc',
                          type: 'variable'
                        },
                        {
                          element: 'IZ',
                          type: 'hardcode'
                        },
                        {
                          element: 'size',
                          type: 'variable'
                        },
                      ],
                    },
                    {
                      name: 'SLN',
                      type: 'content',
                      elementList: [
                        {
                          element: '1',
                          type: 'hardcode',
                        },
                        {
                          type: 'not use'
                        },
                        {
                          element: 'I',
                          type: 'hardcode',
                        },
                        {
                          element: 'bookQuantity',
                          type: 'variable',
                        },
                        {
                          element: 'PC',
                          type: 'hardcode',
                        },
                      ],
                    },
                    {
                      name: 'MEA',
                      type: 'content',
                      elementList: [
                        {
                          type: 'not use'
                        },
                        {
                          element: 'SU',
                          type: 'hardcode',
                        },
                        {
                          element: 'bookQuantity',
                          type: 'variable',
                        },
                        {
                          element: 'PC',
                          type: 'hardcode',
                        },
                      ],
                    }
                  ]
                }
              ]
            },
            {
              name: 'CTT',
              type: 'content',
              elementList: [
                {
                  type: 'sequence',
                  layer: 0,
                },
              ]
            },
          ]
        },
        {
          name: 'SE',
          type: 'content',
          elementList: [
            {
              element: 'content',
              type: 'total',
              totalValue: 'content',
            },
            {
              element: 'content',
              type: 'sequence',
            }
          ],
        },
      ]
    },
    footer: [
      {
        name: 'GE',
        type: 'footer',
        elementList: [
          {
            element: '01',
            type: 'hardcode',
          },
          {
            element: 'content',
            type: 'sequence',
          }
        ],
      },
      {
        name: 'ISA',
        type: 'footer',
        elementList: [
          {
            element: '01',
            type: 'hardcode',
          },
          {
            element: 'content',
            type: 'sequence',
          }
        ],
      },
    ]

  }
} as EdiFormatJson

interface JSONObject {
  segement?: string
  elementList?: any[]
}

export default class EdiParser856 extends BaseEdiParser {
  constructor(
    protected readonly allService: {
      swivelConfigService: SwivelConfigService
      outboundService: OutboundService
    }
  ) {
    super(allService, {}, { export: { formatJson, ediType: '856' } })
  }

  async export(entityJSON: any): Promise<any> {
    const result = await super.export(entityJSON)
    return result.ediResults[0].ediContent
    const returnJSON = {}
    const data = []
    const currantDate = moment().toDate()
    let index = 0

    const cloneEntityJSON = _.cloneDeep(entityJSON)

    const ISA: JSONObject = {
      segement: 'ISA',
      elementList: [],
    }
    const bookingNo = _.get(entityJSON[0], 'bookingNo')
    const controlNo = (bookingNo || '').substring((bookingNo || '').length - 9)
    ISA.elementList.push(
      '00',
      '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0',
      '00',
      '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0',
      '12',
      '718978080',
      'ZZ',
      'DILLARDSTST',
      moment(currantDate).format('YYMMDD'),
      moment(currantDate).format('HHmm'),
      'U',
      '00403',
      controlNo,
      '0',
      'P',
      '>'
    )
    data.push(ISA)
    const GS: JSONObject = {
      segement: 'GS',
      elementList: [],
    }
    GS.elementList.push(
      'SH',
      '718978080',
      'DILLARDSTST',
      moment(currantDate).format('YYYYMMDD'),
      moment(currantDate).format('HHmm'),
      parseInt(controlNo, 10),
      'X',
      '004030VICS'
    )
    data.push(GS)

    let lengthOfPreviousData = data.length

    for (const element of cloneEntityJSON) {
      index += 1
      const ST: JSONObject = {
        segement: 'ST',
        elementList: [],
      }
      ST.elementList.push('856')
      const pad = '0000'
      const elementId = `${pad.substring(0, pad.length - index.toString().length)}${index}`
      ST.elementList.push(`${elementId}`)
      data.push(ST)
      const BSN: JSONObject = {
        segement: 'BSN',
        elementList: [],
      }
      BSN.elementList.push('00')
      BSN.elementList.push(_.get(element, 'bookingNo'))
      BSN.elementList.push(moment(_.get(element, 'createdAt')).format('YYYYMMDD'))
      BSN.elementList.push(moment(_.get(element, 'createdAt')).format('HHmm'))
      BSN.elementList.push('0004')
      data.push(BSN)

      const loopObjectList: any[] = []
      const getNumOfLoopItem =
        1 +
        this.getNumOfPo(_.get(element, 'bookingPopacking')) +
        _.get(element, 'bookingPopacking').length
      loopObjectList.push(
        this.getLoopObject(loopObjectList, getNumOfLoopItem, element, index, entityJSON[index - 1])
      )
      const filteredList = loopObjectList.filter(value => Object.keys(value).length !== 0)
      data.push(...filteredList)

      const CTT: JSONObject = {
        segement: 'CTT',
        elementList: [],
      }
      CTT.elementList.push(getNumOfLoopItem.toString())
      data.push(CTT)

      const SE: JSONObject = {
        segement: 'SE',
        elementList: [],
      }
      SE.elementList.push(`${pad.substring(0, pad.length - index.toString().length)}${index}`)
      SE.elementList.push((data.length - lengthOfPreviousData + 1).toString())
      data.push(SE)
      lengthOfPreviousData += data.length
    }
    const GE: JSONObject = {
      segement: 'GE',
      elementList: [],
    }
    GE.elementList.push(index.toString(), parseInt(controlNo, 10))
    const IEA: JSONObject = {
      segement: 'IEA',
      elementList: [],
    }
    IEA.elementList.push('1', controlNo)
    data.push(GE, IEA)
    _.set(returnJSON, 'data', data)
    // return cloneEntityJSON
    return returnJSON
    // const result = await super.export(returnJSON)
    return [result]
  }
  async getLoopObject(loopObjectList, getNumOfLoopItem, element, index, originElement) {
    if (getNumOfLoopItem === 1) {
      // information of shipment
      const V1: JSONObject = {
        segement: 'V1',
        elementList: [],
      }
      V1.elementList.push(_.get(element, 'carrierCode'))
      V1.elementList.push(_.get(element, 'vesselName'))
      V1.elementList.push(_.get(element, 'voyageFlightNumber'))
      loopObjectList.unshift(V1)

      if (_.get(element, 'arrivalDateActual')) {
        const DTM: JSONObject = {
          segement: 'DTM',
          elementList: [],
        }
        DTM.elementList.push('371')
        DTM.elementList.push(_.get(element, 'departureDateActual').format('YYYYMMDD'))
        loopObjectList.unshift(DTM)
      }
      if (_.get(element, 'departureDateActual')) {
        const DTM: JSONObject = {
          segement: 'DTM',
          elementList: [],
        }
        DTM.elementList.push('370')
        DTM.elementList.push(moment(_.get(element, 'departureDateActual')).format('YYYYMMDD'))
        loopObjectList.unshift(DTM)
      }
      if (_.get(element, 'cargoReceiptDateActual')) {
        const DTM: JSONObject = {
          segement: 'DTM',
          elementList: [],
        }
        DTM.elementList.push('050')
        DTM.elementList.push(_.get(element, 'cargoReceiptDateActual').format('YYYYMMDD'))
        loopObjectList.unshift(DTM)
      }
      if (_.get(element, 'containerLoadDateActual')) {
        const DTM: JSONObject = {
          segement: 'DTM',
          elementList: [],
        }
        DTM.elementList.push('ABK')
        DTM.elementList.push(_.get(element, 'containerLoadDateActual').format('YYYYMMDD'))
        loopObjectList.unshift(DTM)
      }
      const REF: JSONObject = {
        segement: 'REF',
        elementList: [],
      }
      REF.elementList.push('KK')
      if (_.get(element, 'service') === 'CFS') {
        REF.elementList.push('CFS/CY')
      } else {
        REF.elementList.push(_.get(element, 'service'))
      }
      loopObjectList.unshift(REF)
      if (_.get(element, 'bookingContainers').length) {
        for (const container of element.bookingContainers) {
          const TD3: JSONObject = {
            segement: 'TD3',
            elementList: [],
          }
          TD3.elementList.push('') // not used
          TD3.elementList.push((_.get(container, 'containerNo') || '').substring(0, 4))
          TD3.elementList.push((_.get(container, 'containerNo') || '').substring(4))
          TD3.elementList.push('', '', '', '', '') // not used
          TD3.elementList.push(_.get(container, 'sealNo'))
          if (_.get(container, 'containerTypeCode') === '20OT') {
            TD3.elementList.push('2251')
          } else if (_.get(container, 'containerTypeCode') === '40OT') {
            TD3.elementList.push('4351')
          } else if (_.get(container, 'containerTypeCode') === '40HRF') {
            TD3.elementList.push('4662')
          } else if (_.get(container, 'containerTypeCode') === '45HRF') {
            TD3.elementList.push('9532')
          } else if (_.get(container, 'containerTypeCode') === '20RF') {
            TD3.elementList.push('2232')
          } else if (_.get(container, 'containerTypeCode') === '40RF') {
            TD3.elementList.push('4332')
          } else if (_.get(container, 'containerTypeCode') === '40HC') {
            TD3.elementList.push('4500')
          } else if (_.get(container, 'containerTypeCode') === '45HC') {
            TD3.elementList.push('9500')
          } else {
            TD3.elementList.push('')
          }
          loopObjectList.unshift(TD3)
        }
      }
      if (
        _.get(element, 'portOfLoadingCode') ||
        _.get(element, 'portOfDischargeCode') ||
        _.get(element, 'placeOfReceiptCode')
      ) {
        if (_.get(element, 'portOfLoadingCode')) {
          const TD5: JSONObject = {
            segement: 'TD5',
            elementList: [],
          }
          TD5.elementList.push('O')
          TD5.elementList.push('2')
          TD5.elementList.push(_.get(element, 'carrierCode'))
          TD5.elementList.push('') // not used
          TD5.elementList.push('') // not used
          TD5.elementList.push('') // not used
          TD5.elementList.push('KL')
          TD5.elementList.push(_.get(element, 'portOfLoadingCode'))
          loopObjectList.unshift(TD5)
        }
        if (_.get(element, 'portOfDischargeCode')) {
          const TD5: JSONObject = {
            segement: 'TD5',
            elementList: [],
          }
          TD5.elementList.push('O')
          TD5.elementList.push('2')
          TD5.elementList.push(_.get(element, 'carrierCode'))
          TD5.elementList.push('') // not used
          TD5.elementList.push('') // not used
          TD5.elementList.push('') // not used
          TD5.elementList.push('PB')
          TD5.elementList.push(_.get(element, 'portOfDischargeCode'))
          loopObjectList.unshift(TD5)
        }
        if (_.get(element, 'placeOfReceiptCode')) {
          const TD5: JSONObject = {
            segement: 'TD5',
            elementList: [],
          }
          TD5.elementList.push('O')
          TD5.elementList.push('2')
          TD5.elementList.push(_.get(element, 'carrierCode'))
          TD5.elementList.push('') // not used
          TD5.elementList.push('') // not used
          TD5.elementList.push('') // not used
          TD5.elementList.push('OA')
          TD5.elementList.push(_.get(element, 'placeOfReceiptCode'))
          loopObjectList.unshift(TD5)
        }
      } else {
        const TD5: JSONObject = {
          segement: 'TD5',
          elementList: [],
        }
        TD5.elementList.push('O')
        TD5.elementList.push('2')
        TD5.elementList.push(_.get(element, 'carrierCode'))
        loopObjectList.unshift(TD5)
      }
      if (_.get(originElement, 'bookingPopacking').length) {
        let totalVolume = 0
        let totalWeight = 0
        let numberOfPacking = 0
        let totalQuantity = 0
        for (const booking of _.get(originElement, 'bookingPopacking')) {
          totalVolume += parseInt(booking.volume, 10)
          totalWeight += parseInt(booking.weight, 10)
          numberOfPacking += 1
          totalQuantity += booking.quantity
        }
        if (totalQuantity > 0) {
          const MEA: JSONObject = {
            segement: 'MEA',
            elementList: [],
          }
          MEA.elementList.push(
            '',
            'SU',
            totalQuantity,
            ((originElement[0], 'quantityUnit') || '').substring(0, 2).toUpperCase()
          )
          loopObjectList.unshift(MEA)
        }
        if (numberOfPacking > 0) {
          const MEA: JSONObject = {
            segement: 'MEA',
            elementList: [],
          }
          MEA.elementList.push('', 'NM', numberOfPacking, '')
          loopObjectList.unshift(MEA)
        }
        if (totalVolume > 0) {
          const MEA: JSONObject = {
            segement: 'MEA',
            elementList: [],
          }
          MEA.elementList.push('', 'VOL', totalVolume, 'CO')
          loopObjectList.unshift(MEA)
        }
        if (totalWeight > 0) {
          const MEA: JSONObject = {
            segement: 'MEA',
            elementList: [],
          }
          MEA.elementList.push('', 'WT', totalWeight)
          if (_.get(originElement[0], 'weightUnit') === 'pound') {
            MEA.elementList.push('LB')
          } else {
            MEA.elementList.push(
              ((originElement[0], 'weightUnit') || '').substring(0, 2).toUpperCase()
            )
          }
          loopObjectList.unshift(MEA)
        }
      }

      const HL: JSONObject = {
        segement: 'HL',
        elementList: [],
      }
      HL.elementList.push(getNumOfLoopItem.toString())
      HL.elementList.push('') // not used
      HL.elementList.push('S')
      loopObjectList.unshift(HL)
      return loopObjectList
    } // start with the po
    else {
      const Item = _.get(element, 'bookingPopacking')
      const lastGroupOfItem = Item[Item.length - 1]
      const poNo = _.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.poNo')
      const allMatchItem = Item.filter(x => x.purchaseOrderItem.purchaseOrder.poNo === poNo)
      const totalItemNo = allMatchItem.length
      let itemIndex = 0
      for (const matchItem of allMatchItem) {
        if (_.get(matchItem, 'purchaseOrderItem.quantity')) {
          const MEA: JSONObject = {
            segement: 'MEA',
            elementList: [],
          }
          MEA.elementList.push(
            '',
            'SU',
            _.get(matchItem, 'purchaseOrderItem.quantity'),
            (_.get(matchItem, 'purchaseOrderItem.quantityUnit') || '').substring(0, 2).toUpperCase()
          )
          loopObjectList.unshift(MEA)
        }
        if (_.get(matchItem, 'purchaseOrderItem.volume')) {
          const MEA: JSONObject = {
            segement: 'MEA',
            elementList: [],
          }
          MEA.elementList.push(
            '',
            'VOL',
            _.get(matchItem, 'purchaseOrderItem.volume'),
            _.get(matchItem),
            'CO'
          )
          loopObjectList.unshift(MEA)
        }
        if (_.get(matchItem, 'purchaseOrderItem.grossWeight')) {
          const MEA: JSONObject = {
            segement: 'MEA',
            elementList: [],
          }
          MEA.elementList.push('', 'WT', _.get(matchItem, 'purchaseOrderItem.grossWeight'))
          if (_.get(matchItem, 'purchaseOrderItem.weightUnit') === 'pound') {
            MEA.elementList.push('LB')
          } else {
            MEA.elementList.push(
              (_.get(matchItem, 'purchaseOrderItem.weightUnit') || '').substring(0, 2).toUpperCase()
            )
          }
          loopObjectList.unshift(MEA)
        }

        const SLN: JSONObject = {
          segement: 'SLN',
          elementList: [],
        }
        SLN.elementList.push('1')
        SLN.elementList.push('') // not used
        SLN.elementList.push('I')
        SLN.elementList.push(_.get(matchItem, 'purchaseOrderItem.quantity').toString())
        if (_.get(matchItem, 'purchaseOrderItem.quantityUnit') === 'PCS') {
          SLN.elementList.push('PC')
        } else if (_.get(matchItem, 'purchaseOrderItem.quantityUnit') === 'EACH') {
          SLN.elementList.push('EA')
        } else {
          SLN.elementList.push(
            (_.get(matchItem, 'purchaseOrderItem.quantityUnit') || '').substring(0, 2).toUpperCase()
          )
        }
        loopObjectList.unshift(SLN)

        const LIN: JSONObject = {
          segement: 'LIN',
          elementList: [],
        }
        LIN.elementList.push((totalItemNo - itemIndex).toString())
        LIN.elementList.push('SK')
        LIN.elementList.push(_.get(matchItem, 'purchaseOrderItem.product.style'))
        LIN.elementList.push('BO')
        LIN.elementList.push(_.get(matchItem, 'purchaseOrderItem.product.colorDesc'))
        LIN.elementList.push('IZ')
        LIN.elementList.push(_.get(matchItem, 'purchaseOrderItem.product.size'))
        LIN.elementList.push('')
        LIN.elementList.push('')
        LIN.elementList.push('')
        LIN.elementList.push('')

        loopObjectList.unshift(LIN)
        const HL: JSONObject = {
          segement: 'HL',
          elementList: [],
        }
        HL.elementList.push((getNumOfLoopItem - itemIndex).toString())
        HL.elementList.push((getNumOfLoopItem - totalItemNo).toString())
        HL.elementList.push('I')
        loopObjectList.unshift(HL)
        itemIndex++
      }
      if (_.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.cargoReciptDateActual')) {
        const DTM: JSONObject = {
          segement: 'DTM',
          elementList: [],
        }
        DTM.elementList.push('050')
        DTM.elementList.push(
          _.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.cargoReciptDateActual').format(
            'YYYYMMDD'
          )
        )
        loopObjectList.unshift(DTM)
      }
      if (_.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.portOfDischargeCode')) {
        const TD5: JSONObject = {
          segement: 'TD5',
          elementList: [],
        }
        TD5.elementList.push('O')
        TD5.elementList.push('2')
        TD5.elementList.push(_.get(element, 'carrierCode'))
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('DL')
        TD5.elementList.push(
          _.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.portOfDischargeCode')
        )
        loopObjectList.unshift(TD5)
      }
      if (_.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.portOfLoadingCode')) {
        const TD5: JSONObject = {
          segement: 'TD5',
          elementList: [],
        }
        TD5.elementList.push('O')
        TD5.elementList.push('2')
        TD5.elementList.push(_.get(element, 'carrierCode'))
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('OR')
        TD5.elementList.push(
          _.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.portOfLoadingCode')
        )
        loopObjectList.unshift(TD5)
      }
      const PRF: JSONObject = {
        segement: 'PRF',
        elementList: [],
      }
      PRF.elementList.push(poNo)
      PRF.elementList.push('', '') // not used
      PRF.elementList.push(
        moment(_.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.poDate')).format('YYYYMMDD')
      )
      loopObjectList.unshift(PRF)

      const HLO: JSONObject = {
        segement: 'HL',
        elementList: [],
      }
      HLO.elementList.push((getNumOfLoopItem - totalItemNo).toString())
      HLO.elementList.push(index.toString())
      HLO.elementList.push('O')
      loopObjectList.unshift(HLO)

      Item.filter(x => allMatchItem.includes(x))
      for (const matchItem of allMatchItem) {
        const index = Item.findIndex(x => x.purchaseOrderItem.purchaseOrder.poNo === poNo)
        Item.splice(index, 1)
      }
      // remove the used bookingPopacking

      // Item.splice(allMatchItem, totalItemNo)

      this.getLoopObject(
        loopObjectList,
        getNumOfLoopItem - 1 - totalItemNo,
        element,
        index,
        originElement
      )
    }
  }
  getNumOfPo(Item) {
    const uniquePo = []
    for (const po of Item) {
      if (!uniquePo.includes(po.purchaseOrderItem.purchaseOrder.poNo)) {
        uniquePo.push(po.purchaseOrderItem.purchaseOrder.poNo)
      }
    }
    return uniquePo.length
  }
}
