import { BadRequestException } from "@nestjs/common"
import { IQueryParams } from "classes/query"
import { JwtPayload } from "modules/auth/interfaces/jwt-payload"
import { AndExpressions, BinaryExpression, ColumnExpression, IConditionalExpression } from "node-jql"
import { Transaction } from "sequelize/types"

export default async function getDefaultParams(
  params: IQueryParams,
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    if (user.selectedPartyGroup) {
      const partyGroupExpression = new BinaryExpression(
        new ColumnExpression('sop_template', 'partyGroupCode'),
        '=',
        user.selectedPartyGroup.code
      )
      conditions = conditions
        ? new AndExpressions([conditions, partyGroupExpression])
        : partyGroupExpression
    }
  }

  return conditions
}
