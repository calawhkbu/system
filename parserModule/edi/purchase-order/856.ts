import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'

const moment = require('moment')
const _ = require('lodash')

export const formatJson = {
  removeCharacter: [],
  segmentSeperator: ['?'],
  elementSeperator: ['*']
  // elementSeperator: ['']
} as EdiFormatJson

interface JSONObject {
  segement?: string,
  elementList?: any[]
}

export default class EdiParser856 extends BaseEdiParser {
    constructor(
        protected readonly allService: {
          swivelConfigService: SwivelConfigService,
          outboundService: OutboundService,
        },
      ) {
        super(allService, {}, { export: { formatJson, ediType: '856' } })
      }

  async export(entityJSON: any): Promise<any> {
    const returnJSON = {}
    const data = []
    let index = 0
    const ISA: JSONObject = {
        segement: 'ISA',
        elementList : []
    }
    ISA.elementList.push('00')
    data.push(ISA)
    const GS: JSONObject = {
        segement: 'GS',
        elementList: []
    }
    data.push(GS)

    let lengthOfPreviousData = data.length

    for (const element of entityJSON)
    {
      index += 1
      const ST: JSONObject = {
          segement: 'ST',
          elementList : []
      }
      ST.elementList.push('856')
      ST.elementList.push(`0000${index}`)
      data.push(ST)
      const BSN: JSONObject = {
        segement: 'BSN',
        elementList: []
      }
      BSN.elementList.push('00')
      BSN.elementList.push(_.get(element, 'bookingNo'))
      BSN.elementList.push('')
      BSN.elementList.push('')
      BSN.elementList.push('')
      data.push(BSN)

      const loopObjectList: any[] = []
      const getNumOfLoopItem = 1 + this.getNumOfPo(_.get(element, 'bookingPopacking')) + (_.get(element, 'bookingPopacking').length)
      loopObjectList.push(this.getLoopObject(loopObjectList, getNumOfLoopItem, element, index))
      const filteredList = loopObjectList.filter(value => Object.keys(value).length !== 0)
      data.push(...filteredList)

      const CTT: JSONObject = {
        segement : 'CTT',
        elementList : []
      }
      CTT.elementList.push(getNumOfLoopItem.toString())
      data.push(CTT)

      const SE: JSONObject = {
        segement : 'SE',
        elementList: []
      }
      SE.elementList.push(`0000${index}`)
      SE.elementList.push((data.length - lengthOfPreviousData).toString())
      data.push(SE)
      lengthOfPreviousData += data.length

    }
    _.set(returnJSON, 'data', data)
    //return returnJSON
    const result = await super.export(returnJSON)
    return result
  }
  async getLoopObject(loopObjectList, getNumOfLoopItem, element, index)
  {
    if (getNumOfLoopItem === 1)
    {
      const V1: JSONObject = {
        segement : 'V1',
        elementList : []
      }
      V1.elementList.push(_.get(element, 'carrierCode'))
      V1.elementList.push(_.get(element, 'vesselName'))
      V1.elementList.push(_.get(element, 'voyageFlightNumber'))
      loopObjectList.unshift(V1)

      if (_.get(element, 'arrivalDateActual'))
      {
        const DTM: JSONObject = {
            segement : 'DTM',
            elementList : []
        }
        DTM.elementList.push('371')
        DTM.elementList.push(_.get(element, 'departureDateActual').format('YYYYMMDD'))
        loopObjectList.unshift(DTM)
      }
      if (_.get(element, 'departureDateActual'))
      {
        const DTM: JSONObject = {
            segement : 'DTM',
            elementList : []
        }
        DTM.elementList.push('370')
        DTM.elementList.push(moment(_.get(element, 'departureDateActual')).format('YYYYMMDD'))
        loopObjectList.unshift(DTM)
      }

      const REF: JSONObject = {
          segement: 'REF',
          elementList: []
      }
      REF.elementList.push('KK')
      REF.elementList.push(_.get(element, 'moduleTypeCode'))
      loopObjectList.unshift(REF)

      for (const container of element.bookingContainers)
      {
        const TD3: JSONObject = {
            segement: 'TD3',
            elementList: []
        }
        TD3.elementList.push('') // not used
        TD3.elementList.push('')
        TD3.elementList.push(_.get(container, 'containerNo'))
        TD3.elementList.push('', '', '', '', '') // not used
        TD3.elementList.push(_.get(container, 'sealNo'))
        TD3.elementList.push('')
        loopObjectList.unshift(TD3)
      }
      if (_.get(element, 'portOfLoadingCode'))
      {
        const TD5: JSONObject = {
            segement : 'TD5',
            elementList : []
        }
        TD5.elementList.push('')
        TD5.elementList.push('2')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('KL')
        TD5.elementList.push(_.get(element, 'portOfLoadingCode'))
        loopObjectList.unshift(TD5)
      }
      if (_.get(element, 'portOfDischargeCode'))
      {
        const TD5: JSONObject = {
            segement : 'TD5',
            elementList : []
        }
        TD5.elementList.push('')
        TD5.elementList.push('2')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('PB')
        TD5.elementList.push(_.get(element, 'portOfDischargeCode'))
        loopObjectList.unshift(TD5)
      }
      if (_.get(element, 'placeOfReceiptCode'))
      {
        const TD5: JSONObject = {
            segement : 'TD5',
            elementList : []
        }
        TD5.elementList.push('')
        TD5.elementList.push('2')
        TD5.elementList.push('')
        TD5.elementList.push('') // not used
        TD5.elementList.push('') // not used
        TD5.elementList.push('') // not used
        TD5.elementList.push('OA')
        TD5.elementList.push(_.get(element, 'placeOfReceiptCode'))
        loopObjectList.unshift(TD5)
      }
      const HL: JSONObject = {
        segement : 'HL',
        elementList : []
      }
      HL.elementList.push(getNumOfLoopItem.toString())
      HL.elementList.push('')// not used
      HL.elementList.push('S')
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
      for (let i = 0; i < totalItemNo; i++)
      {
        const SLN: JSONObject = {
            segement: 'SLN',
            elementList : []
        }
        SLN.elementList.push('1')
        SLN.elementList.push('')
        SLN.elementList.push('')
        SLN.elementList.push(_.get(Item[totalItemNo - i - 1], 'purchaseOrderItem.quantity').toString())
        SLN.elementList.push('')
        loopObjectList.unshift(SLN)

        const LIN: JSONObject = {
            segement : 'LIN',
            elementList : []
        }
        LIN.elementList.push((totalItemNo - i).toString())
        LIN.elementList.push('SK')
        LIN.elementList.push(_.get(Item[totalItemNo - i - 1], 'purchaseOrderItem.product.style'))
        LIN.elementList.push('BO')
        LIN.elementList.push(_.get(Item[totalItemNo - i - 1], 'purchaseOrderItem.product.colorDesc'))
        LIN.elementList.push('IZ')
        LIN.elementList.push(_.get(Item[totalItemNo - i - 1], 'purchaseOrderItem.product.size'))
        LIN.elementList.push('JP')
        LIN.elementList.push('')
        LIN.elementList.push('ZZ')
        LIN.elementList.push('')

        loopObjectList.unshift(LIN)
        const HL: JSONObject = {
            segement : 'HL',
            elementList : []
        }
        HL.elementList.push((getNumOfLoopItem - i).toString())
        HL.elementList.push((getNumOfLoopItem - totalItemNo).toString())
        HL.elementList.push('I')
        loopObjectList.unshift(HL)
      }
      const PRF: JSONObject = {
            segement : 'PRF',
            elementList : []
      }
      PRF.elementList.push(poNo)
      PRF.elementList.push('', '') // not used
      PRF.elementList.push(moment(_.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.poDate')).format('YYYYMMDD'))
      loopObjectList.unshift(PRF)
      if (_.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.shipToPartyCode'))
      {
        const TD5: JSONObject = {
                segement: 'TD5',
                elementList: [],
        }
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('')
        TD5.elementList.push('DL')
        TD5.elementList.push(_.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.shipToPartyCode'))
        loopObjectList.unshift(TD5)
    }
      const HLO: JSONObject = {
            segement : 'HL',
            elementList : []

      }
      HLO.elementList.push((getNumOfLoopItem - totalItemNo).toString())
      HLO.elementList.push(index.toString())
      HLO.elementList.push('O')
      loopObjectList.unshift(HLO)
      Item.splice(indexOfFirstMatch, totalItemNo)
      this.getLoopObject(loopObjectList, (getNumOfLoopItem - 1 - totalItemNo), element, index)
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
    return uniquePo.length
  }

}
