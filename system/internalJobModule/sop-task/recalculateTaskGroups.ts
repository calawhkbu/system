import { NotImplementedException } from '@nestjs/common'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Job } from 'modules/internal-job/job'

export default async function recalculateTaskGroups(this: Job, { tableName, subqueries = {}, lastId = 0, per = 50 }: any, user: JwtPayload) {
  let ids: any[] = []
  switch (tableName) {
    case 'booking': {
      const result = await this.service.bookingService.reportQuery('booking', { fields: ['id'], subqueries: {
        activeStatus: { value: 'active' },
        ...subqueries
      } }, user)
      ids = result.map(r => r.id)
      break
    }
    case 'shipment': {
      const result = await this.service.shipmentService.reportQuery('shipment', { fields: ['id'], subqueries: {
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
    const fullpath = await this.service.customBackendService.resolve(repo, file, repo !== 'system')
    const esModule = this.service.scriptService.require<any>(fullpath) || {}
    const fields = esModule.criteriaFields || []

    for (let i = 0, length = ids.length; i < length; i += per) {
      const ids_ = ids.slice(i, Math.min(ids.length, i + per))
      await this.service.sopTemplateService.bulkAutoSelect(tableName, ids_, user, fields)
      this.progress(Math.min(i + per, ids.length) / ids.length)
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