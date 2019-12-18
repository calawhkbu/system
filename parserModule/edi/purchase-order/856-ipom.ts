import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'

const moment = require('moment')
const _ = require('lodash')
const {from} = require('rxjs')
const {groupBy, mergeMap, toArray} = require('rxjs/operators')

export const formatJson = {
  removeCharacter: [],
  segmentSeperator: ['~\r\n'],
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
    const controlNo = await this.getNewSeq(process.env.NODE_ENV === 'production' ? '856-ipom' : '856-ipom-dev')
    ISA.elementList.push('00', '          ', '00',
    '          ', '12', '718978080      ', '08' , '6112390050     ' , moment(currantDate).format('YYMMDD'), moment(currantDate).format('HHmm'), 'U', '00403', controlNo, '0', 'P', '>')
    data.push(ISA)
    const GS: JSONObject = {
        segement: 'GS',
        elementList: []
    }
    GS.elementList.push('SH', '718978080', '6112390050', moment(currantDate).format('YYYYMMDD'), moment(currantDate).format('HHmm'), parseInt(controlNo, 10), 'X', '004030VICS')
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
      BSN.elementList.push(_.get(element, 'bookingNo').substring(0, 30))
      BSN.elementList.push(moment(_.get(element, 'createdAt')).format('YYYYMMDD'))
      BSN.elementList.push(moment(_.get(element, 'createdAt')).format('HHmm'))
      BSN.elementList.push('0004')
      data.push(BSN)
      const loopObjectList: any[] = []
      const getNumOfLoopItem = 1 + (_.get(element, 'bookingPOPackings').length) + this.getNumOfPo(_.get(element, 'bookingPOPackings'))
      loopObjectList.push(this.getLoopObject(loopObjectList, getNumOfLoopItem, element))
      const filteredList = loopObjectList.filter(value => Object.keys(value).length !== 0)
      data.push(...filteredList)
      await this.removeEmptyElementListObject(data)
      const CTT: JSONObject = {
        segement : 'CTT',
        elementList : []
      }
      CTT.elementList.push(getNumOfLoopItem.toString().substring(0, 6))
      data.push(CTT)

      const SE: JSONObject = {
        segement : 'SE',
        elementList: []
      }
      SE.elementList.push((data.length - lengthOfPreviousData + 1).toString().substring(0, 6))
      SE.elementList.push(`${pad.substring(0, pad.length - index.toString().length)}${index}`)
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
  async removeEmptyElementListObject(data)
  {
    for (let i = data.length - 1; i >= 0; i--)
    {
      let noEmpty = false
      for (const element of data[i].elementList)
      {
        if (element.trim())
        {
          noEmpty = true
          break
        }
      }
      if (noEmpty === false)
      {
        data.splice(i, 1)
      }
    }
    return data
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
        HL.elementList.push(i.toString().substring(0, 12))
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
            if (_.get(booking, 'bookCtns'))
            {
              numberOfPacking += _.get(booking, 'bookCtns')
            }
          }
          if (totalWeight > 0)
          {
            const MEA: JSONObject = {
              segement: 'MEA',
              elementList: []
            }
            totalWeight = Number.parseFloat(totalWeight.toPrecision(5))
            MEA.elementList.push('')// not used
            MEA.elementList.push( 'WT', totalWeight.toString().substring(0, 20), 'KG')
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
            MEA.elementList.push( 'VOL', totalVolume.toString().substring(0, 20), 'CO')
            loopObjectList.push(MEA)
          }
          if (numberOfPacking > 0)
          {
            const MEA: JSONObject = {
              segement: 'MEA',
              elementList: []
            }
            MEA.elementList.push('')// not used
            MEA.elementList.push( 'NM', numberOfPacking.toString().substring(0, 20), 'CT')
            loopObjectList.push(MEA)
          }
          if (totalShipUnit > 0)
          {
            const MEA: JSONObject = {
              segement: 'MEA',
              elementList: []
            }
            MEA.elementList.push('')// not used
            MEA.elementList.push( 'SU', totalShipUnit.toString().substring(0, 20), 'PC')
            loopObjectList.push(MEA)
          }
        }
        const carrierCode = _.get(element, 'carrierCode')
        const pad2 = '    '
        const scacMapper = {
          MSC: 'MSCU',
          HII: 'HLCU',
          HSU: 'SUDU',
          ONE: 'ONEY',
        }
        const scac = scacMapper[carrierCode] || `${carrierCode}${pad2.substring(0, pad2.length - carrierCode.toString().length)}`
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
            TD5.elementList.push(scac)
            TD5.elementList.push('')// not used
            TD5.elementList.push(' ')// not used
            TD5.elementList.push('  ')// not used
            TD5.elementList.push('KL')
            TD5.elementList.push(_.get(element, 'portOfLoading').substring(0, 30))
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
            TD5.elementList.push(scac)
            TD5.elementList.push('')// not used
            TD5.elementList.push(' ')// not used
            TD5.elementList.push('  ')// not used
            TD5.elementList.push('PB')
            TD5.elementList.push(_.get(element, 'portOfDischarge').substring(0, 30))
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
            TD5.elementList.push(scac)
            TD5.elementList.push('') // not used
            TD5.elementList.push(' ') // not used
            TD5.elementList.push('  ') // not used
            TD5.elementList.push('OA')
            TD5.elementList.push(_.get(element, 'placeOfReceiptCode').substring(0, 30))
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
          TD5.elementList.push(scac)
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
            // const isoCodeMapper = {
            //   '20OT': 2251,
            //   '40OT': 4351,
            //   '40HRF': 4662,
            //   '45HRF': 9532,
            //   '20RF': 2232,
            //   '40RF': 4332,
            //   '40HC': 4500,
            //   '45HC': 9500,
            // }
            TD3.elementList.push('  ') // not used
            TD3.elementList.push((_.get(container, 'containerNo') || ' ').substring(0, 4))
            TD3.elementList.push((_.get(container, 'containerNo') || ' ').substring(4, 10))
            if (_.get(container, 'sealNo1') && _.get(container, 'sealNo1'))
            {
              TD3.elementList.push('', '', '', '', '') // not used
              TD3.elementList.push(_.get(container, 'sealNo1'))
              TD3.elementList.push(_.get(container, 'isoNo'))
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
        const vesselCode = _.get(element, 'vesselCode')
        const pad = '        '
        const vesselCodeWithLength = `${vesselCode}${pad.substring(0, pad.length - vesselCode.toString().length)}`.substring(0, 8)
        V1.elementList.push(vesselCodeWithLength)
        V1.elementList.push((_.get(element, 'vesselName') || '').substring(0, 28) )
        V1.elementList.push('')// not used
        V1.elementList.push((_.get(element, 'voyageFlightNumber') || '').substring(0, 10))
        loopObjectList.push(V1)
      }
      else
      {
        const ItemList = _.get(element, 'bookingPOPackings')
        const source = from(ItemList)
        const grouped = source.pipe(
          groupBy(item => item.poNo),
          // return each item in group as array
          mergeMap(group => group.pipe(toArray()))
        )
        const poList = []
        grouped.subscribe(val => poList.push(val))
        // for (const groupValue of grouped)
        // console.log(groupValue)
        let index = 1
        for (const subPoList of poList)
        {
          let itemIndex = 0
          const HLO: JSONObject = {
            segement : 'HL',
            elementList : []
          }
          HLO.elementList.push(i.toString().substr(0, 12))
          HLO.elementList.push('1')
          HLO.elementList.push('O')
          loopObjectList.push(HLO)
          const PRF: JSONObject = {
            segement : 'PRF',
            elementList : []
          }
          PRF.elementList.push(_.get(subPoList[0], 'poNo').substring(0, 10))
          if (_.get(subPoList[0], 'poDate'))
          {
            PRF.elementList.push('', '') // not used
            PRF.elementList.push(moment(_.get(subPoList[0], 'poDate')).format('YYYYMMDD'))
          }
          loopObjectList.push(PRF)
          const carrierCode = _.get(element, 'carrierCode')
          const pad2 = '    '
          const scacMapper = {
            MSC: 'MSCU',
            HII: 'HLCU',
            HSU: 'SUDU',
            ONE: 'ONEY',
          }
          const scac = scacMapper[carrierCode] || `${carrierCode}${pad2.substring(0, pad2.length - carrierCode.toString().length)}`
          if (_.get(subPoList[0], 'pol') || _.get(element, 'portOfLoading'))
          {
            const TD5: JSONObject = {
              segement : 'TD5',
              elementList : []
            }
            TD5.elementList.push('O')
            TD5.elementList.push('2')
            TD5.elementList.push(scac)
            TD5.elementList.push('') // not used
            TD5.elementList.push(' ') // not used
            TD5.elementList.push('  ') // not used
            TD5.elementList.push('OR')
            TD5.elementList.push((_.get(subPoList[0], 'pol') || _.get(element, 'portOfLoading')).substring(0, 30))
            loopObjectList.push(TD5)
          }
          if (_.get(subPoList[0], 'pod') || _.get(element, 'portOfDischarge'))
          {
            const TD5: JSONObject = {
              segement : 'TD5',
              elementList : []
            }
            TD5.elementList.push('O')
            TD5.elementList.push('2')
            TD5.elementList.push(scac)
            TD5.elementList.push('') // not used
            TD5.elementList.push(' ') // not used
            TD5.elementList.push('  ') // not used
            TD5.elementList.push('DL')
            TD5.elementList.push((_.get(subPoList[0], 'pod') || _.get(element, 'portOfDischarge')).substring(0, 30))
            loopObjectList.push(TD5)
          }

          // const ItemList = _.get(element, 'bookingPOPackings') // find packing# however in this case packing# same as Item #
          const totalItemNo = subPoList.length

          const bookingReferences = _.get(element, 'bookingReferences') || []
          if (bookingReferences.length)
          {
            for (const ref of bookingReferences)
            {
              const refMapper = {
                MBL: 'BM',
              }
              const refName = _.get(ref, 'refName')
              if (refMapper[refName])
              {
                const REF: JSONObject = {
                  segement : 'REF',
                  elementList : []
                }
                REF.elementList.push(refMapper[refName], _.get(ref, 'refDescription'))
                loopObjectList.push(REF)
              }
            }
          }
          const invoiceNo = _.get(element, 'invoiceNo')
          if (invoiceNo)
          {
            const REF: JSONObject = {
              segement : 'REF',
              elementList : []
            }
            REF.elementList.push('IK', invoiceNo)
            loopObjectList.push(REF)
          }
          while (itemIndex < totalItemNo)
          {
            const HLI: JSONObject = {
              segement : 'HL',
              elementList : []
            }
            HLI.elementList.push((i + itemIndex + 1).toString().substring(0, 12))
            HLI.elementList.push(i.toString().substring(0, 12))
            HLI.elementList.push('I')
            loopObjectList.push(HLI)
            const LIN: JSONObject = {
              segement : 'LIN',
              elementList : []
            }
            LIN.elementList.push(index.toString().substring(0, 6))
            LIN.elementList.push('SK')
            LIN.elementList.push((_.get(subPoList[itemIndex], 'style') || ' ').substring(0, 30))
            LIN.elementList.push('BO')
            LIN.elementList.push((_.get(subPoList[itemIndex], 'colorDesc') || ' ').substring(0, 30))
            LIN.elementList.push('IZ')
            LIN.elementList.push((_.get(subPoList[itemIndex], 'size') || ' ').substring(0, 30))
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
            SLN.elementList.push((_.get(subPoList[itemIndex], 'bookQuantity') || ' ').toString().substring(0, 15))
            SLN.elementList.push('PC')
            loopObjectList.push(SLN)
            if (_.get(ItemList[itemIndex], 'bookWeight'))
              {
                  const MEA: JSONObject = {
                    segement: 'MEA',
                    elementList: []
                }
                MEA.elementList.push('', 'WT', (_.get(subPoList[itemIndex], 'bookWeight') || ' ').toString().substring(0, 20),  'KG')
                loopObjectList.push(MEA)
              }
            if (_.get(ItemList[itemIndex], 'bookVolume'))
            {
                const MEA: JSONObject = {
                  segement: 'MEA',
                  elementList: []
              }
              MEA.elementList.push('', 'VOL', (_.get(subPoList[itemIndex], 'bookVolume') || ' ').toString().substring(0, 20),  'CO')
              loopObjectList.push(MEA)
            }
            if (_.get(subPoList[itemIndex], 'bookCtns'))
            {
              const MEANUM: JSONObject = {
                segement: 'MEA',
                elementList: []
              }
              MEANUM.elementList.push('', 'NUM', (_.get(subPoList[itemIndex], 'bookCtns') || ' ').toString().substring(0, 20),  'CT')
              loopObjectList.push(MEANUM)
            }
            if (_.get(ItemList[itemIndex], 'bookQuantity'))
            {
              const MEA: JSONObject = {
                  segement: 'MEA',
                  elementList: []
              }
              MEA.elementList.push('', 'SU', (_.get(subPoList[itemIndex], 'bookQuantity') || ' ').toString().substring(0, 20),  'PC')
              loopObjectList.push(MEA)
            }

            index++
            itemIndex++
          }
          i += itemIndex + 1
        }
      }
    }
    return loopObjectList
  }
  getNumOfPo(Item) {
    const uniquePo = []
    for (const po of Item) {
      if (!uniquePo.includes(po.poNo)) {
        uniquePo.push(po.poNo)
      }
    }
    return uniquePo.length
  }

}
