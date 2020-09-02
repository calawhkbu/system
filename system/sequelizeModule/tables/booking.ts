import { IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable, MathExpression } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Op } from 'sequelize'
import moment = require('moment')
import { Booking } from 'models/main/booking'

export const setDataFunction = {
  partyGroupCode: async({ partyGroupCode }: Booking, user: JwtPayload) => {
    if (user) {
      return user.selectedPartyGroup.code || partyGroupCode
    }
    return partyGroupCode
  },
  bookingNo: async({ bookingNo }: Booking, user: JwtPayload) => {
    if (!bookingNo) {
      let userPartyGroupId: string = (user ? user.selectedPartyGroup.id : '').toString()
      if (userPartyGroupId.length === 0) {
        userPartyGroupId = `00`
      } else if (userPartyGroupId.length === 1) {
        userPartyGroupId = `0${userPartyGroupId}`
      } else if (userPartyGroupId.length === 2) {
        userPartyGroupId = `0${userPartyGroupId}`
      } else if (userPartyGroupId.length === 3) {
        userPartyGroupId = `${userPartyGroupId}`
      }
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
      return `${userPartyGroupId}-${date}${random}`
    }
    return bookingNo
  },
  rSalesmanPersonCode: async ({ bookingParty }: Booking, user: JwtPayload, transaction: Transaction, context: any) => {
    if (bookingParty && bookingParty.controllingCustomerPartyCode) {
      const party = await context.partyTableService.findOneWithScope(
        'onlyItself',
        {
          where: { thirdPartyCode: { erp: bookingParty.controllingCustomerPartyCode } }
        } as any,
        user,
        transaction
      )
      if (party) {
        return party.salesmanCode
      }
    }
    return null
  },
  sSalesmanPersonCode: async ({ bookingParty }: Booking, user: JwtPayload, transaction: Transaction, context: any) => {
    if (bookingParty && bookingParty.shipperPartyCode) {
      const party = await context.partyTableService.findOneWithScope(
        'onlyItself',
        {
          where: { thirdPartyCode: { erp: bookingParty.shipperPartyCode } }
        } as any,
        user,
        transaction
      )
      if (party) {
        return party.salesmanCode
      }
    }
    return null
  },
  cSalesmanPersonCode: async ({ bookingParty }: Booking, user: JwtPayload, transaction: Transaction, context: any) => {
    if (bookingParty && bookingParty.consigneePartyCode) {
      const party = await context.partyTableService.findOneWithScope(
        'onlyItself',
        {
          where: { thirdPartyCode: { erp: bookingParty.consigneePartyCode } }
        } as any,
        user,
        transaction
      )
      if (party) {
        return party.salesmanCode
      }
    }
    return null
  },
  quantity: async({ quantity = null, bookingPopackings = [] }: Booking) => {
    if (!quantity) {
      let totalQuantity = 0
      for (const { quantity } of bookingPopackings) {
        totalQuantity += quantity
      }
      return totalQuantity
    }
    return quantity
  },
  quantityUnit: async ({ quantityUnit, bookingPopackings = [] }: Booking) => {
    if (!quantityUnit) {
      const units = []
      for (const { quantity, quantityUnit } of bookingPopackings) {
        if (!units.find(u => u === quantityUnit)) {
          units.push(quantityUnit)
        }
      }
      return units.join(',')
    }
    return quantityUnit
  },
  grossWeight: async({ grossWeight = null, bookingPopackings = [] }: Booking) => {
    if (!grossWeight) {
      let totalGrossWeight = 0
      for (const { weight, weightUnit = 'KGs' } of bookingPopackings) {
        totalGrossWeight += (weight || 0) / (weightUnit === 'LBs' ? 2.205 : 1)
      }
      return totalGrossWeight.toFixed(6)
    }
    return grossWeight
  },
  chargeableWeight: async({ chargeableWeight = null, bookingPopackings = [] }: Booking) => {
    if (!chargeableWeight) {
      let totalChargeableWeight = 0
      for (const { weight, weightUnit = 'KGs' } of bookingPopackings) {
        totalChargeableWeight += (weight || 0) / (weightUnit === 'LBs' ? 2.205 : 1)
      }
      return totalChargeableWeight.toFixed(6)
    }
    return chargeableWeight
  },
  volumeWeight: async ({ volumeWeight = null, bookingPopackings = [] }: Booking) => {
    if (!volumeWeight) {
      return 0
    }
    return volumeWeight
  },
  weightUnit: async ({ weightUnit = null, bookingPopackings = [] }: Booking) => {
    if (!weightUnit) {
      return 'KGs'
    }
    return weightUnit
  },
  cbm: async({ cbm = null, bookingPopackings = [] }: Booking) => {
    if (!cbm) {
      let totalCbm = 0
      for (const { length, width, height, lwhUnit } of bookingPopackings) {
        const l = (length || 0) / (lwhUnit === 'IN' ? 39.37 : 0.01)
        const w = (width || 0) / (lwhUnit === 'IN' ? 39.37 : 0.01)
        const h = (height || 0) / (lwhUnit === 'IN' ? 39.37 : 0.01)
        totalCbm += (l * w * h)
      }
      return totalCbm.toFixed(6)
    }
    return cbm
  },
  teu: async ({ teu = null, bookingPopackings = [] }: Booking) => {
    if (!teu) {
      return 0
    }
    return teu
  },
  container20: async({ container20 = null, bookingContainers = [] }: Booking) => {
    if (!container20) {
      let total = 0
      for (const { is20Container } of bookingContainers) {
        if (is20Container) {
          total++
        }
      }
      return total
    }
    return container20
  },
  container40: async({ container40 = null, bookingContainers = [] }: Booking) => {
    if (!container40) {
      let total = 0
      for (const { is40Container } of bookingContainers) {
        if (is40Container) {
          total++
        }
      }
      return total
    }
    return container40
  },
  containerHQ: async({ containerHQ = null, bookingContainers = [] }: Booking) => {
    if (!containerHQ) {
      let total = 0
      for (const { isHQContainer } of bookingContainers) {
        if (isHQContainer) {
          total++
        }
      }
      return total
    }
    return containerHQ
  },
  containerOthers: async({ containerOthers = null, bookingContainers = [] }: Booking) => {
    if (!containerOthers) {
      let total = 0
      for (const { isOtherContainer } of bookingContainers) {
        if (isOtherContainer) {
          total++
        }
      }
      return total
    }
    return containerOthers
  },
}

