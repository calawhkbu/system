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
    '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', '12', '718978080', '08' , '6112390050' , moment(currantDate).format('YYMMDD'), moment(currantDate).format('HHmm'), 'U', '00403', controlNo, '0', 'P', '>')
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
      BSN.elementList.push('0004')
      data.push(BSN)
      const loopObjectList: any[] = []
      const getNumOfLoopItem = 2 + (_.get(element, 'bookingPOPackings').length)
      loopObjectList.push(this.getLoopObject(loopObjectList, getNumOfLoopItem, element))
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
    // return returnJSON
    const result = await super.export(returnJSON)
    return [result]
  }
  async getLoopObject(loopObjectList, getNumOfLoopItem, element)
  {
    for (let i = 1; i <= getNumOfLoopItem; i++)
    {
      if (i === 1) // information of shipment
      {
        const HL: JSONObject = {
          segement : 'HL',
          elementList : []
        }
        HL.elementList.push(i)
        HL.elementList.push('')// not used
        HL.elementList.push('S')
        loopObjectList.push(HL)
        if ((_.get(element, 'bookingPOPackings') || []).length)
        {
          let totalWeight = 0
          let numberOfPacking = 0
          let totalVolume = 0
          let totalShipUnit = 0
          for (const booking of _.get(element, 'bookingPOPackings'))
          {
            if (_.get(booking, 'bookWeight'))
            {
              totalWeight += _.get(booking, 'bookWeight')
            }
            if (_.get(booking, 'bookVolume'))
            {
              totalVolume += _.get(booking, 'bookVolume')
            }
            if (_.get(booking, 'bookQuantity'))
            {
              totalShipUnit += _.get(booking, 'bookQuantity')
            }

            numberOfPacking += 1
          }
          if (totalWeight > 0)
          {
            const MEA: JSONObject = {
              segement: 'MEA',
              elementList: []
            }
            totalWeight = Number.parseFloat(totalWeight.toPrecision(5))
            MEA.elementList.push('')// not used
            MEA.elementList.push( 'WT', totalWeight.toString(), 'KG')
            loopObjectList.push(MEA)
          }
          if (totalVolume > 0)
          {
            const MEA: JSONObject = {
              segement: 'MEA',
              elementList: []
            }
            totalVolume = Number.parseFloat(totalVolume.toPrecision(5))
            MEA.elementList.push('')// not used
            MEA.elementList.push( 'VOL', totalVolume.toString(), 'CO')
            loopObjectList.push(MEA)
          }
          if (numberOfPacking > 0)
          {
            const MEA: JSONObject = {
              segement: 'MEA',
              elementList: []
            }
            MEA.elementList.push('')// not used
            MEA.elementList.push( 'NM', numberOfPacking, 'CT')
            loopObjectList.push(MEA)
          }
          if (totalShipUnit > 0)
          {
            const MEA: JSONObject = {
              segement: 'MEA',
              elementList: []
            }
            MEA.elementList.push('')// not used
            MEA.elementList.push( 'WT', totalShipUnit, 'PC')
            loopObjectList.push(MEA)
          }
        }
        if (_.get(element, 'portOfLoading') || _.get(element, 'portOfDischarge') || _.get(element, 'placeOfReceiptCode'))
        {
          if (_.get(element, 'portOfLoading'))
          {
            const TD5: JSONObject = {
                segement : 'TD5',
                elementList : []
            }
            TD5.elementList.push('O')
            TD5.elementList.push('2')
            TD5.elementList.push(_.get(element, 'carrierCode'))
            TD5.elementList.push('')// not used
            TD5.elementList.push('')// not used
            TD5.elementList.push('')// not used
            TD5.elementList.push('KL')
            TD5.elementList.push(_.get(element, 'portOfLoading'))
            loopObjectList.push(TD5)
          }
          if (_.get(element, 'portOfDischarge'))
          {
            const TD5: JSONObject = {
                segement : 'TD5',
                elementList : []
            }
            TD5.elementList.push('O')
            TD5.elementList.push('2')
            TD5.elementList.push(_.get(element, 'carrierCode'))
            TD5.elementList.push('')// not used
            TD5.elementList.push('')// not used
            TD5.elementList.push('')// not used
            TD5.elementList.push('PB')
            TD5.elementList.push(_.get(element, 'portOfDischarge'))
            loopObjectList.push(TD5)
          }
          if (_.get(element, 'placeOfReceiptCode'))
          {
            const TD5: JSONObject = {
                segement : 'TD5',
                elementList : []
            }
            TD5.elementList.push('O')
            TD5.elementList.push('2')
            TD5.elementList.push(_.get(element, 'carrierCode'))
            TD5.elementList.push('') // not used
            TD5.elementList.push('') // not used
            TD5.elementList.push('') // not used
            TD5.elementList.push('OA')
            TD5.elementList.push(_.get(element, 'placeOfReceiptCode'))
            loopObjectList.push(TD5)
          }
        }
        else
        {
          const TD5: JSONObject = {
            segement : 'TD5',
            elementList : []
          }
          TD5.elementList.push('O')
          TD5.elementList.push('2')
          TD5.elementList.push(_.get(element, 'carrierCode'))
          loopObjectList.push(TD5)
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
            TD3.elementList.push('', '', '', '', '') // not used
            TD3.elementList.push(_.get(container, 'sealNo1'))
            if (_.get(container, 'containerTypeCode') === '20OT')
            {
              TD3.elementList.push('2251')
            }
            else if (_.get(container, 'containerTypeCode') === '40OT')
            {
              TD3.elementList.push('4351')
            }
            else if (_.get(container, 'containerTypeCode') === '40HRF')
            {
              TD3.elementList.push('4662')
            }
            else if (_.get(container, 'containerTypeCode') === '45HRF')
            {
              TD3.elementList.push('9532')
            }
            else if (_.get(container, 'containerTypeCode') === '20RF')
            {
              TD3.elementList.push('2232')
            }
            else if (_.get(container, 'containerTypeCode') === '40RF')
            {
              TD3.elementList.push('4332')
            }
            else if (_.get(container, 'containerTypeCode') === '40HC')
            {
              TD3.elementList.push('4500')
            }
            else if (_.get(container, 'containerTypeCode') === '45HC')
            {
              TD3.elementList.push('9500')
            }
            else
            {
              TD3.elementList.push('')
            }
            loopObjectList.push(TD3)
          }
        }
        const REF: JSONObject = {
            segement: 'REF',
            elementList: []
        }
        const refNO = (_.get(element, 'service') === 'CFS' || 'CY') ? 'CFS/CF' : 'MICP'
        REF.elementList.push('KK', refNO)
        loopObjectList.push(REF)
        if (_.get(element, 'estimatedDepartureDate'))
        {
          const DTM: JSONObject = {
              segement : 'DTM',
              elementList : []
          }
          DTM.elementList.push('370')
          DTM.elementList.push(moment(_.get(element, 'estimatedDepartureDate')).format('YYYYMMDD'))
          loopObjectList.push(DTM)
        }
        if (_.get(element, 'estimatedArrivalDate'))
        {
          const DTM: JSONObject = {
              segement : 'DTM',
              elementList : []
          }
          DTM.elementList.push('371')
          DTM.elementList.push(moment(_.get(element, 'estimatedArrivalDate')).format('YYYYMMDD'))
          loopObjectList.push(DTM)
        }
        const V1: JSONObject = {
          segement : 'V1',
          elementList : []
        }
        V1.elementList.push(_.get(element, 'carrierCode'))
        V1.elementList.push(_.get(element, 'vesselName'))
        V1.elementList.push('')// not used
        V1.elementList.push(_.get(element, 'voyageFlightNumber'))
        loopObjectList.push(V1)
      }
      else
      {
        const HLO: JSONObject = {
          segement : 'HL',
          elementList : []
        }
        HLO.elementList.push(i)
        HLO.elementList.push('1')
        HLO.elementList.push('O')
        loopObjectList.push(HLO)
        const PRF: JSONObject = {
          segement : 'PRF',
          elementList : []
        }
        PRF.elementList.push(_.get(element, 'poNo'))
        if (_.get(element, 'poDate'))
        {
          PRF.elementList.push('', '') // not used
          PRF.elementList.push(moment(_.get(element, 'poDate')).format('YYYYMMDD'))
        }
        loopObjectList.push(PRF)

        const ItemList = _.get(element, 'bookingPOPackings') // find packing# however in this case packing# same as Item #
        const totalItemNo = ItemList.length
        let index = 1
        let itemIndex = 0
        while (index <=  totalItemNo)
        {
          const HLI: JSONObject = {
            segement : 'HL',
            elementList : []
          }
          HLI.elementList.push(i + index)
          HLI.elementList.push(i)
          HLI.elementList.push('I')
          loopObjectList.push(HLI)
          const LIN: JSONObject = {
            segement : 'LIN',
            elementList : []
          }
          LIN.elementList.push((totalItemNo - itemIndex).toString())
          LIN.elementList.push('SK')
          LIN.elementList.push(_.get(ItemList[itemIndex], 'style'))
          LIN.elementList.push('BO')
          LIN.elementList.push(_.get(ItemList[itemIndex], 'colorDesc'))
          LIN.elementList.push('IZ')
          LIN.elementList.push(_.get(ItemList[itemIndex], 'size'))
          LIN.elementList.push('')
          LIN.elementList.push('')
          LIN.elementList.push('')
          LIN.elementList.push('')
          loopObjectList.push(LIN)
          const SLN: JSONObject = {
            segement: 'SLN',
            elementList : []
          }
          SLN.elementList.push('1')
          SLN.elementList.push('')// not used
          SLN.elementList.push('I')
          SLN.elementList.push(_.get(ItemList[itemIndex], 'bookQuantity').toString())
          SLN.elementList.push('PC')
          loopObjectList.push(SLN)
          if (_.get(ItemList[itemIndex], 'bookWeight'))
            {
                const MEA: JSONObject = {
                  segement: 'MEA',
                  elementList: []
              }
              MEA.elementList.push('', 'WT', _.get(ItemList[itemIndex], 'bookWeight'),  'KG')
              loopObjectList.push(MEA)
            }
          if (_.get(ItemList[itemIndex], 'bookVolume'))
          {
              const MEA: JSONObject = {
                segement: 'MEA',
                elementList: []
            }
            MEA.elementList.push('', 'VOL', _.get(ItemList[itemIndex], 'bookQuantity'),  'CO')
            loopObjectList.push(MEA)
          }
          const MEANUM: JSONObject = {
            segement: 'MEA',
            elementList: []
          }
          MEANUM.elementList.push('', 'NUM', 1,  'CT')
          loopObjectList.push(MEANUM)
          if (_.get(ItemList[itemIndex], 'bookQuantity'))
          {
            const MEA: JSONObject = {
                segement: 'MEA',
                elementList: []
            }
            MEA.elementList.push('', 'SU', _.get(ItemList[itemIndex], 'bookQuantity'),  'PC')
            loopObjectList.push(MEA)
          }

          index++
          itemIndex++
        }
        i += index
      }
    }
    return loopObjectList
  }

}
