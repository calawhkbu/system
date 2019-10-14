import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'

const moment = require('moment')
const _ = require('lodash')

export const formatJson = {
  removeCharacter: [],
  segmentSeperator: ['\r\n'],
  // elementSeperator: ['*']
  elementSeperator: ['']
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
    const currantDate = moment().toDate()
    let index = 0

    const cloneEntityJSON = _.cloneDeep(entityJSON)

    const ISA: JSONObject = {
        segement: 'ISA',
        elementList : []
    }
    const bookingNo = _.get(entityJSON[0], 'bookingNo')
    const removeCharbookingNo = bookingNo.replace(/-/g, '')
    const controlNo = (removeCharbookingNo || '').substring((removeCharbookingNo || '').length - 9)
    ISA.elementList.push('00', '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', '00',
    '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', '12', '718978080', 'ZZ' , 'DILLARDSTST' , moment(currantDate).format('YYMMDD'), moment(currantDate).format('HHmm'), 'U', '00403', controlNo, '0', 'P', '>')
    data.push(ISA)
    const GS: JSONObject = {
        segement: 'GS',
        elementList: []
    }
    GS.elementList.push('SH', '718978080', 'DILLARDSTST', moment(currantDate).format('YYYYMMDD'), moment(currantDate).format('HHmm'), parseInt(controlNo, 10), 'X', '004030VICS')
    data.push(GS)

    let lengthOfPreviousData = data.length

    for (const element of cloneEntityJSON)
    {
      index += 1
      const ST: JSONObject = {
          segement: 'ST',
          elementList : []
      }
      ST.elementList.push('856')
      const pad = '0000'
      const elementId = `${pad.substring(0, pad.length - index.toString().length)}${index}`
      ST.elementList.push(`${elementId}`)
      data.push(ST)
      const BSN: JSONObject = {
        segement: 'BSN',
        elementList: []
      }
      BSN.elementList.push('00')
      BSN.elementList.push(_.get(element, 'bookingNo'))
      BSN.elementList.push(moment(_.get(element, 'createdAt')).format('YYYYMMDD'))
      BSN.elementList.push(moment(_.get(element, 'createdAt')).format('HHmm'))
      BSN.elementList.push('0001')
      data.push(BSN)
      const loopObjectList: any[] = []
      const getNumOfLoopItem = 2 + (_.get(element, 'bookingPOPackings').length)
      loopObjectList.push(this.getLoopObject(loopObjectList, getNumOfLoopItem, element, index, entityJSON[index - 1]))
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
      SE.elementList.push(`${pad.substring(0, pad.length - index.toString().length)}${index}`)
      SE.elementList.push((data.length - lengthOfPreviousData + 1).toString())
      data.push(SE)
      lengthOfPreviousData += data.length

    }
    const GE: JSONObject = {
      segement: 'GE',
      elementList : []
    }
    GE.elementList.push(index.toString(), parseInt(controlNo, 10))
    const IEA: JSONObject = {
      segement: 'IEA',
      elementList : []
    }
    IEA.elementList.push('1', controlNo)
    data.push(GE, IEA)
    _.set(returnJSON, 'data', data)
    // return cloneEntityJSON
    return returnJSON
    const result = await super.export(returnJSON)
    return [result]
  }
  async getLoopObject(loopObjectList, getNumOfLoopItem, element, index, originElement)
  {
    if (getNumOfLoopItem === 1) // information of shipment
    {
      const DTM: JSONObject = {
        segement : 'DTM',
        elementList : []
      }
      DTM.elementList.push('011')
      DTM.elementList.push('')
      loopObjectList.unshift(DTM)
      const PER: JSONObject = {
        segement: 'PER',
        elementList: []
      }
      PER.elementList.push('EA')
      PER.elementList.push('') // not used
      PER.elementList.push('EM')
      PER.elementList.push('')
      loopObjectList.unshift(PER)
      const REF: JSONObject = {
          segement: 'REF',
          elementList: []
      }
      REF.elementList.push('BM')
      const BOLInf = (_.get(element, 'bookingReferences') || []).find(x => x.refName === 'MBL')
      if (BOLInf)
      {
        const BOLNo = _.get(BOLInf, 'refDescription')
        REF.elementList.push(BOLNo)
        loopObjectList.unshift(REF)
      }
      if ((_.get(element, 'bookingContainers') || []).length)
      {
        for (const container of element.bookingContainers)
        {
          const TD3: JSONObject = {
              segement: 'TD3',
              elementList: []
          }
          TD3.elementList.push('') // not used
          TD3.elementList.push((_.get(container, 'containerNo') || '').substring(0, 4))
          TD3.elementList.push((_.get(container, 'containerNo') || '').substring(4))
          loopObjectList.unshift(TD3)
        }
      }
      const TD5: JSONObject = {
        segement : 'TD5',
        elementList : []
      }
      TD5.elementList.push('O')
      TD5.elementList.push('2')
      TD5.elementList.push(_.get(element, 'carrierCode'))
      TD5.elementList.push('', '', '') // not used
      TD5.elementList.push('')

      loopObjectList.unshift(TD5)
      if ((_.get(originElement, 'bookingPOPackings') || []).length)
      {
        let totalWeight = 0
        let numberOfPacking = 0
        for (const booking of _.get(originElement, 'bookingPOPackings'))
        {
          totalWeight += parseInt(booking.weight, 10)
          numberOfPacking += 1
        }
        const TD1: JSONObject = {
          segement: 'TD1',
          elementList: []
        }
        TD1.elementList.push('CTN25', numberOfPacking, 'G', totalWeight, 'LB')
        loopObjectList.unshift(TD1)
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
    else // start with the po
    {
      const ItemList = _.get(element, 'bookingPOPackings')
      // const lastGroupOfItem = Item[Item.length - 1]
      // const poNo = _.get(lastGroupOfItem, 'purchaseOrderItem.purchaseOrder.poNo')
      // const allMatchItem = Item.filter(x => x.purchaseOrderItem.purchaseOrder.poNo === poNo)
      const totalItemNo = ItemList.length
      let itemIndex = 0
      for (const item of ItemList)
      {
        if (_.get(item, 'bookQuantity'))
        {
          const SN1: JSONObject = {
              segement: 'SN1',
              elementList: []
          }
          SN1.elementList.push('') // not used
          SN1.elementList.push( _.get(item, 'bookQuantity'), '')
          loopObjectList.unshift(SN1)
        }

        const LIN: JSONObject = {
            segement : 'LIN',
            elementList : []
        }
        LIN.elementList.push((totalItemNo - itemIndex).toString(), 'UP', _.get(item, 'upcen'))
        loopObjectList.unshift(LIN)
        const HL: JSONObject = {
            segement : 'HL',
            elementList : []
        }
        HL.elementList.push((getNumOfLoopItem - itemIndex).toString())
        HL.elementList.push((getNumOfLoopItem - totalItemNo).toString())
        HL.elementList.push('I')
        loopObjectList.unshift(HL)
        itemIndex++
      }
      const PRF: JSONObject = {
        segement : 'PRF',
        elementList : []
      }
      PRF.elementList.push(_.get(element, 'poNo'))
      PRF.elementList.push('', '') // not used
      if (_.get(element, 'poDate'))
      {
        PRF.elementList.push(moment(_.get(element, 'poDate')).format('YYYYMMDD'))
      }
      else
      {
        PRF.elementList.push('')
      }
      loopObjectList.unshift(PRF)

      const HLO: JSONObject = {
            segement : 'HL',
            elementList : []

      }
      HLO.elementList.push((getNumOfLoopItem - totalItemNo).toString())
      HLO.elementList.push(index.toString())
      HLO.elementList.push('O')
      loopObjectList.unshift(HLO)

      // Item.filter(x => allMatchItem.includes(x))
      // for (const matchItem of allMatchItem)
      // {
      //   const index = Item.findIndex(x => x.purchaseOrderItem.purchaseOrder.poNo === poNo)
      //   Item.splice(index, 1)
      // }
      // remove the used bookingPopacking

      // Item.splice(allMatchItem, totalItemNo)

      this.getLoopObject(loopObjectList, (getNumOfLoopItem - 1 - totalItemNo), element, index, originElement)
    }
  }

}
