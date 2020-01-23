import { BadRequestException, NotFoundException } from '@nestjs/common'
import { RoleService } from 'modules/sequelize/role/service'
import { PartyService } from 'modules/sequelize/party/service'
import {
  JwtPayloadRole,
  JwtPayloadPartyGroup,
  JwtPayloadParty,
} from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')
import axios from 'axios'
import moment = require('moment')

const app = {
  /*******************************/
  // Common helper functions
  /*******************************/

  // resolve user roles
  async resolveRoles(
    roleService: RoleService,
    partyGroup: JwtPayloadPartyGroup,
    roles: JwtPayloadRole[]
  ) {
    return await roleService.find({
      where: {
        id: {
          $in: roles.reduce((ids: number[], r: JwtPayloadRole) => {
            if (r.partyGroupCode === partyGroup.code || r.partyGroupCode === null) {
              ids.push(r.id)
            }
            return ids
          }, []),
        },
      },
    })
  },

  // resolve user parties
  async resolveParties(
    partyService: PartyService,
    partyGroup: JwtPayloadPartyGroup,
    parties: JwtPayloadParty[]
  ) {
    return await partyService.find({
      where: {
        id: {
          $in: parties.reduce((ids: number[], p: JwtPayloadParty) => {
            if (p.partyGroupCode === partyGroup.code || p.partyGroupCode === null) {
              ids.push(p.id)
            }
            return ids
          }, []),
        },
      },
    })
  },

  /*******************************/
  // Common external card functions
  /*******************************/

  // get number format from number of decimal places
  getNumberFormat(dp: number): string {
    let result = ''
    for (let i = 0; i < dp; i += 1) result += '0'
    return '0,0' + (result.length ? `.${result}` : '')
  },

  // group rows
  groupRows(rows: any[], groupBy: string[]): Array<{ __id: any; __value: any; __rows: any[] }> {
    const [key, ...groupBy_] = groupBy
    const result = _.groupBy(rows, row => row[key])
    return Object.keys(result).map(key => ({
      __id: key || '(EMPTY)',
      __value: key || '(EMPTY)',
      __rows: groupBy_.length > 0 ? app.groupRows(result[key], groupBy_) : result[key],
    }))
  },

  // parse cards
  parseCards(responseBody: any[], api: string, category: string) {
    return responseBody.reduce<any[]>((result, row) => {
      const card = result.find(({ id }) => id === row.zyh)
      if (!card) {
        result.push({
          id: row.zyh,
          reportingKey: 'dashboard',
          api,
          category,
          name: row.title,
          component: {
            props: {
              defaultParams: {
                filters: {
                  type: {
                    value: row.zyd,
                  },
                },
              },
            },
          },
          layouts: {
            __BASE__: { h: 12, w: 6 },
          },
        })
      }
      return result
    }, [])
  },

  // prepare card
  async prepareCard(responseBody: any, api: string, category: string, zyh: number, zyd: number, options: any) {
    const axiosResponse = await axios.request(options)
    const cards = JSON.parse(axiosResponse.data.d) as any[]
    const baseCard = cards.filter(c => c.zyh === +zyh)
    const currentCard = baseCard.filter(c => c.zyd === +zyd)
    if (!currentCard.length) throw new NotFoundException()

    let items: any[] | null = null
    if (baseCard.length > 1)
      items = baseCard.map(({ zyd, title }) => ({ label: title, value: zyd }))

    // reformat
    const row = responseBody
    row.layout = JSON.parse(row.layout)
    return {
      id: zyh,
      reportingKey: 'dashboard',
      api,
      category,
      name: baseCard[0].title,
      description: `Generated at ${moment(row.rptdate).format('DD/MM/YYYY hh:mm:ssa')}`,
      component: {
        is: 'TableCard',
        props: {
          url: `card/external/data/${api}/${zyh}`,
          filters: items ? [{ name: 'type', props: { items }, type: 'list' }] : undefined,
          headers: row.layout
            .filter(({ dtype, grp }) => dtype !== 'H' && !grp)
            .map(({ ffield, label, width, dtype, dplace, stotal }) => {
              const result = { key: ffield, label } as any
              if (width > 0) result.width = width * 8
              if (dtype === 'N') {
                result.align = 'right'
                result.format = app.getNumberFormat(dplace)
                result.subTotal = stotal
              }
              return result
            }),
          footer: row.layout.reduce((result, { grp }) => result || grp, false)
            ? 'SubTotalRow'
            : undefined,
          isExternalCard: true,
          skipReportFilters: true,
        },
      } as any,
    }
  },

  // get card
  async getCard(options: any) {
    const axiosResponse = await axios.request(options)
    const responseBody = JSON.parse(axiosResponse.data.d) as any[]
    if (!responseBody.length) throw new NotFoundException('REPORT_NOT_READY')
    return responseBody[0]
  },

  // parse external data
  parseData(responseBody: any, card: any) {
    // reformat
    responseBody = JSON.parse((responseBody.trim() || '[]').replace(/[\n\r]/g, ''))

    // grouping
    const layout = JSON.parse(card.layout) as any[]
    const groupBy = layout.filter(header => header.grp).map(header => header.ffield as string)
    if (groupBy.length > 0) responseBody = app.groupRows(responseBody, groupBy)

    return responseBody
  },

  /*******************************/
  // ERP helper functions
  /*******************************/

  // interpret moduleType
  getModuleTypes(filters: any[]): string[] {
    const result = [] as string[]
    // AIR
    if (filters.find(f => f.moduleTypeCode === 'AIR')) result.push('AIR')
    // SEA
    if (filters.find(f => f.moduleTypeCode === 'SEA')) result.push('SEA')
    return result
  },

  // interpret boundType
  getBoundType(filters: any[]): string[] {
    const result = [] as string[]
    // O
    if (filters.find(f => f.boundTypeCode === 'O')) result.push('O')
    // I
    if (filters.find(f => f.boundTypeCode === 'I')) result.push('I')
    // M
    if (filters.find(f => f.boundTypeCode === 'M')) result.push('M')
    return result
  },

  // interpret selected site
  getOfficeParties(system: string, parties: any[], selected?: { value: number[] }): string[] {
    const result = [] as string[]
    if (selected) {
      const party = parties.find(({ id }) => selected.value.indexOf(id) > -1)
      if (party && party.thirdPartyCode && party.thirdPartyCode[system])
        result.push(party.thirdPartyCode[system])
    } else {
      for (const { thirdPartyCode } of parties) {
        if (thirdPartyCode && typeof thirdPartyCode[system] === 'string')
          result.push(thirdPartyCode[system])
      }
    }
    return result
  },

  // interpret divisions
  getDivisions(
    filters: any[],
    allowed: string[] = [
      'AE',
      'AI',
      'AM',
      'SE',
      'SE FCL',
      'SE LCL',
      'SE Consol',
      'SI',
      'SI FCL',
      'SI LCL',
      'SI Consol',
      'SM',
      'Logistics',
      'Total',
    ]
  ): string[] {
    // moduleType
    const flag_air = !!filters.find(f => f.moduleTypeCode === 'AIR')
    const flag_sea = !!filters.find(f => f.moduleTypeCode === 'SEA')
    const flag_log = !!filters.find(f => f.moduleTypeCode === 'LOG')

    // boundType
    const flag_o = !!filters.find(f => f.boundTypeCode === 'O')
    const flag_i = !!filters.find(f => f.boundTypeCode === 'I')
    const flag_m = !!filters.find(f => f.boundTypeCode === 'M')

    const result = [] as string[]
    if (flag_air && flag_o) result.push('AE')
    if (flag_air && flag_i) result.push('AI')
    if (flag_air && flag_m) result.push(...['AM'])
    if (flag_sea && flag_o) result.push(...['SE', 'SE FCL', 'SE LCL', 'SE Consol'])
    if (flag_sea && flag_i) result.push(...['SI', 'SI FCL', 'SI LCL', 'SI Consol'])
    if (flag_sea && flag_m) result.push(...['SM'])
    if (flag_log) result.push('Logistics')

    if (result.length === 15) result.push('Total')

    return result.filter(r => allowed.indexOf(r) > -1)
  },

  // get vsiteanalysis' division code
  getDivision(division): string | number {
    switch (division) {
      case 'Total':
        return 1
      case 'AE':
        return 2
      case 'AI':
        return 6
      case 'AM':
        return 'A'
      case 'SE':
        return 'C'
      case 'SE FCL':
        return 3
      case 'SE LCL':
        return 4
      case 'SE Consol':
        return 5
      case 'SI':
        return 'D'
      case 'SI FCL':
        return 7
      case 'SI LCL':
        return 8
      case 'SI Consol':
        return 9
      case 'SM':
        return 'B'
      case 'Logistics':
        return 0
      default:
        throw new BadRequestException(`Unavailable division '${division}'`)
    }
  },

  /*******************************/
  // Old 360 helper functions
  /*******************************/

  convertParty(name: string): { flexData: boolean; name: string } {
    switch (name) {
      case 'AGT':
        return { flexData: false, name: 'agent' }
      case 'CGN':
        return { flexData: false, name: 'consignee' }
      case 'COC':
        return { flexData: false, name: 'controllingCustomer' }
      case 'OFE':
        return { flexData: false, name: 'office' }
      case 'LAG':
        return { flexData: false, name: 'linerAgent' }
      case 'ROA':
        return { flexData: true, name: 'roAgent' }
      case 'SHP':
        return { flexData: false, name: 'shipper' }
      case 'NT1':
        return { flexData: true, name: 'notifyParty1' }
      case 'NT2':
        return { flexData: true, name: 'notifyParty2' }
      default:
        return { flexData: true, name }
    }
  },

  convertDate(name: string): { flexData: boolean; name: string } {
    switch (name) {
      case 'DEPARTURE':
        return { flexData: false, name: 'departure' }
      case 'ARRIVAL':
        return { flexData: false, name: 'arrival' }
      case 'OCEANBILL':
        return { flexData: false, name: 'oceanBill' }
      case 'CCSALESINVOICE':
        return { flexData: true, name: 'createCollectSalesInvoice' }
      case 'PPSALESINVOICE':
        return { flexData: true, name: 'createPrepaidSalesInvoice' }
      case 'CYCUTOFF':
        return { flexData: true, name: 'cyCutOff' }
      default:
        return { flexData: true, name }
    }
  },

  create2WayMap(seedMap, mapName, reversemapName) {
    return {
      [mapName]: { ...seedMap },
      [reversemapName]: Object.keys(seedMap).reduce((map, key) => {
        const value = seedMap[key]
        return { ...map, [value]: key }
      }, {}),
    }
  },

  convertToInternalObject(externalObjectList: any, fieldNameMap: any) {
    if (Array.isArray(externalObjectList)) {
      return externalObjectList.map(x => app.convertToInternalObject(x, fieldNameMap))
    }

    const externalObject = externalObjectList

    for (const key in externalObject) {
      if (externalObject.hasOwnProperty(key)) {
        const internalFieldName = app.convertToInternal(key, fieldNameMap)
        if (internalFieldName !== key) {
          externalObject[internalFieldName] = externalObject[key]
          delete externalObject[key]
        }
      }
    }

    return externalObject
  },

  convertToInternal(externalFieldName: string, fieldNameMap: any) {
    const internal = fieldNameMap['internal'][externalFieldName]
    return !internal && internal !== 0 ? externalFieldName : internal
  },

  convertToExternal(internalFieldName: string, fieldNameMap: any) {
    const external = fieldNameMap['external'][internalFieldName]
    return !external && external !== 0 ? internalFieldName : external
  },
}

export default app
