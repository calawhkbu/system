import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'
import { History } from 'models/main/history'

const moment = require('moment')
const _ = require('lodash')

export const formatJson = {
  removeCharacter: [],
  segmentSeperator: ['\r\n'],
  // elementSeperator: ['*'],
  elementSeperator: ['']
} as EdiFormatJson

interface JSONObject {
  segment?: string,
  elementList?: any[]
}

export default class EdiParser997 extends BaseEdiParser {
    constructor(
        protected readonly allService: {
          swivelConfigService: SwivelConfigService,
          outboundService: OutboundService,
        },
      ) {
        super(allService, {}, { export: { formatJson, ediType: '315' } })
      }

  async export(entityJSON: any[]| (any[])[]): Promise<any> {
    const details = _.get(entityJSON, 'details')
    if (!details)
    {
      throw Error('no details')
    }
    const resultList: any[] = []
    const containerList = (_.get(details, 'billContainerTracking') || [])
    if (containerList.length)
    {
      for (const container of containerList)
      {
        const returnJSON = {}
        const data = []
        const ISA: JSONObject = {
            segment: 'ISA',
            elementList : []
        }
        const currantDate = moment().toDate()
        const containerNo = (_.get(container, 'containerNo'))
        // const controlNo = (containerNo  || '').substr(4)
        const pad = '000000000'
        const controlNo = `${pad.substring(0, pad.length - (containerNo  || '').substr(4).length)}${(containerNo  || '').substr(4)}`
        ISA.elementList.push('00', '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', '00',
        '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', '12', '718978080', 'ZZ' , 'DILLARDSTST', moment(currantDate).format('YYMMDD'), moment(currantDate).format('HHmm'), 'U', '00401', controlNo, '0', 'P', '>')
        data.push(ISA)
        const GS: JSONObject = {
            segment: 'GS',
            elementList: []
        }

        GS.elementList.push('FA', '718978080', 'DILLARDSTST', moment(currantDate).format('YYYYMMDD'), moment(currantDate).format('HHmm'), parseInt(controlNo, 10) , 'X', '004030VICS')
        data.push(GS)

        const lengthOfPreviousData = data.length

        const ST: JSONObject = {
            segment: 'ST',
            elementList : []
        }
        ST.elementList.push('315', `0001`)
        data.push(ST)
        const historyList = _.get(container, 'history')
        historyList.sort(function(a, b)
        {
          if (!a.statusDate)
          {
            return -1
          }

          if (!b.statusDate)
          {
            return 1
          }

          return moment(a.statusDate) - moment(b.statusDate)
        }
        )
        // return historyList
        const currentStatusIndex = historyList.map(el => el.isEstimated).lastIndexOf(false)
        const currentStatus = historyList[currentStatusIndex]
        const statusCodeMapper = {
          GITM: 'I',
          DLPT: 'VD',
          BDAR: 'VA',
          DSCH: 'UV',
          DECL: 'CT',
          PASS: 'OA',
          TMPS: 'D',
          RCVE: 'RD'
        }
        const emptyLoadMapper = {
          GITM: 'E',
          DLPT: 'L',
          BDAR: 'L',
          DSCH: 'E',
          DECL: 'L',
          PASS: 'L',
          TMPS: 'L',
          RCVE: 'E'
        }
        const B4: JSONObject = {
          segment: 'B4',
          elementList : []
        }
        B4.elementList.push('', '') // not used
        B4.elementList.push(statusCodeMapper[_.get(currentStatus, 'statusCode')], moment(_.get(currentStatus, 'statusDate')).format('YYYYMMDD'), moment(_.get(currentStatus, 'statusDate')).format('HHmm'))
        B4.elementList.push('')// not used
        B4.elementList.push((_.get(container, 'containerNo') || '').substr(0, 4), (_.get(container, 'containerNo') || '').substr(4))
        B4.elementList.push((emptyLoadMapper[_.get(currentStatus, 'statusCode')] || 'E'), `${_.get(container, 'containerSize')}${_.get(container, 'containerType')}`, _.get(currentStatus, 'statusPlace').substr(0, 30))
        B4.elementList.push('UN')
        B4.elementList.push('')// No Equipment Check Digit
        data.push(B4)
        const bookingInf = _.get(entityJSON, 'booking')
        if (bookingInf)
        {
          if  (_.get(bookingInf, 'bookingNo'))
          {
            const N9: JSONObject = {
              segment: 'N9',
              elementList : []
            }
            N9.elementList.push('BN', _.get(bookingInf, 'bookingNo'), 'ORIGINAL BKG NBR')
            data.push(N9)
          }
          const Q2: JSONObject = {
            segment: 'Q2',
            elementList: []
          }
          Q2.elementList.push(_.get(bookingInf, 'vesselCode'))
          Q2.elementList.push('')
          for (let i = 0; i < 6; i++) // not used
          {
            Q2.elementList.push('')
          }
          Q2.elementList.push(_.get(bookingInf, 'voyageFlightNumber'))
          for (let i = 0; i < 3; i++) // not used
          {
            Q2.elementList.push('')
          }
          Q2.elementList.push(_.get(bookingInf, 'vesselName'))
          data.push(Q2)
          // if  (_.get(bookingInf, 'portOfLoading'))
          // {

          // }
        }

        const loopObjectList: any[] = []
        loopObjectList.push(this.getLoopObject(loopObjectList, historyList))
        const filteredList = loopObjectList.filter(value => Object.keys(value).length !== 0)
        data.push(...filteredList)
        const SE: JSONObject = {
          segment : 'SE',
          elementList: []
        }
        SE.elementList.push((data.length - lengthOfPreviousData + 1).toString())
        SE.elementList.push(`0001`)
        data.push(SE)

        const GE: JSONObject = {
          segment: 'GE',
          elementList : []
        }
        GE.elementList.push('1', parseInt(controlNo, 10))
        data.push(GE)
        const IEA: JSONObject = {
          segment: 'IEA',
          elementList : []
        }
        IEA.elementList.push('1', controlNo)
        data.push(IEA)
        _.set(returnJSON, 'data', data)
        // return returnJSON
        const result = await super.export(returnJSON)
        resultList.push(result)
      }
    }
    return resultList
  }
  async getLoopObject(loopObjectList, historyList)
  {
    const noOfhistory = historyList.length
    for (let i = 0; i < noOfhistory - 1; i++)
    {
      let noMatch = false
      const R4: JSONObject = {
        segment: 'R4',
        elementList : []
      }
      switch (historyList[i].statusCode) {
        case 'EPRL':
          R4.elementList.push('R')
          break
        case 'GITM' || 'LOBD' || 'DLPT':
          R4.elementList.push('L')
          break
        case 'BDAR' || 'PSCG' || 'DECL':
          R4.elementList.push('D')
          break
        case 'STCS':
          R4.elementList.push('D')
          break
        case 'TSLB' || 'TSDC':
          R4.elementList.push('I')
          break
        default:
          noMatch = true
      }
      if (noMatch === false)
      {
        R4.elementList.push('UN', _.get(historyList[i], 'statusPlace').substr(0, 30))
        R4.elementList.push('')// not used
        R4.elementList.push('')// No country code
        R4.elementList.push('', '')// not used
        R4.elementList.push('') // State or Province Code
        loopObjectList.push(R4)
        if (_.get(historyList[i], 'isEstimated') === false  && _.get(historyList[i], 'statusDate'))
        {
          const DTM: JSONObject = {
            segment: 'DTM',
            elementList : []
          }
          DTM.elementList.push('140', moment(_.get(historyList[i], 'statusDate')).format('YYYYMMDD'), moment(_.get(historyList[i], 'statusDate')).format('HHmm'))
          DTM.elementList.push('')// no time code
          loopObjectList.push(DTM)
        }
      }
    }
    const R4: JSONObject = {
      segment: 'R4',
      elementList : []
    }
    R4.elementList.push('5', 'UN', _.get(historyList[noOfhistory - 1], 'statusPlace').substr(0, 30))
    R4.elementList.push('')// not used
    R4.elementList.push('')// No country code
    R4.elementList.push('', '')// not used
    R4.elementList.push('') // State or Province Code
    loopObjectList.push(R4)
    if (_.get(historyList[noOfhistory - 1], 'isEstimated') === false && _.get(historyList[noOfhistory - 1], 'statusDate'))
    {
      const DTM: JSONObject = {
        segment: 'DTM',
        elementList : []
      }
      DTM.elementList.push('140', moment(_.get(historyList[noOfhistory - 1], 'statusDate')).format('YYYYMMDD'), moment(_.get(historyList[noOfhistory - 1], 'statusDate')).format('HHmm'))
      DTM.elementList.push('')// no time code
      loopObjectList.push(DTM)
    }
    return loopObjectList
  }

}
