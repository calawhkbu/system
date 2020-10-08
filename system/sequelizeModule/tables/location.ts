import { IsNullExpression, IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { IQueryParams } from 'classes/query'

export const setDataFunction = {
  partyGroupCode: async({ partyGroupCode }, user: JwtPayload) => {
    if (user) {
      return user.selectedPartyGroup.code || partyGroupCode
    }
    return partyGroupCode
  },
  moduleTypeCode: async({ moduleTypeCode }) => {
    return moduleTypeCode || 'XXX'
  },
  latitude: async({ latitude }) => {
    // TODO get latlng
    return latitude || null
  },
  longitude: async({ longitude }) => {
    // TODO get latlng
    return longitude || null
  },
  timezone: async({ timezone }) => {
    // TODO get timezone
    return timezone || null
  },
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
      const partyGroupExpression = new OrExpressions([
        new BinaryExpression(
          new ColumnExpression('location', 'partyGroupCode'),
          '=',
          user.selectedPartyGroup.code
        ),

        new IsNullExpression(new ColumnExpression('location', 'partyGroupCode'), false)
      ])
      conditions = conditions
        ? new AndExpressions([conditions, partyGroupExpression])
        : partyGroupExpression
    }
  }
  return conditions
}
