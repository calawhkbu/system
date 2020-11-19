import { NotImplementedException } from '@nestjs/common'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Op } from 'sequelize'
import { Job } from 'modules/internal-job/job'
import { IQueryParams } from 'classes/query'
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

export default async function recalculateDates(this: Job, params: IQueryParams, user: JwtPayload) {
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
    const repo = user ? user.selectedPartyGroup.code : 'system'
    const file = `sequelizeModule/tables/${tableName}.ts`
    const fullpath = await this.service.customBackendService.resolve(`customer-${repo}`, file)
    const esModule = this.service.scriptService.require<any>(fullpath)
    const dateTimezoneMapping = esModule.dateTimezoneMapping || {}

    for (let i = 0, length = ids.length; i < length; i += per) {
      const ids_ = ids.slice(i, Math.min(ids.length, i + per))
      let entities: any[]
      switch (tableName) {
        case 'booking': {
          entities = await this.service.bookingService.find({ where: { id: { [Op.in]: ids_ } } }, user)
          break
        }
        case 'shipment': {
          entities = await this.service.shipmentService.find({ where: { id: { [Op.in]: ids_ } } }, user)
          break
        }
        default:
          throw ERROR.UNSUPPORTED_ENTITY_TYPE()
      }
      await this.service.sopTaskTableService.bulkUpdateDates(tableName, entities, user, dateTimezoneMapping)
      this.progress(Math.min(i + per, ids.length) / ids.length)
      await this.log(`Completed ${Math.min(i + per, ids.length)}/${ids.length} records`)
      result.push(...ids_)
    }

    await this.log(`All ${ids.length} records completed`)
  }
  catch (e) {
    console.error(e, e.stack, 'PrepareService')
    error = e
  }
  return {
    result,
    error: error && error.message
  }
}