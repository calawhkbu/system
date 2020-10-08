import { IConditionalExpression, AndExpressions, BinaryExpression, ColumnExpression } from 'node-jql'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { IQueryParams } from 'classes/query'

export const setDataFunction = {
  partyGroupCode: async({ partyGroupCode }, user: JwtPayload) => {
    if (user) {
      return user.selectedPartyGroup.code || partyGroupCode
    }
    return partyGroupCode
  }
}

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
        new ColumnExpression('product_category', 'partyGroupCode'),
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
