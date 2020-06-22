import { BadRequestException } from '@nestjs/common'
import moment = require('moment')

const app = {
  constants: {
    // DEMO KEY
    url: 'http://localhost:8081',
    // url: 'http://192.168.3.133:8081',
    authorizationToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInVzZXJuYW1lIjoiZGVidWdAZGVidWcuY29tIiwiaWF0IjoxNTY5Mzc3NjA4LCJleHAiOjE1NjkzNzc5MDh9.0R-G76TNIXi_4tkmvogMBhfO9DF5FRp3iHJsxaPX4m0',
    refreshToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDMsInVzZXJuYW1lIjoiZGVidWdAZGVidWcuY29tIiwiaWF0IjoxNTY5Mzc3NjA4fQ.234fxezQv-254GS1auNlRMiCPiTA7OspAPycUAZjgV0',

    siteMap: [
      // left is the given subquries param name
      // right is param name in uber
    ],
    // base
    fieldNameMap: {
      // left is internal, right is external

      moduleTypeCode: 'moduleType',
      serviceCode: 'service',
      shipmentTypeCode: 'shipmentType',
      incoTermsCode: 'incoTerms',
      otherTermsCode: 'otherTerms',
      freightTermsCode: 'freightTerms',
      boundTypeCode: 'boundType',
      vesselName: 'vesselVoyage',
      nominatedTypeCode: 'nominatedType',

      cbm: 'cntCbm',
      totalShipment: 'shipments',

      // partyStuff
      forwarderPartyCode: 'officePartyId',
      forwarderPartyName: 'officeParty',

      // warning : old360 outbound take in agentGroup but return agentGroupName, very strange
      agentGroupName: 'agentGroup',
      shipperPartyName: 'shipperParties',
      consigneePartyName: 'consigneeParties',
      linerAgentPartyName: 'linerAgent',
      roAgentPartyName: 'roAgent',
      agentPartyName: 'agent',
      controllingCustomerPartyName: 'controllingCustomer',

      voyage: 'vesselVoyage',

      // date stuff

      departureDateEstimated: 'estimatedDepartureDate',
      departureDateActual: 'actualDepartureDate',
      arrivalDateEstimated: 'estimatedArrivalDate',
      arrivalDateActual: 'actualArrivalDate',

      placeOfReceiptCode: 'por',
      placeOfDeliveryCode: 'pld',
      portOfLoadingCode: 'portOfLoading',
      portOfDischargeCode: 'portOfDischarge',
      finalDestinationCode: 'finalDestination',

      placeOfReceiptName: 'porLocation',
      placeOfDeliveryName: 'pldLocation',
      portOfLoadingName: 'polLocation',
      portOfDischargeName: 'podLocation',
      finalDestinationName: 'finalDestinationLocation',
    },
    statusMap: {
      notInTrack: 'Not In Track',
      processing: 'Processing',
      cargoReady: 'Cargo Ready',
      departure: 'Departure',
      inTransit: 'In Transit',
      arrival: 'Arrival',
      delivered: 'Delivered',
    },
    statusIdMap: {
      notInTrack: 8,
      processing: 1,
      cargoReady: 2,
      departure: 3,
      inTransit: 4,
      arrival: 5,
      delivered: 6,
    },
    primaryKeySeperator : '|'
  },
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: (headers: any, body: any, constants: { [key: string]: any } ) => `${constants.url}/reports/uber2`,
  requestHandler: async(
    headers: any,
    { query, partyService, user }: any,
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    const fieldNameMap = (constants.fieldNameMap = helper.create2WayMap(
      constants.fieldNameMap,
      'external',
      'internal'
    ))
    const {  subqueries, limit, filter = {} } = query
    let { distinct = false, fields = [], sorting, groupBy } = query

    if (fields.includes('primaryKey')) {
      // in order to compose the pirmary Key string, these 3 fields must exist
      const compulsaryFieldList = ['division', 'jobNo', 'houseNo']
      compulsaryFieldList.map(x => {
        if (!(fields as string[]).includes(x)) {
          fields.push(x)
        }
      })
    }
    // select
    fields = fields.map((fieldName: any) => {
      return helper.convertToExternal(fieldName, fieldNameMap)
    })
    // group by
    if (groupBy && groupBy.length) {
      groupBy = groupBy.map((fieldName: any) => {
        return helper.convertToExternal(fieldName, fieldNameMap)
      })
    }
    // sorting
    if (sorting) {
      if (Array.isArray(sorting)) {
        sorting = sorting.map(sortingObject => {
          const fieldName = helper.convertToExternal(sortingObject.expression.name, fieldNameMap)
          return { fieldName, direction: sortingObject.order }
        })
      } else {
        const fieldName = helper.convertToExternal(sorting.expression.name, fieldNameMap)
        sorting = [{ fieldName, direction: sorting.order }]
      }
    }
    const {
      date,
      workflowStatusList,
      primaryKeyList,
      departureDateEstimated,
      arrivalDateEstimated,

      // ------ code stuff -------
      boundTypeCode,
      moduleTypeCode,
      nominatedTypeCode,
      shipmentTypeCode,
      billTypeCode,
      division,
      isColoader,
      // ----- location stuff
      portOfLoadingCode,
      portOfDischargeCode,
      salesmanCode,
      rSalesmanCode,
      likeHouseNo,
      reportingGroup,

      // is not Null stuff
      carrierIsNotNull,
      shipperIsNotNull,
      consigneeIsNotNull,
      controllingCustomerIsNotNull,
      agentIsNotNull,
      agentGroupIsNotNull,

      agentGroupName,

      ignoreHouseNo_GZH_XMN,
      viaHKG,

      controllingCustomerExcludeRole,
      controllingCustomerIncludeRole,
      q,
    } = subqueries

    // if primaryKeyList is not given, need date range
    const primaryKeyLimit = 200
    if (
      primaryKeyList &&
      primaryKeyList.value &&
      primaryKeyList.value.length &&
      primaryKeyList.value.length < primaryKeyLimit
    ) {
      // extracting the primaryList into houseNo list
      filter.houseNoIn = {
        houseNos: primaryKeyList.value.map((primaryKey: string) => {
          const [jobNo, houseNo, division] = primaryKey.split(constants.primaryKeySeperator)
          return houseNo
        }),
      }
    } else if (q) {
      // dont need to do anything
    }

    else if (distinct){
      // dont need to do anything
    }
    else {
      if (!date) throw new BadRequestException('MISSING_DATE_RANGE')

      // lastFrom , lastTo, currentFrom, currentTo
      const { lastFrom, lastTo, currentFrom, currentTo } = date

      if (lastFrom && lastTo && currentFrom && currentTo) {

      const dateLastFrom = moment.utc(lastFrom, 'YYYY-MM-DD')
      const dateLastTo = moment.utc(lastTo, 'YYYY-MM-DD')
      const dateCurrentFrom = moment.utc(currentFrom, 'YYYY-MM-DD')
      const dateCurrentTo = moment.utc(currentTo, 'YYYY-MM-DD')

      if (dateLastFrom.diff(dateLastTo, 'years', true) > 1)
      throw new BadRequestException('DATE_RANGE_TOO_LARGE')

      if (dateCurrentFrom.diff(dateCurrentTo, 'years', true) > 1)
      throw new BadRequestException('DATE_RANGE_TOO_LARGE')

      // used for last/current
        filter.jobDate2 = {
          lastFrom: dateLastFrom.startOf('day').format('YYYY-MM-DD'),
          lastTo: dateLastTo.endOf('day').format('YYYY-MM-DD HH:mm:ss'),

          currentFrom: dateCurrentFrom.startOf('day').format('YYYY-MM-DD'),
          currentTo: dateCurrentTo.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        }
      }

      else {

        // normal date case
        const datefr = moment.utc(date.from, 'YYYY-MM-DD')
        const dateto = moment.utc(date.to, 'YYYY-MM-DD')

        if (dateto.diff(datefr, 'years', true) > 1)
          throw new BadRequestException('DATE_RANGE_TOO_LARGE')

        if (datefr && dateto) {
          filter.jobDate = {
            From: datefr.startOf('day').format('YYYY-MM-DD'),
            To: dateto.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
          }
        }
      }

    }

    if (division) {
      filter.division = { division: division.value }
    }

    if (workflowStatusList) {
      filter.workflowStatus = {
        workflowStatus: workflowStatusList.value.map(
          (status: string) => constants.statusMap[status]
        ),
      }
    }

    if (reportingGroup) {
      filter.reportingGroup = { reportingGroup: reportingGroup.value }
    }

    // warning  : single value
    if (billTypeCode) {
      filter.billType = {
        billType: Array.isArray(billTypeCode.value) ? billTypeCode.value[0] : billTypeCode.value,
      }
    }

    if (likeHouseNo) {
      filter.likeHouseNo = { houseNo: likeHouseNo.value }
    }

    if (ignoreHouseNo_GZH_XMN) {
      filter.notLikeHouseNo_GZH_XMN = true
    }

    if (departureDateEstimated) {
      filter.estimatedDepartureDate = {
        From: departureDateEstimated.from,
        To: departureDateEstimated.to,
      }
    }

    if (arrivalDateEstimated) {
      filter.estimatedArrivalDate = { From: arrivalDateEstimated.from, To: arrivalDateEstimated.to }
    }

    if (moduleTypeCode) {
      filter.moduleType = { moduleType: moduleTypeCode.value }
    }

    if (boundTypeCode) {
      filter.boundType = { boundType: boundTypeCode.value }
    }

    if (agentGroupName) {
      filter.agentGroup = { agentGroup: Array.isArray(agentGroupName.value) ? agentGroupName.value : [agentGroupName.value] }
    }

    const customerParyIdList = user.parties.map(({ id }: any) => id)

    const partymap = new Map([
      // left is the given subquries param name
      // right is param name in uber

      ['shipperPartyId', 'shipperParties'],
      ['consigneePartyId', 'consigneeParties'],
      ['forwarderPartyId', 'officeParty'],
      ['officePartyId', 'officeParty'],
      ['controllingCustomerPartyId', 'controllingCustomer'],
      ['agentPartyId', 'agent'],
      ['roAgentPartyId', 'roAgent'],
      ['linerAgentPartyId', 'linerAgent'],
    ])

    let searchPartyIdList = [...customerParyIdList]

    for (const [partyType] of partymap) {
      if (subqueries[partyType]) {
        searchPartyIdList = searchPartyIdList.concat(subqueries[partyType].value)
      }
    }

    // just select distinct id
    searchPartyIdList = [...new Set(searchPartyIdList)]

    // add the customer code list
    const partyList = await partyService.find({
      where: {
        id: searchPartyIdList,
      },
    })

    // party security handling

    // approach : due to the design in old 360, office party need to be filted by Id, otherParty can be filter by code

    const officePartySecurityList = []
    const partySecurityList = []

    const customerPartyList = user.parties.map(x => partyList.find(y => y.id === x.id))

    customerPartyList.forEach(customerParty => {
      if (customerParty.isBranch) {
        officePartySecurityList.push(customerParty.thirdPartyCode.old360)
      } else {
        // warning !!! now is use old360 id for partySecurity
        partySecurityList.push(customerParty.thirdPartyCode.old360)
      }
    })

    if (officePartySecurityList.filter(x => x).length) {
      filter.officePartySecurity = { id: officePartySecurityList.filter(x => x) }
    }

    // warning !!! now is use old360 id for partySecurity
    if (partySecurityList.filter(x => x).length) {
      filter.partySecurity = { id: partySecurityList.filter(x => x) }
    }

    // normal party filter

    for (const [partyType, outboundPartyType] of partymap) {
      if (subqueries[partyType]) {
        const localPartyList = subqueries[partyType].value.map(partyId =>
          partyList.find(y => y.id === partyId)
        )
        filter[outboundPartyType] = {}
        filter[outboundPartyType][outboundPartyType] = localPartyList
          .map(x => x.thirdPartyCode.old360)
          .filter(x => x)

        if (
          !(
            filter[outboundPartyType] &&
            filter[outboundPartyType][outboundPartyType] &&
            filter[outboundPartyType][outboundPartyType].length
          )
        ) {
          throw new Error(`${outboundPartyType} filter is missing`)
        }
      }
    }

    // warning handling via HKG issue, will completely overrid the officePartyId options
    if (viaHKG) {
      // hardcode old360 HKG ID
      filter.officeParty = {
        officeParty : [7351490]
      }
    }

    if (controllingCustomerExcludeRole && controllingCustomerIncludeRole) {
      throw new Error(
        `cannot use both controllingCustomerExcludeRole and controllingCustomerIncludeRole`
      )
    }

    if (controllingCustomerExcludeRole) {
      filter.controllingCustomerExcludeRole = {
        // partyRole: ['AGT','FWD','CLR']
        partyRole: controllingCustomerExcludeRole.value,
      }
    }

    if (controllingCustomerIncludeRole) {
      filter.controllingCustomerIncludeRole = {
        // partyRole: ['AGT','FWD','CLR']
        partyRole: controllingCustomerIncludeRole.value,
      }
    }

    if (rSalesmanCode) {
      filter.rSalesmanCode = { rSalesmanCode: rSalesmanCode.value }
    }

    if (salesmanCode) {
      filter.salesmanCode = { salesmanCode: salesmanCode.value }
    }

    if (portOfLoadingCode) {
      filter.portOfLoading = { portOfLoading: portOfLoadingCode.value }
    }

    if (portOfDischargeCode) {
      filter.portOfDischarge = { portOfDischarge: portOfDischargeCode.value }
    }

    if (shipmentTypeCode) {
      filter.shipmentType = { shipmentType: shipmentTypeCode.value }
    }

    if (nominatedTypeCode) {
      filter.nominatedType = { nominatedType: nominatedTypeCode.value }
    }

    if (carrierIsNotNull) {
      filter.carrierIsNotNull = {}
    }

    if (shipperIsNotNull) {
      filter.shipperIsNotNull = {}
    }

    if (consigneeIsNotNull) {
      filter.consigneeIsNotNull = {}
    }

    if (agentIsNotNull) {
      filter.agentIsNotNull = {}
    }

    if (agentGroupIsNotNull) {
      filter.agentGroupIsNotNull = {}
    }

    if (controllingCustomerIsNotNull) {
      filter.controllingCustomerIsNotNull = {}
    }

    // very complicated case, just follow logic from old360

    if (isColoader) {
      if (isColoader.value) {
        if (controllingCustomerExcludeRole || controllingCustomerIncludeRole) {
          throw new Error(
            `isColoader cannot be used with controllingCustomerExcludeRole or controllingCustomerIncludeRole`
          )
        }

        filter.controllingCustomerIncludeRole = {
          partyRole: ['FWD'],
        }
      } else {
        filter.controllingCustomerExcludeRole = {
          partyRole: ['FWD'],
        }
      }
    }

    return {
      headers: {
        'x-no-redis': true,
        'authorization': `Bearer ${constants.authorizationToken}`,
        'x-refresh-token': `${constants.refreshToken}`,
      },
      body: {
        // old 360 need to input string 'true'
        distinct : distinct ? 'true' : false,
        fields,
        filter,
        sorting,
        groupBy,
        limit: typeof limit === 'object' ? limit.$limit : limit,
        offset: typeof limit === 'object' ? limit.$offset : 0,
      },
      json: true,
    }
  },
  responseHandler: (
    { responseBody, responseOptions }: { responseBody: any; responseOptions: any },
    constants: { [key: string]: any },
    helper: { [key: string]: Function }
  ) => {
    const { data } = responseBody

    const body = helper.convertToInternalObject(data || [], constants.fieldNameMap) as any[]

    return {
      responseBody: body.map(shipment => {
        shipment[
          'primaryKey'
        ] = `${shipment['jobNo']}${constants.primaryKeySeperator}${shipment['houseNo']}${constants.primaryKeySeperator}${shipment['division']}`
        return shipment
      }),
      responseOptions,
    }
  },
}

export default app
