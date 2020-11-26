import { IConditionalExpression, OrExpressions, AndExpressions, BinaryExpression, ColumnExpression, FunctionExpression, InExpression, Query, ResultColumn, FromTable, MathExpression } from 'node-jql'
import { JwtPayload, JwtPayloadParty } from 'modules/auth/interfaces/jwt-payload'
import { Transaction, Op } from 'sequelize'
import moment = require('moment')
import { Booking } from 'models/main/booking'
import { IQueryParams } from 'classes/query'

export const setDataFunction = {
  bookingCreateTime: async({ bookingCreateTime }: Booking, user: JwtPayload) => {
    if (!bookingCreateTime) {
      return moment.utc()
    }
    return bookingCreateTime
  },
  bookingLastUpdateTime: async({ bookingLastUpdateTime }: Booking, user: JwtPayload) => {
    if (!bookingLastUpdateTime) {
      return moment.utc()
    }
    return bookingLastUpdateTime
  },
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
          where: { erpCode: bookingParty.controllingCustomerPartyCode }
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
          where: { erpCode: bookingParty.shipperPartyCode }
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
          where: { erpCode: bookingParty.consigneePartyCode }
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
        totalQuantity += (quantity || 0)
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
  teu: async ({ teu = null, bookingContainers = [] }: Booking) => {
    if (!teu) {
      let total = 0
      for (const { containerTypeCode } of bookingContainers) {
        if (containerTypeCode) {
          try {
            const containerSize = parseInt(containerTypeCode.substring(0, 1))
            const containerTeu = containerSize / 20
            total += (containerTeu * 1) // load count must be 1
          } catch (e) {}
        }
      }
      return total
    }
    return teu
  },
  container20: async({ container20 = null, bookingContainers = [] }: Booking) => {
    if (!container20) {
      let total = 0
      for (const { containerTypeCode } of bookingContainers) {
        if (containerTypeCode && containerTypeCode.startsWith('20')) {
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
      for (const { containerTypeCode } of bookingContainers) {
        if (containerTypeCode && containerTypeCode.startsWith('40')) {
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
      for (const { containerTypeCode } of bookingContainers) {
        if (containerTypeCode && containerTypeCode.startsWith('45')) {
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
      for (const { containerTypeCode } of bookingContainers) {
        if (containerTypeCode && !containerTypeCode.startsWith('20') && !containerTypeCode.startsWith('40') && !containerTypeCode.startsWith('45')) {
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
    'loadOnboard',
    'customClearanceLoadingPort'
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
    'sentToConsignee',
    'customClearanceDestinationPort'
  ]
}

export const fixedPartyKeys = [
  'shipper',
  'consignee',
  'forwarder',
  'roAgent',
  'linerAgent',
  'agent',
  'controllingCustomer',
  'notifyParty',
]

export async function applyAccessRightConditions(
  conditions?: IConditionalExpression,
  user?: JwtPayload,
  transaction?: Transaction
): Promise<IConditionalExpression> {
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
        if (party.partyGroupCode === selectedPartyGroupCode) {
          for (const fixPartyKey of fixedPartyKeys) {
            selectedPartyType.push(new BinaryExpression(new ColumnExpression('booking_party', `${fixPartyKey}PartyId`), '=', party.id))
          }
          if (party.types && party.types.length > 0) {
            for (const type of party.types) {
              selectedPartyType.push(
                new BinaryExpression(
                  [...fixedPartyKeys, 'office'].includes(type)
                    ? new ColumnExpression(
                        'booking_party',
                        `${type === 'office' ? 'forwarder' : type}PartyId`
                      )
                    : new MathExpression(
                        new ColumnExpression('booking_party', 'flexData'),
                        '->>',
                        `$.${type}PartyId`
                      ),
                  '=',
                  party.id)
              )
            }
          }
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
