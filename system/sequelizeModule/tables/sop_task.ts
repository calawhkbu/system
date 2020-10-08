import { BadRequestException } from "@nestjs/common"
import { IQueryParams } from "classes/query"
import { JwtPayload } from "modules/auth/interfaces/jwt-payload"
import { SopTaskTableService } from "modules/sequelize/services/table/sopTask"
import { IConditionalExpression } from "node-jql"
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

    if (!params.subqueries || !params.subqueries.tableName) throw new BadRequestException('MISSING_ENTITY_TYPE')

    const tableExtra = (await this.loadCustomFile(repo, params.subqueries.tableName.value) || {})
    if (typeof tableExtra.applyAccessRightConditions === 'function') {
      conditions = await tableExtra.applyAccessRightConditions.apply(this, [
        conditions,
        user,
        transaction
      ])
    }
  }

  return conditions
}
