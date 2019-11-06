import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'
import { History } from 'models/main/history'

const moment = require('moment')
const _ = require('lodash')

export const formatJson = {
  removeCharacter: [],
  segmentSeperator: ['~\r\n'],
  // elementSeperator: ['*'],
  elementSeperator: [''],
} as EdiFormatJson

interface JSONObject {
  segment?: string
  elementList?: any[]
}

export default class EdiParser997 extends BaseEdiParser {
  constructor(
    protected readonly allService: {
      swivelConfigService: SwivelConfigService
      outboundService: OutboundService
    }
  ) {
    super(allService, {}, { export: { formatJson, ediType: '315' } })
  }

  async export(entityJSON: any[] | (any[])[]): Promise<any> {
    const resultList: any[] = []
    for (const element of entityJSON)
    {
      // const details = _.get(element, 'details')
      // if (!details) {
      //   throw Error('no details')
      // }
      console.log(element)
      const containerList = _.get(element, 'trackingContainers') || []
      console.log(containerList)
      if (containerList.length) {
        for (const container of containerList) {
          const returnJSON = {}
          const data = []
          const ISA: JSONObject = {
            segment: 'ISA',
            elementList: [],
          }
          const currantDate = moment().toDate()
          const containerNo = _.get(container, 'containerNo')
          // const controlNo = (containerNo  || '').substr(4)
          const pad = '000000000'
          const controlNo = await this.getNewSeq(process.env.NODE_ENV === 'production' ? '315' : '315-dev')
          ISA.elementList.push(
            '00',
            '          ',
            '00',
            '          ',
            '12',
            '718978080      ',
            '08',
            '6112390050     ',
            moment(currantDate).format('YYMMDD'),
            moment(currantDate).format('HHmm'),
            'U',
            '00401',
            controlNo.substring(0, 9),
            '0',
            'P',
            '>'
          )
          data.push(ISA)
          const GS: JSONObject = {
            segment: 'GS',
            elementList: [],
          }

          GS.elementList.push(
            'QO',
            '718978080',
            '6112390050',
            moment(currantDate).format('YYYYMMDD'),
            moment(currantDate).format('HHmm'),
            parseInt(controlNo, 10),
            'X',
            '004030VICS'
          )
          data.push(GS)

          const lengthOfPreviousData = data.length

          const ST: JSONObject = {
            segment: 'ST',
            elementList: [],
          }
          ST.elementList.push('315', `0001`)
          data.push(ST)
          const historyList = _.get(container, 'trackingStatus')
          historyList.sort(function(a, b) {
            if (!a.statusDate) {
              return -1
            }

            if (!b.statusDate) {
              return 1
            }

            return moment(a.statusDate) - moment(b.statusDate)
          })
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
            RCVE: 'RD',
          }
          const emptyLoadMapper = {
            GITM: 'E',
            DLPT: 'L',
            BDAR: 'L',
            DSCH: 'E',
            DECL: 'L',
            PASS: 'L',
            TMPS: 'L',
            RCVE: 'E',
          }
          const isoCodeMapper = {
            '20OT': 2251,
            '40OT': 4351,
            '40HRF': 4662,
            '45HRF': 9532,
            '20RF': 2232,
            '40RF': 4332,
            '40HC': 4500,
            '45HC': 9500,
          }
          const countryCodeMapper = {
            GITM: 'portOfLoading',
            LOBD: 'portOfLoading',
            DLPT: 'portOfLoading',
            BDAR: 'portOfDischarge',
            DSCH: 'portOfDischarge',
            PSCG: 'portOfDischarge',
            DECL: 'portOfDischarge',
            PASS: 'portOfDischarge',
            TMPS: 'portOfDischarge',
            STCS: 'placeOfDelivery',
            RCVE: 'placeOfDelivery',
            BKCF: 'placeOfReceipt',
            EPRL: 'placeOfReceipt',
            STSP: 'placeOfReceipt',
          }
          const B4: JSONObject = {
            segment: 'B4',
            elementList: [],
          }
          const trackingRefInf = _.get(element, 'trackingReference') || {}
          const flexDataInf = _.get(trackingRefInf, 'flexData') || {}
          const bookingInf = _.get(flexDataInf, 'data')
          const statusCode = _.get(currentStatus, 'statusCode')
          let country = _.get(bookingInf, countryCodeMapper[statusCode])
          if (!country)
          {
            switch (countryCodeMapper[statusCode])
            {
              case 'placeOfDelivery': {
              country = _.get(bookingInf, 'portOfDischarge')
              break
              }
              case  'placeOfReceipt': {
              country = _.get(bookingInf, 'portOfLoading')
              break
              }
            }
          }
          B4.elementList.push('', '') // not used
          B4.elementList.push(
            statusCodeMapper[statusCode],
            moment(_.get(currentStatus, 'statusDate')).format('YYYYMMDD'),
            moment(_.get(currentStatus, 'statusDate')).format('HHmm')
          )
          B4.elementList.push('') // not used
          B4.elementList.push(
            (_.get(container, 'containerNo') || '').substr(0, 4),
            (_.get(container, 'containerNo') || '').substr(4, 10)
          )
          B4.elementList.push(
            emptyLoadMapper[_.get(currentStatus, 'statusCode')] || '',
            isoCodeMapper[_.get(container, 'container')] || ' ',
          )
          B4.elementList.push((country || '').substring(0, 30))
          B4.elementList.push('UN')
          B4.elementList.push(' ') // No Equipment Check Digit
          data.push(B4)

          if (bookingInf) {
            if (_.get(bookingInf, 'bookingNo')) {
              const N9: JSONObject = {
                segment: 'N9',
                elementList: [],
              }
              N9.elementList.push('BN', _.get(bookingInf, 'bookingNo').substring(0, 18), 'ORIGINAL BKG NBR')
              data.push(N9)
            }
            const Q2: JSONObject = {
              segment: 'Q2',
              elementList: [],
            }
            Q2.elementList.push((_.get(bookingInf, 'vesselCode') || ' ').substring(0, 8))
            Q2.elementList.push('  ')
            for (
              let i = 0;
              i < 6;
              i++ // not used
            ) {
              Q2.elementList.push('')
            }
            Q2.elementList.push(_.get(bookingInf, 'voyageFlightNumber').substring(0, 10))
            for (
              let i = 0;
              i < 3;
              i++ // not used
            ) {
              Q2.elementList.push('')
            }
            Q2.elementList.push((_.get(bookingInf, 'vesselName') || '  ' ).substring(0, 28))
            data.push(Q2)
          }

          const loopObjectList: any[] = []
          loopObjectList.push(this.getLoopObject(loopObjectList, historyList, bookingInf))
          const filteredList = loopObjectList.filter(value => Object.keys(value).length !== 0)
          data.push(...filteredList)
          await this.removeEmptyElementListObject(data)
          const SE: JSONObject = {
            segment: 'SE',
            elementList: [],
          }
          SE.elementList.push((data.length - lengthOfPreviousData + 1).toString())
          SE.elementList.push(`0001`)
          data.push(SE)

          const GE: JSONObject = {
            segment: 'GE',
            elementList: [],
          }
          GE.elementList.push('1', parseInt(controlNo, 10))
          data.push(GE)
          const IEA: JSONObject = {
            segment: 'IEA',
            elementList: [],
          }
          IEA.elementList.push('1', controlNo)
          data.push(IEA)
          _.set(returnJSON, 'data', data)
          // return returnJSON
          const result = await super.export(returnJSON)
          // return result
          resultList.push(result)
        }
      }
    }
    return resultList
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
  async getLoopObject(loopObjectList, historyList, extraData) {
    const noOfhistory = historyList.length
    const functionalCodeMapper = {
      BKCF: 'R',
      EPRL: 'R',
      STSP: 'R',
      GITM: 'L',
      LOBD: 'L',
      DLPT: 'L',
      TSLB: 'I',
      TSDC: 'I',
      BDAR: 'D',
      DSCH: 'D',
      PSCG: 'D',
      DECL: 'D',
      PASS: 'D',
      TMPS: 'D',
      STCS: 'E',
      RCVE: 'E',
    }
    const countryMapper = {
      L : 'portOfLoading',
      D : 'portOfDischarge',
      E : 'placeOfDelivery',
      R : 'placeOfReceipt'
    }
    for (let i = 0; i < noOfhistory; i++) {
      const R4: JSONObject = {
        segment: 'R4',
        elementList: [],
      }
      const statusCode = historyList[i].statusCode
      if (functionalCodeMapper[statusCode]) {
        let country = _.get(extraData, countryMapper[functionalCodeMapper[statusCode]])
        if (!country)
        {
          switch (countryMapper[functionalCodeMapper[statusCode]])
          {
            case 'placeOfDelivery': {
            country = _.get(extraData, 'portOfDischarge')
            break
            }
            case  'placeOfReceipt': {
            country = _.get(extraData, 'portOfLoading')
            break
            }
          }
        }
        const countryCode = (country || 'XX').substring(0, 2)
        if (i === noOfhistory - 1)
        {
          R4.elementList.push('5')
        }
        else
        {
          R4.elementList.push(functionalCodeMapper[statusCode])
        }
        R4.elementList.push('UN', (country || '').substring(0, 30))
        R4.elementList.push('') // not used
        R4.elementList.push(countryCode)
        R4.elementList.push('', '') // not used
        R4.elementList.push('') // State or Province Code
        loopObjectList.push(R4)
        if (_.get(historyList[i], 'isEstimated') === false && _.get(historyList[i], 'statusDate')) {
          const DTM: JSONObject = {
            segment: 'DTM',
            elementList: [],
          }
          DTM.elementList.push(
            '140',
            moment(_.get(historyList[i], 'statusDate')).format('YYYYMMDD'),
            moment(_.get(historyList[i], 'statusDate')).format('HHmm')
          )
          // DTM.elementList.push('  ') // no time code
          loopObjectList.push(DTM)
        }
      }
    }
    // const statusCode = historyList[noOfhistory - 1].statusCode
    // let country = _.get(extraData, countryMapper[functionalCodeMapper[statusCode]])
    // if (!country)
    // {
    //   switch (countryMapper[functionalCodeMapper[statusCode]])
    //   {
    //     case 'placeOfDelivery': {
    //     country = _.get(extraData, 'portOfDischarge')
    //     break
    //     }
    //     case  'placeOfReceipt': {
    //     country = _.get(extraData, 'portOfLoading')
    //     break
    //     }
    //   }
    // }
    // const countryCode = (country || 'XX').substring(0, 2)
    // const R4: JSONObject = {
    //   segment: 'R4',
    //   elementList: [],
    // }
    // R4.elementList.push('5', 'UN', _.get(historyList[noOfhistory - 1], 'statusPlace').substr(0, 30))
    // R4.elementList.push('') // not used
    // R4.elementList.push(countryCode) // No country code
    // R4.elementList.push('', '') // not used
    // R4.elementList.push('') // State or Province Code
    // loopObjectList.push(R4)
    // if (
    //   _.get(historyList[noOfhistory - 1], 'isEstimated') === false &&
    //   _.get(historyList[noOfhistory - 1], 'statusDate')
    // ) {
    //   const DTM: JSONObject = {
    //     segment: 'DTM',
    //     elementList: [],
    //   }
    //   DTM.elementList.push(
    //     '140',
    //     moment(_.get(historyList[noOfhistory - 1], 'statusDate')).format('YYYYMMDD'),
    //     moment(_.get(historyList[noOfhistory - 1], 'statusDate')).format('HHmm')
    //   )
    //   // DTM.elementList.push('') // no time code
    //   loopObjectList.push(DTM)
    // }
    return loopObjectList
  }
}
