import { IQueryParams } from "classes/query"
import { JwtPayload } from "modules/auth/interfaces/jwt-payload"
import { SopTaskTableService } from "modules/sequelize/services/table/sopTask"
import { sopTaskSupportedTables } from "modules/sop-task/settings"
import { AndExpressions, BinaryExpression, CaseExpression, ColumnExpression, IConditionalExpression, Value } from "node-jql"
import { Transaction } from "sequelize/types"

export default async function getDefaultParams(
  this: SopTaskTableService,
  params: IQueryParams,
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    const repo = user ? `customer-${user.selectedPartyGroup.code}` : 'system'

    if (params.subqueries && params.subqueries.tableName) {
      const tableExtra = (await this.loadCustomFile(repo, params.subqueries.tableName.value) || {})
      if (typeof tableExtra.applyAccessRightConditions === 'function') {
        conditions = await tableExtra.applyAccessRightConditions.apply(this, [
          conditions,
          user,
          transaction
        ])
      }
    }
    else {
      const SOP_SUPPORTED_ENTITY = sopTaskSupportedTables()
      const promises = SOP_SUPPORTED_ENTITY.map(async t => {
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
        cases: SOP_SUPPORTED_ENTITY.map((t, i) => {
          if (Array.isArray(t)) t = t[0]
          return {
            $when: new BinaryExpression(new ColumnExpression('sop_task', 'tableName'), '=', new Value(t)),
            $then: results[i] || new Value(0)
          }
        })
      })
      conditions = conditions ? new AndExpressions([conditions, caseExpression]) : caseExpression
    }
  }

  return conditions
}