export const dateTimezoneMapping = {
  portOfLoading: [
    'departure',
    'oceanBill',
    'cargoReady',
    'scheduleAssigned',
    'scheduleApproaved',
    'spaceConfirmation',
    'bookingSubmit',
    'cyCutOff',
    'documentCutOff',
    'pickup',
    'shipperLoad',
    'returnLoad',
    'cargoReceipt',
    'shipperDocumentSubmit',
    'shipperInstructionSubmit',
    'houseBillDraftSubmit',
    'houseBillConfirmation',
    'masterBillReleased',
    'preAlertSend',
    'ediSend',
    'cargoRolloverStatus',
    'sentToShipper',
    'gateIn',
    'loadOnboard'
  ],
  portOfDischarge: [
    'arrival',
    'inboundTransfer',
    'onRail',
    'arrivalAtDepot',
    'availableForPickup',
    'pickupCargoBeforeDemurrage',
    'finalCargo',
    'cargoPickupWithDemurrage',
    'finalDoorDelivery',
    'returnEmptyContainer',
    'sentToConsignee'
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
        new ColumnExpression('booking', 'partyGroupCode'),
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
                  'consignee',
                  'office',
                  'forwarder',
                  'roAgent',
                  'linerAgent',
                  'agent',
                  'controllingCustomer',
                ].includes(type)
                  ? new ColumnExpression(
                      'booking_party',
                      `${type === 'office' ? 'forwarder' : type}PartyId`
                    )
                  : new MathExpression(
                      new ColumnExpression('booking_party', 'flexData'),
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
          new ColumnExpression('booking', 'id'),
          false,
          new Query({
            $select: [new ResultColumn(new ColumnExpression('booking_party', 'bookingId'))],
            $from: new FromTable('booking_party'),
            $where: new OrExpressions({ expressions: partyTypesExpressions }),
          })
        )
        conditions = conditions ? new AndExpressions([conditions, or]) : or
      }
    }
  }
  return conditions
}
