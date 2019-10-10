import { BadRequestException, ForbiddenException, NotImplementedException } from '@nestjs/common'
import moment = require('moment')

export default {
  method: 'POST', // 'GET'|'POST'|'PUT'|'DELETE'|'HEAD'|'OPTIONS'
  getUrl: ({ api }: { api: any }) => {
    if (!api.erp || !api.erp.url) throw new NotImplementedException()
    return `${api.erp.url}/getshipsummary`
  },
  requestHandler: (
    { query, roles, party }: { query: any; roles: any[]; party: any[] },
    body: any,
    helper: { [key: string]: Function }
  ) => {
    let { subqueries = {} as any, sorting, limit } = query
    const roleFilters = roles
      .map(({ filter }) => filter.shipment && filter.shipment.outbound)
      .filter(f => f)
    const para = {} as any

    // order
    if (sorting) {
      if (typeof sorting === 'string') {
        sorting = {
          expression: { classname: 'ColumnExpression', name: sorting },
          order: 'ASC',
        }
      }
      if (!Array.isArray(sorting)) sorting = [sorting]
      para.order = sorting.map(({ expression, order = 'ASC' }) => ({
        attribute: expression.name,
        direction: order,
      }))
    }

    // limit & offset
    if (limit) {
      if (typeof limit === 'number') {
        limit = { $limit: limit }
      }
      para.limit = limit.$limit
      if (limit.$offset) para.offset = limit.$offset
    }

    // xsite
    const sites = helper.getOfficeParties('erp', party, subqueries.officeParty)
    if (!sites.length) throw new BadRequestException('MISSING_SITE')
    para.xsite = sites

    // TODO xcustomecode

    // jobDate
    if (!subqueries.date) throw new BadRequestException('MISSING_DATE_RANGE')
    para.jobDate = {
      from: moment(subqueries.date.from, 'YYYY-MM-DD'),
      to: moment(subqueries.date.to, 'YYYY-MM-DD'),
    }

    // etd
    if (subqueries.departureDateEstimated) {
      para.etd = {
        from: moment(subqueries.departureDateEstimated.from, 'YYYY-MM-DD HH:mm:ss'),
        to: moment(subqueries.departureDateEstimated.to, 'YYYY-MM-DD HH:mm:ss'),
      }
    }

    // eta
    if (subqueries.arrivalDateEstimated) {
      para.eta = {
        from: moment(subqueries.arrivalDateEstimated.from, 'YYYY-MM-DD HH:mm:ss'),
        to: moment(subqueries.arrivalDateEstimated.to, 'YYYY-MM-DD HH:mm:ss'),
      }
    }

    // salesmanCode
    if (subqueries.salesmanCode) {
      para.salesmanCode = subqueries.salesmanCode.value
    }

    // TODO shipperCode

    // TODO consigneeCode

    // TODO linearAgentCode

    // TODO roAgentCode

    // TODO agentCode

    // TODO agentGroup

    // TODO controllingCustomerCode

    // TODO division

    // moduleType
    let availableModuleTypes = helper.getModuleTypes(roleFilters)
    if (subqueries.moduleTypeCode) {
      availableModuleTypes = availableModuleTypes.filter(
        type => subqueries.moduleTypeCode.value.indexOf(type) > -1
      )
    }
    if (availableModuleTypes.length === 0) throw new ForbiddenException('NO_ACCESS_RIGHT')
    para.moduleType = availableModuleTypes

    // boundType
    let availableBoundTypes = helper.getBoundType(roleFilters)
    if (subqueries.boundTypeCode) {
      availableBoundTypes = availableBoundTypes.filter(
        type => subqueries.boundTypeCode.value.indexOf(type) > -1
      )
    }
    if (availableBoundTypes.length === 0) throw new ForbiddenException('NO_ACCESS_RIGHT')
    para.boundType = availableBoundTypes

    // nominatedType
    if (subqueries.nominatedTypeCode) {
      para.nominatedType = subqueries.nominatedTypeCode.value
    }

    // polCode
    if (subqueries.portOfLoadingCode) {
      para.polCode = subqueries.portOfLoadingCode.value
    }

    // podCode
    if (subqueries.portOfDischargeCode) {
      para.polCode = subqueries.portOfDischargeCode.value
    }

    // houseNo
    if (subqueries.houseNo) {
      para.houseNo = subqueries.houseNo.value
    }

    // billType
    if (subqueries.billTypeCode) {
      para.billType = subqueries.billTypeCode.value
    }

    return {
      body: { para },
    }
  },
  responseHandler: (response: { responseBody: any; responseOptions: any }) => {
    // parse results
    const responseBody = JSON.parse(JSON.parse(response.responseBody).d)

    // TODO

    return responseBody
  },
}
