import { BadRequestException, NotImplementedException } from '@nestjs/common'
import moment = require('moment')

const create2WayMap  = (seedMap, mapName, reversemapName) => ({
  [mapName]: { ...seedMap },
  [reversemapName]: Object.keys(seedMap).reduce((map, key) => {
    const value = seedMap[key]
    return { ...map, [value]: key }
  }, {})
})

const fieldNameMap = create2WayMap(
  {
    // left is internal, right is external
    'moduleTypeCode': 'moduleType',
    'serviceCode': 'serviceTypeCode',
    'incoTermsCode': 'incoTerms',
    'otherTermsCode' : 'otherTerms',
    'freightTermsCode' : 'freightTerms',

    'vesselName' : 'vesselVoyage',

    // partyStuff
    'forwarderPartyCode' : 'officePartyCode',
    'forwarderPartyName' : 'officePartyName',

    // date stuff

    'depatureDateEstimated' : 'estimatedDepatureDate',
    'depatureDateActual' : 'actualDepatureDate',
    'arrivalDateEstimated' : 'estimatedArrivalDate',
    'arrivalDateActual' : 'actualArrivalDate',

    'nominatedTypeCode' : 'nominatedType',

    'portOfLoadingCode': 'portOfLoading',
    'portOfDischargeCode': 'portOfDischarge',


  },
  'external',
  'internal'
)

const convertToInternalObject = (externalObjectList : any) => {

  if (Array.isArray(externalObjectList))
  {
    return externalObjectList.map(x => convertToInternalObject(x))
  }

  const externalObject = externalObjectList

  for (const key in externalObject) {
    if (externalObject.hasOwnProperty(key)) {

      const internalFieldName = convertToInternal(key)
      if (internalFieldName != key)
      {
        externalObject[internalFieldName] = externalObject[key];
        delete externalObject[key]
      }

    }
  }

  return externalObject


}

const convertToInternal = (externalFieldName : string) => {

  return fieldNameMap['internal'][externalFieldName] ? fieldNameMap['internal'][externalFieldName] : externalFieldName
}

const convertToExternal = (internalFieldName : string) => {

  return fieldNameMap['external'][internalFieldName] ? fieldNameMap['external'][internalFieldName] : internalFieldName
}
export default {
  constants: {
  },
  method: 'POST',
  getUrl: () => `${this.constants.baseUrl}/report/uber`,
  requestHandler: (headers: any, body: any) => {



    const { query } = body
    let { fields = [], subqueries, sorting, groupBy, limit } = query

    fields = fields.map(fieldName => {
      return convertToExternal(fieldName)
    })

    console.log(fields)

    if (groupBy && groupBy.length)
    {
      groupBy = groupBy.map(fieldName => {
        return convertToExternal(fieldName)
      })
    }

    if (sorting)
    {

      if (Array.isArray(sorting))
      {
        sorting = sorting.map(sortingObject => {

          const fieldName = convertToExternal(sortingObject.expression.name)
          return { fieldName, direction: sortingObject.order }

        })
      }

      else{
        const fieldName = convertToExternal(sorting.expression.name)
        sorting =  [{ fieldName, direction: sorting.order }]
      }
    }



    const { date, moduleTypeCode, salesmanCode,primaryKeyList } = subqueries
    const filter:any = {}


    // if primaryKeyList is not given, need date range
    const primaryKeyLimit = 200
    if(primaryKeyList && primaryKeyList.value && primaryKeyList.value.length && primaryKeyList.value.length < primaryKeyLimit)
    {
      filter.houseNoIn = {
        houseNos : primaryKeyList.value
      }
    } else {
      if (!date) throw new BadRequestException('MISSING_DATE_RANGE')
      const datefr = moment(date.from, 'YYYY-MM-DD')
      const dateto = moment(date.to, 'YYYY-MM-DD')
      if (dateto.diff(datefr, 'years', true) > 1) throw new BadRequestException('DATE_RANGE_TOO_LARGE')
      if (datefr && dateto) {
        filter.jobDate = { From: datefr, To: dateto }
      }
    }


    filter.jobDate = { From: '2018-01-01', To: '2018-12-01' }

    if (moduleTypeCode) {
      filter.moduleType = { moduleType: [moduleTypeCode.value] }
    }
    if (salesmanCode) {
      filter.salesmanCode = { salesmanCode: salesmanCode.value }
    }

    // // sorting
    // const externalSorting = sorting ? [{ fieldName: sorting.expression.name, direction: sorting.order }] : undefined

    // // // groupBy
    // const externalGroupBy = (groupBy && groupBy.length) ? convertToExternalObject(groupBy) : undefined


    return {
      headers: {
        'authorization': `Bearer ${this.constants.authorizationToken}`,
        'x-refresh-token': `${this.constants.refreshToken}`
      },
      body: {
        fields,
        filter,
        sorting,
        groupBy,
        limit: typeof limit === 'object' ? limit.$limit : limit,
        offset: typeof limit === 'object' ? limit.$offset : 0
      },
      json: true
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    const { data } = response.responseBody


    return {
      responseBody: convertToInternalObject(data || []),
      responseOptions: response.responseOptions
    }
  },
}
