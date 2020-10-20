import { NotImplementedException } from '@nestjs/common'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { InternalJobService } from 'modules/internal-job/service'

export default async function recalculateTaskGroups(this: InternalJobService, { tableName, subqueries = {}, lastId = 0, per = 50 }: any, user: JwtPayload) {
  let ids: any[] = []
  switch (tableName) {
    case 'booking': {
      const result = await this.bookingService.reportQuery('booking', { fields: ['id'], subqueries: {
        activeStatus: { value: 'active' },
        ...subqueries
      } }, user)
      ids = result.map(r => r.id)
      break
    }
    case 'shipment': {
      const result = await this.shipmentService.reportQuery('shipment', { fields: ['id'], subqueries: {
        activeStatus: { value: 'active' },
        ...subqueries
      } }, user)
      ids = result.map(r => r.id)
      break
    }
    default:
      throw new NotImplementedException()
  }

  // order
  ids = ids.sort((l, r) => l < r ? -1 : l > r ? 1 : 0).filter(id => id > lastId)

  const result: any[] = []
  let error: any
  try {
    const file = `sopTaskModule/${tableName}.ts`
    const repo = user ? `customer-${user.selectedPartyGroup.code}` : 'system'
    const fullpath = await this.customBackendService.resolve(repo, file, repo !== 'system')
    const esModule = this.scriptService.require<any>(fullpath) || {}
    const fields = esModule.criteriaFields || []

    for (let i = 0, length = ids.length; i < length; i += per) {
      const ids_ = ids.slice(i, Math.min(ids.length, i + per))
      await this.sopTemplateService.bulkAutoSelect(tableName, ids_, user, fields)
      result.push(...ids_)
    }
  }
  catch (e) {
    console.error(e, e.stack, 'recalculateTaskGroups')
    error = e
  }
  return {
    result,
    error: error && error.message
  }
}