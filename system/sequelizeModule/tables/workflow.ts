import { Workflow } from 'models/main/workflow'
import moment = require('moment')
import { IQueryParams } from 'classes/query'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { WorkflowTableService } from 'modules/sequelize/services/table/workflow'
import { AndExpressions, BinaryExpression, CaseExpression, ColumnExpression, IConditionalExpression, InExpression, Query, ResultColumn, Value } from 'node-jql'
import { Transaction } from 'sequelize/types'

const WORKFLOW_SUPPORTED_ENTITY = ['booking', 'shipment']

export const setDataFunction = {
  statusDate: async({}: Workflow) => {
    return moment.utc().format('YYYY-MM-DD HH:mm:ss')
  },
}

export const mapping = {
  // Please notice that add the entity to the workflow
  // booking: async (
  //   changeType: 'create'|'update'|'delete',
  //   entity: any,
  // ): Promise<Workflow[]> => {
  //   return []
  // }
}

export default async function getDefaultParams(
  this: WorkflowTableService,
  params: IQueryParams,
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    const repo = user ? `customer-${user.selectedPartyGroup.code}` : 'system'
    if (!params.tables) {
      params.tables = []
    }
    if (params.subqueries && params.subqueries.tableName) {
      const table = params.subqueries.tableName.value
      params.tables.push(table)
      const tableExtra = (await this.loadCustomFile(repo, table) || {})
      if (typeof tableExtra.applyAccessRightConditions === 'function') {
        const expr = new InExpression(new ColumnExpression('workflow', 'primaryKey'), false, new Query({
          $select: new ResultColumn(new ColumnExpression(table, 'id'), 'id'),
          $from: table,
          $where: await tableExtra.applyAccessRightConditions.apply(this, [
            null,
            user,
            transaction
          ])
        }))
        if (conditions instanceof AndExpressions) {
          conditions.expressions.push(expr)
        }
        else if (conditions) {
          conditions = new AndExpressions([conditions, expr])
        }
        else {
          conditions = expr
        }
      }
    }
    else {

      const promises = WORKFLOW_SUPPORTED_ENTITY.map(async t => {
        params.tables.push(t)
        const tableExtra = (await this.loadCustomFile(repo, t) || {})
        if (typeof tableExtra.applyAccessRightConditions === 'function') {
          return tableExtra.applyAccessRightConditions.apply(this, [
            undefined,
            user,
            transaction
          ])
        }
      })
      const results = await Promise.all(promises)
      const caseExpression = new CaseExpression({
        cases: WORKFLOW_SUPPORTED_ENTITY.reduce((r, table, i) => {
          if (results[i]) {
            const expr = new InExpression(new ColumnExpression('workflow', 'primaryKey'), false, new Query({
              $select: new ResultColumn(new ColumnExpression(table, 'id'), 'id'),
              $from: table,
              $where: results[i]
            }))
            r.push({
              $when: new BinaryExpression(new ColumnExpression('workflow', 'tableName'), '=', new Value(table)),
              $then: expr
            })
          }
          return r
        }, [])
      })
      conditions = conditions ? new AndExpressions([conditions, caseExpression]) : caseExpression
    }
  }

  return conditions
}
