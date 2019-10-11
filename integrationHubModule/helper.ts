import { BadRequestException } from '@nestjs/common'
import { RoleService } from 'modules/sequelize/role/service'
import { PartyService } from 'modules/sequelize/party/service'
import {
  JwtPayloadRole,
  JwtPayloadPartyGroup,
  JwtPayloadParty,
} from 'modules/auth/interfaces/jwt-payload'
import _ = require('lodash')

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

  // get number format from number of decimal places
  getNumberFormat(dp: number): string {
    let result = ''
    for (let i = 0; i < dp; i += 1) result += '0'
    return '0,0' + (result.length ? `.${result}` : '')
  },

  // group rows
  groupRows(rows: any[], groupBy: string[]): Array<{ __id: any; __value: any; __rows: any[] }> {
    const key = groupBy.pop()
    const result = _.groupBy(rows, row => row[key])
    return Object.keys(result).map(key => ({
      __id: key || '(EMPTY)',
      __value: key || '(EMPTY)',
      __rows: groupBy.length > 0 ? app.groupRows(result[key], groupBy) : result[key],
    }))
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
      'TA',
      'SE',
      'SE FCL',
      'SE LCL',
      'SE Consol',
      'SI',
      'SI FCL',
      'SI LCL',
      'SI Consol',
      'SM',
      'TS',
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
    if (flag_air && flag_m) result.push(...['AM', 'TA'])
    if (flag_sea && flag_o) result.push(...['SE', 'SE FCL', 'SE LCL', 'SE Consol'])
    if (flag_sea && flag_i) result.push(...['SI', 'SI FCL', 'SI LCL', 'SI Consol'])
    if (flag_sea && flag_m) result.push(...['SM', 'TS'])
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
      case 'TA':
        return 'E'
      case 'TS':
        return 'F'
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
    return fieldNameMap['internal'][externalFieldName]
      ? fieldNameMap['internal'][externalFieldName]
      : externalFieldName
  },

  convertToExternal(internalFieldName: string, fieldNameMap: any) {
    return fieldNameMap['external'][internalFieldName]
      ? fieldNameMap['external'][internalFieldName]
      : internalFieldName
  },
}

export default app
