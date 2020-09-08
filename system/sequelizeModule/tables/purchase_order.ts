import { IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable, MathExpression } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Op } from 'sequelize'
import moment = require('moment')
import { PurchaseOrder } from 'models/main/purchaseOrder'

export const setDataFunction = {
  partyGroupCode: async({ partyGroupCode }: PurchaseOrder, user: JwtPayload) => {
    if (user) {
      return user.selectedPartyGroup.code || partyGroupCode
    }
    return partyGroupCode
  },
  poNo: async({ poNo }: PurchaseOrder, user: JwtPayload) => {
    if (!poNo) {
      const date = moment.utc().format('YYMMDD')
      let random = Math.floor(Math.random() * 9999).toString()
      if (random.length === 3) {
        random = `0${random}`
      } else if (random.length === 2) {
        random = `00${random}`
      } else if (random.length === 1) {
        random = `000${random}`
      } else if (random.length === 0) {
        random = `0000`
      }
      return `${date}${random}`
    }
    return poNo
  },
}

export const dateTimezoneMapping = {
  portOfLoading: [
    'departure',
    'shipping',
    'exitFactory',
    'dontShipBefore',
    'dontShipAfter',
    'po'
  ],
  portOfDischarge: [
    'arrival',
    'delivery',
  ]
}

export default async function getDefaultParams(
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    if (user.selectedPartyGroup) {
      const partyGroupExpression = new BinaryExpression(
        new ColumnExpression('purchase_order', 'partyGroupCode'),
        '=',
        user.selectedPartyGroup.code
      )
      conditions = conditions
        ? new AndExpressions([conditions, partyGroupExpression])
        : partyGroupExpression
    }
    if (user.parties && user.parties.length) {
      const selectedPartyGroupCode = user.selectedPartyGroup ? user.selectedPartyGroup.code : null
      const partyTypesExpressions = user.parties.reduce(
        (selectedPartyType: BinaryExpression[], party: JwtPayloadParty) => {
          if (
            party.partyGroupCode === selectedPartyGroupCode &&
            party.types &&
            party.types.length
          ) {
            selectedPartyType = selectedPartyType.concat(
              party.types.map((type: string) => {
                const con = [
                  'shipper',
                  'shipTo',
                  'factory',
                  'buyer',
                ].includes(type)
                  ? new ColumnExpression(
                      'purchase_order_party',
                      `${type}PartyId`
                    )
                  : new MathExpression(
                      new ColumnExpression('purchase_order_party', 'flexData'),
                      '->>',
                      `$.${type}PartyId`
                    )
                return new BinaryExpression(con, '=', party.id)
              })
            )
          }
          return selectedPartyType
        },
        []
      )
      if (partyTypesExpressions && partyTypesExpressions.length) {
        const or = new InExpression(
          new ColumnExpression('purchase_order_party', 'id'),
          false,
          new Query({
            $select: [new ResultColumn(new ColumnExpression('purchase_order_party', 'poId'))],
            $from: new FromTable('purchase_order_party'),
            $where: new OrExpressions({ expressions: partyTypesExpressions }),
          })
        )
        conditions = conditions ? new AndExpressions([conditions, or]) : or
      }
    }
  }
  return conditions
}
