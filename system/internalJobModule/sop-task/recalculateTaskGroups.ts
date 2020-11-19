import { NotImplementedException } from '@nestjs/common'
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Job } from 'modules/internal-job/job'
import { ERROR } from 'utils/error'

export const filters: any[] = [
  {
    name: 'tableName',
    display: 'entityType',
    type: 'list',
    props: {
      api: {
        query: {
          url: 'sopTask/supported',
          method: 'GET'
        }
      }
    }
  },
  {
    name: 'per',
    type: 'list',
    props: {
      items: [
        '10',
        '20',
        '50',
        '100'
      ]
    }
  }
]

export default async function recalculateTaskGroups(this: Job, params: IQueryParams, user: JwtPayload) {
  let subqueries = params.subqueries || {}
  const tableName = subqueries.tableName && subqueries.tableName.value
  const lastId = +(subqueries.lastId && subqueries.lastId.value) || 0
  const per = +(subqueries.per && subqueries.per.value) || 50

  const { tableName: t_, lastId: l_, per: p_, ...subqueries_ } = subqueries
  subqueries = subqueries_

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
      throw ERROR.UNSUPPORTED_ENTITY_TYPE()
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
      await this.log(`Completed ${Math.min(i + per, ids.length)}/${ids.length} records`)
      result.push(...ids_)
    }

    await this.log(`All ${ids.length} records completed`)
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