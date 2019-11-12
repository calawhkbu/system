import { SwivelConfigService } from 'modules/swivel-config/service'
import { OutboundService } from 'modules/integration-hub/services/outbound'

import { BaseEdiParser } from 'modules/parser/parser/edi'
import { EdiFormatJson } from 'modules/edi/interface'

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
              element: '315',
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
          name: 'AK1',
          type: 'content',
          elementList: [
            {
              element: 'PO',
              type: 'hardcode',
            },
            {
              element: 'json',
              type: 'total',
            }
          ],
        },
        {
          name: 'AK2',
          type: 'content',
          jsonLocation: `errors`,
          isLoop: true,
          requirement: {
            reorder: true,
            orderBy: 'mainHeadIndex',
            groupBy2dList: true,
            groupBy: 'mainHeadIndex',
            needAdd: true,
            otherRequireField: ['ediType'],
            isFilter: true,
            filterInfoList: [
              {
                filterBy: 'mainHeadIndex',
                sign: '>',
                value: 0,
              }
            ],
            specialRequirement: false,
            function: {
              param: [
                {
                  type: 'fromJson',
                  name: 'errors'
                }
              ],
              functionName: 'dummyFunction',
              code: 'public static JToken dummyFunction(JToken json, string location){var loopList=json[$"{location}"] as JArray; loopList=HelperFunction.filter(loopList, (Func<JToken,bool>) (x => x.Value<int>("mainHeadIndex")!=0 )); loopList=HelperFunction.orderBy(loopList,(Func<JToken,dynamic>) (x => x.Value<int>("mainHeadIndex"))); var seperate = new JArray(); return seperate;}'
            },
          },
          elementList: [
            {
              element: 'extraData1',
              type: 'variable',
            },
            {
              element: 'groupElement.0.mainHeadIndex',
              type: 'variable'
            },
          ],
          subSegmentList: [
            {
              name: 'AK3',
              type: 'content',
              isLoop: true,
              jsonLocation: 'groupElement',
              requirement: {
                isFilter: true,
                filterInfoList: [
                  {
                    filterBy: 'category',
                    sign: '==',
                    value: 'segmentError',
                  }
                ],
              },
              elementList: [
                {
                  element: 'errorID',
                  type: 'variable',
                },
                {
                  element: 'afterMainHeadLocation',
                  type: 'variable'
                },
                {
                  element: '',
                  type: 'variable',
                },
                {
                  element: 'errorType',
                  type: 'variable',
                  match: {
                    'Unrecognized SegmentID': '1',
                    'Unexpected Segment': '2',
                    'Mandatory Seg Missing': '3',
                  }
                }
              ],
            },
            {
              name: 'AK4',
              type: 'content',
              isLoop: true,
              jsonLocation: 'groupElement',
              requirement: {
                isFilter: true,
                filterInfoList: [
                  {
                    filterBy: 'category',
                    sign: '==',
                    value: 'elementError',
                  }
                ],
              },
              elementList: [
                {
                  element: 'segmentPosition',
                  type: 'variable',
                },
                {
                  element: 'errorIdex',
                  type: 'variable'
                },
                {
                  element: 'errorType',
                  type: 'variable',
                  match: {
                    'Mandatory Data element missing': '1',
                    'Too many data elements': '3',
                    'Data element too short': '4',
                    'Data element too long': '5',
                    'Invalid code value': '7',
                  }
                },
                {
                  element: 'element',
                  type: 'variable',
                }
              ],
            },
          ],
        },
        {
          name: 'SE',
          type: 'content',
          elementList: [
            {
              element: 'content',
              type: 'total',
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
    super(allService, {}, { export: { formatJson, ediType: '997' } })
  }

  async export(entityJSON: any[] | (any[])[]): Promise<any> {
    const result = await super.export(entityJSON)
    return result.ediResults[0].ediContent
    const returnJSON = {}
    const data = []
    const ISA: JSONObject = {
      segment: 'ISA',
      elementList: [],
    }
    const currantDate = moment().toDate()
    const testIndicator = _.get(entityJSON, 'testOrProd')
    const testMapper = {
      Prod: 'p',
      Test: 'T',
    }
    ISA.elementList.push(
      '00',
      '          ',
      '00',
      '          ',
      _.get(entityJSON, 'ISAReceiverQl'),
      _.get(entityJSON, 'ISAReceiverId'),
      _.get(entityJSON, 'ISASenderIdQl'),
      _.get(entityJSON, 'ISASenderId'),
      moment(currantDate).format('YYMMDD'),
      moment(currantDate).format('HHmm'),
      'U',
      '00403',
      _.get(entityJSON, 'interchangeControlNumber'),
      '0',
      testMapper[testIndicator],
      '>'
    )
    data.push(ISA)
    const GS: JSONObject = {
      segment: 'GS',
      elementList: [],
    }
    const applicationsenderId = _.get(entityJSON, 'senderId')
    const senderIdMapper = {
      GXS: '6112390050',
      Inovis: '6112391050',
      InterTrade: '6112392050',
    }
    GS.elementList.push(
      'FA',
      _.get(entityJSON, 'receiverId'),
      senderIdMapper[applicationsenderId] || applicationsenderId,
      moment(currantDate).format('YYYYMMDD'),
      moment(currantDate).format('HHmm'),
      _.get(entityJSON, 'dataInterchangeControlNumber'),
      'X',
      _.get(entityJSON, 'versionId')
    )
    data.push(GS)

    let lengthOfPreviousData = data.length

    const ST: JSONObject = {
      segment: 'ST',
      elementList: [],
    }
    ST.elementList.push('997', `000001`)
    data.push(ST)
    const AK1: JSONObject = {
      segment: 'AK1',
      elementList: [],
    }
    AK1.elementList.push('PO', `00001`)
    data.push(AK1)
    const AK9: JSONObject = {
      segment: 'AK9',
      elementList: [],
    }
    if (_.get(entityJSON, 'poList').length) {
      const noOfST = _.get(entityJSON, 'noSent')
      const loopObjectList: any[] = []
      loopObjectList.push(this.getLoopObject(loopObjectList, entityJSON, noOfST))
      const filteredList = loopObjectList.filter(value => Object.keys(value).length !== 0)
      const errorList = _.get(entityJSON, 'errors').filter(
        x =>
          x.category === 'segmentError' ||
          x.category === 'elementError' ||
          x.category === 'transactionSetSyntaxError'
      )
      data.push(...filteredList)
      if (errorList.length === 0) {
        AK9.elementList.push('A')
      } else {
        if (noOfST > _.get(entityJSON, 'poList').length) {
          AK9.elementList.push('P')
        } else {
          AK9.elementList.push('E')
        }
      }
      AK9.elementList.push(_.get(entityJSON, 'noSent').toString())
      AK9.elementList.push(_.get(entityJSON, 'noSent').toString())
      AK9.elementList.push(_.get(entityJSON, 'poList').length.toString())
    } else {
      AK9.elementList.push('R')
    }
    data.push(AK9)

    const SE: JSONObject = {
      segment: 'SE',
      elementList: [],
    }
    SE.elementList.push((data.length - lengthOfPreviousData + 1).toString())
    SE.elementList.push(`000001`)
    data.push(SE)
    lengthOfPreviousData += data.length

    const GE: JSONObject = {
      segment: 'GE',
      elementList: [],
    }
    GE.elementList.push('1', _.get(entityJSON, 'dataInterchangeControlNumber'))
    data.push(GE)
    const IEA: JSONObject = {
      segment: 'IEA',
      elementList: [],
    }
    IEA.elementList.push('1', _.get(entityJSON, 'interchangeControlNumber'))
    data.push(IEA)
    _.set(returnJSON, 'data', data)
    // return returnJSON
    // const result = await super.export(returnJSON)
    const resultList: any[] = []
    resultList.push(result)
    return [result]
  }
  async getLoopObject(loopObjectList, entityJSON, noOfSt) {
    const errorList = _.get(entityJSON, 'errors')

    for (let i = 1; i < noOfSt + 1; i++) {
      const segmentErrorList: any[] = errorList.filter(
        x => x.category === 'segmentError' && x.mainHeadIndex === i
      )
      const elementErrorList: any[] = errorList.filter(
        x => x.category === 'elementError' && x.mainHeadIndex === i
      )
      const transactionSetSyntaxErrorList: any[] = errorList.filter(
        x => x.category === 'transactionSetSyntaxError' && x.mainHeadIndex === i
      )
      const AK2: JSONObject = {
        segment: 'AK2',
        elementList: [],
      }
      const strIndex = i.toString()
      const pad = '0000'
      const strIndexWithFormat = `${pad.substring(0, pad.length - strIndex.length)}${strIndex}`
      AK2.elementList.push(_.get(entityJSON, 'ediType'), strIndexWithFormat)
      loopObjectList.push(AK2)
      const segmentErrorMapper = {
        'Unrecognized SegmentID': '1',
        'Unexpected Segment': '2',
        'Mandatory Seg Missing': '3',
      }
      const elementErrorMapper = {
        'Mandatory Data element missing': '1',
        'Too many data elements': '3',
        'Data element too short': '4',
        'Data element too long': '5',
        'Invalid code value': '7',
      }
      const transactionSetSyntaxErrorMapper = {
        'Transaction set not supported (save)': '1',
        'Transaction set Trailer Missing': '2',
        'Transaction Set in Header & Trailer Do Not Match': '3',
        'Number of Included Segments Does Not Match Actual Count': '4',
      }
      const poList = _.get(entityJSON, 'poList')
      let outboundSuccess = false

      if (poList) {
        const matchPo = poList.find(x => x.poOrder === i)
        if (matchPo) {
          outboundSuccess = matchPo.outboundSuccess || false
        }
      }
      if (segmentErrorList.length || elementErrorList.length) {
        let loopIndex = 1
        for (const segmentError of segmentErrorList) {
          if (segmentErrorMapper[segmentError.errorType]) {
            const AK3: JSONObject = {
              segment: 'AK3',
              elementList: [],
            }
            const errorID = segmentError.errorID
            const pad = '   '
            const errorIDWithFormat = `${errorID}${pad.substring(0, pad.length - errorID.length)}`

            AK3.elementList.push(
              errorIDWithFormat,
              segmentError.afterMainHeadLocation.toString(),
              loopIndex.toString(),
              segmentErrorMapper[segmentError.errorType]
            )
            loopObjectList.push(AK3)
          }
          loopIndex++
        }
        for (const elementError of elementErrorList) {
          const AK4: JSONObject = {
            segment: 'AK4',
            elementList: [],
          }
          AK4.elementList.push(
            elementError.segmentPosition.toString(),
            elementError.errorIdex.toString(),
            loopIndex.toString(),
            elementErrorMapper[elementError.errorType],
            elementError.element
          )
          loopObjectList.push(AK4)
        }
        const AK5: JSONObject = {
          segment: 'AK5',
          elementList: [],
        }
        if (outboundSuccess === true) {
          AK5.elementList.push('E')
        } else {
          AK5.elementList.push('R')
        }
        AK5.elementList.push('5')
        loopObjectList.push(AK5)
        if (transactionSetSyntaxErrorList.length) {
          for (const transactionSetSyntaxError of transactionSetSyntaxErrorList) {
            const AK5: JSONObject = {
              segment: 'AK5',
              elementList: [],
            }
            if (outboundSuccess === true) {
              AK5.elementList.push('E')
            }
            AK5.elementList.push(
              transactionSetSyntaxErrorMapper[transactionSetSyntaxError.errorType]
            )
            loopObjectList.push(AK5)
          }
        }
      } else {
        if (transactionSetSyntaxErrorList.length) {
          for (const transactionSetSyntaxError of transactionSetSyntaxErrorList) {
            const AK5: JSONObject = {
              segment: 'AK5',
              elementList: [],
            }
            if (outboundSuccess === true) {
              AK5.elementList.push('E')
            } else {
              AK5.elementList.push('R')
            }

            AK5.elementList.push(
              transactionSetSyntaxErrorMapper[transactionSetSyntaxError.errorType]
            )
            loopObjectList.push(AK5)
          }
        } else {
          const AK5: JSONObject = {
            segment: 'AK5',
            elementList: [],
          }
          AK5.elementList.push('A')
          loopObjectList.push(AK5)
        }
      }
    }
  }
}
