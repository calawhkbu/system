import { NotImplementedException } from '@nestjs/common'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Op } from 'sequelize'
import { Job } from 'modules/internal-job/job'

export default async function recalculateDates(this: Job, { tableName, subqueries = {}, lastId = 0, per = 50 }: any, user: JwtPayload) {
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
          throw new NotImplementedException()
      }
      await this.service.sopTaskTableService.bulkUpdateDates(tableName, entities, user, dateTimezoneMapping)
      result.push(...ids_)
    }
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