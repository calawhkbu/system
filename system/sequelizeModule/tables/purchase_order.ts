import { IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable, MathExpression } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Op } from 'sequelize'
import moment = require('moment')
import { PurchaseOrder } from 'models/main/purchaseOrder'
import { IQueryParams } from 'classes/query'
import purchaseOrderItems from '../../reportingModule/table/purchase-order-items'

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
  quantity: async({ quantity = null, purchaseOrderItems = [] }: PurchaseOrder) => {
    let totalQuantity = 0
    for (const { quantity } of purchaseOrderItems) {
      const finalnumber = (typeof quantity === 'number' ? (quantity || 0) : (quantity ? parseInt(quantity) : 0))
      totalQuantity += (finalnumber || 0)
    }
    return totalQuantity
  },
  quantityUnit: async ({ quantityUnit, purchaseOrderItems = [] }: PurchaseOrder) => {
    const units = []
    for (const { quantityUnit } of purchaseOrderItems) {
      if (!units.find(u => u === quantityUnit)) {
        units.push(quantityUnit)
      }
    }
    return units.join(',')
  },
  bookedQuantity: async ({ bookedQuantity, purchaseOrderItems = [] }: PurchaseOrder) => {
    return purchaseOrderItems.reduce((total, poItem) => {
      const finalNumber = (typeof poItem.bookedQuantity === 'number' ? (poItem.bookedQuantity || 0) : (poItem.bookedQuantity ? parseInt(poItem.bookedQuantity) : 0))
      return total + finalNumber
    }, 0)
  }
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

export async function applyAccessRightConditions(
  conditions?: IConditionalExpression,
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
          if (party.partyGroupCode === selectedPartyGroupCode) {
            selectedPartyType = selectedPartyType.concat(
              party.types.map((type: string) => {
                const con = [
                  'shipper',
                  'shipTo',
                  'factory',
                  'buyer',
                  'forwarder'
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
          new ColumnExpression('purchase_order', 'id'),
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

export default async function getDefaultParams(
  params: IQueryParams,
  conditions?: IConditionalExpression,
  queryName?: string,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
  if (user) {
    conditions = await applyAccessRightConditions(conditions, user, transaction)
  }
  return conditions
}
