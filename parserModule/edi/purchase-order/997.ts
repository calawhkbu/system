import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'

const moment = require('moment')
const _ = require('lodash')

export const formatJson = {
  removeCharacter: [],
  segmentSeperator: ['\r\n'],
  // elementSeperator: ['*'],
  elementSeperator: ['']
} as EdiFormatJson

interface JSONObject {
  segement?: string,
  elementList?: any[]
}

export default class EdiParser997 extends BaseEdiParser {
    constructor(
        protected readonly allService: {
          swivelConfigService: SwivelConfigService,
          outboundService: OutboundService,
        },
      ) {
        super(allService, {}, { export: { formatJson, ediType: '997' } })
      }

  async export(entityJSON: any[]| (any[])[]): Promise<any> {
    const returnJSON = {}
    const data = []
    const ISA: JSONObject = {
        segement: 'ISA',
        elementList : []
    }
    const currantDate = moment().toDate()
    const testIndicator = _.get(entityJSON[0], 'testOrProd')
    const testMapper = {
      Prod: 'p',
      Test: 'T'
    }
    ISA.elementList.push('00', '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', '00',
     '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', _.get(entityJSON[0], 'ISAReceiverQl'), _.get(entityJSON[0], 'ISAReceiverId'), _.get(entityJSON[0], 'ISASenderIdQl'), _.get(entityJSON[0], 'ISASenderId'), moment(currantDate).format('YYMMDD'), moment(currantDate).format('HHmm'), 'U', '00403', _.get(entityJSON[0], 'interchangeControlNumber'), '0', testMapper[testIndicator], '>')
    data.push(ISA)
    const GS: JSONObject = {
        segement: 'GS',
        elementList: []
    }
    const applicationsenderId = _.get(entityJSON[0], 'senderId')
    const senderIdMapper = {
      GXS: '6112390050',
      Inovis: '6112391050',
      InterTrade: '6112392050'
    }
    GS.elementList.push('FA', _.get(entityJSON[0], 'receiverId'), (senderIdMapper[applicationsenderId] || applicationsenderId), moment(currantDate).format('YYYYMMDD'), moment(currantDate).format('HHmm'), _.get(entityJSON[0], 'dataInterchangeControlNumber'), 'X', _.get(entityJSON[0], 'versionId'))
    data.push(GS)

    let lengthOfPreviousData = data.length

    const ST: JSONObject = {
        segement: 'ST',
        elementList : []
    }
    ST.elementList.push('997', `000017`)
    data.push(ST)
    const AK1: JSONObject = {
        segement: 'AK1',
        elementList: []
    }
    AK1.elementList.push('PO', _.get(entityJSON[0], `00001`))
    data.push(AK1)
    const AK9: JSONObject = {
      segement: 'AK9',
      elementList: []
    }
    if (_.get(entityJSON[0], 'outboundSuccess'))
    {
      const noOfST = entityJSON.length
      const loopObjectList: any[] = []
      loopObjectList.push(this.getLoopObject(loopObjectList, entityJSON[0], noOfST))
      const filteredList = loopObjectList.filter(value => Object.keys(value).length !== 0)
      const segementErrorList = _.get(entityJSON[0], 'errors').filter(x => x.category === 'segementError' || x.category === 'elementError')
      const segementuniqueList = [...new Set(segementErrorList.map(x => x.mainHeadIndex))]
      console.log(segementuniqueList.length)
      data.push(...filteredList)
      if (segementErrorList.length === 0)
      {
        AK9.elementList.push('A')
      }
      else
      {
        AK9.elementList.push('P')
      }
      AK9.elementList.push(_.get(entityJSON[0], 'noSent').toString())
      AK9.elementList.push(entityJSON.length.toString())
      AK9.elementList.push((entityJSON.length - segementuniqueList.length).toString())
    }
    else {
      AK9.elementList.push('R')
    }
    data.push(AK9)

    const SE: JSONObject = {
      segement : 'SE',
      elementList: []
    }
    SE.elementList.push((data.length - lengthOfPreviousData + 1).toString())
    SE.elementList.push(`000017`)
    data.push(SE)
    lengthOfPreviousData += data.length

    const GE: JSONObject = {
      segement: 'GE',
      elementList : []
    }
    GE.elementList.push(entityJSON.length.toString(), _.get(entityJSON[0], 'dataInterchangeControlNumber'))
    data.push(GE)
    const IEA: JSONObject = {
      segement: 'IEA',
      elementList : []
    }
    IEA.elementList.push('1', _.get(entityJSON[0], 'interchangeControlNumber'))
    data.push(IEA)
    _.set(returnJSON, 'data', data)
    // return returnJSON
    const result = await super.export(returnJSON)
    const resultList: any[] = []
    resultList.push(result)
    return result
  }
  async getLoopObject(loopObjectList, element, noOfSt)
  {
    const errorList = _.get(element, 'errors')

    for (let i = 1; i < noOfSt + 1; i++)
    {
      const segementErrorList: any [] = errorList.filter(x => x.category === 'segementError' && x.mainHeadIndex === i)
      const AK2: JSONObject = {
        segement: 'AK2',
        elementList: []
      }
      const strIndex = i.toString()
      const pad = '0000'
      const strIndexWithFormat = `${pad.substring(0, pad.length - strIndex.length)}${strIndex}`
      AK2.elementList.push(_.get(element, 'ediType'), strIndexWithFormat)
      loopObjectList.push(AK2)
      const segementErrorMapper = {
        'Unrecognized SegmentID': '1',
        'Unexpected Segment': '2'
      }
      if (segementErrorList.length)
      {
        let loopIndex = 1
        for (const segementError of segementErrorList)
        {
          if (segementErrorMapper[segementError.errorType])
          {
            const AK3: JSONObject = {
              segement: 'AK3',
              elementList: []
            }
            AK3.elementList.push(segementError.errorID, segementError.afterMainHeadLocation.toString() , loopIndex.toString(), segementErrorMapper[segementError.errorType])
            loopObjectList.push(AK3)
          }
          loopIndex++
        }
        const AK5: JSONObject = {
          segement: 'AK5',
          elementList: []
        }
        AK5.elementList.push('E')
        AK5.elementList.push('5')
        loopObjectList.push(AK5)
      }
      else
      {
        const AK5: JSONObject = {
          segement: 'AK5',
          elementList: []
        }
        AK5.elementList.push('A')
        loopObjectList.push(AK5)
      }

    }

  }

}
