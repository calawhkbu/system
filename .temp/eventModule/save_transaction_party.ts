import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'

class ExampleEvent extends BaseEvent {
  constructor(
    protected readonly parameters: any,
    protected readonly eventConfig: EventConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: any,

    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(parameters, eventConfig, repo, eventService, allService, user, transaction)
  }

  private async saveTransactionParty(
    invitationUpdatedEntity: Booking,
    transaction: Transaction,
    person: JwtPayload,
    party: string
  ){
    return await this.transactionParty.save(
      {
        tableName: 'booking',
        primaryKey: invitationUpdatedEntity.id,
        partyId:
          invitationUpdatedEntity[`${party}PartyId`] ||
          invitationUpdatedEntity.flexData.data[`${party}PartyId`],
        partyType: party,
      } as TransactionParty,
      person,
      transaction
    ) as TransactionParty
  }

  private async saveTransactionPerson(
    invitationUpdatedEntity: Booking,
    transaction: Transaction,
    person: JwtPayload,
    party: string
  ){
    if (
      invitationUpdatedEntity[`${party}PartyContactPersonId`] ||
      invitationUpdatedEntity.flexData.data[`${party}PartyContactPersonId`]
    ) {
      await this.transactionPerson.save(
        {
          tableName: 'booking',
          primaryKey: invitationUpdatedEntity.id,
          personId:
            invitationUpdatedEntity[`${party}PartyContactPersonId`] ||
            invitationUpdatedEntity.flexData.data[`${party}PartyContactPersonId`],
          partyId:
            invitationUpdatedEntity[`${party}PartyId`] ||
            invitationUpdatedEntity.flexData.data[`${party}PartyId`],
          personType: party,
        } as TransactionPerson,
        person,
        transaction
      )
    }
    if (invitationUpdatedEntity[`${party}PartyContacts`]) {
      if (invitationUpdatedEntity[`${party}PartyContacts`].length) {
        for (const contact of invitationUpdatedEntity[`${party}PartyContacts`]) {
          await this.transactionPerson.save(
            {
              tableName: 'booking',
              primaryKey: invitationUpdatedEntity.id,
              personId: contact.PersonId,
              partyId:
                invitationUpdatedEntity[`${party}PartyId`] ||
                invitationUpdatedEntity.flexData.data[`${party}PartyId`],
              personType: party,
            } as TransactionPerson,
            person,
            transaction
          )
        }
      }
    }
    if (invitationUpdatedEntity.flexData.data[`${party}PartyContacts`]) {
      if (invitationUpdatedEntity.flexData.data[`${party}PartyContacts`].length) {
        for (const contact of invitationUpdatedEntity.flexData.data[`${party}PartyContacts`]) {
          await this.transactionPerson.save(
            {
              tableName: 'booking',
              primaryKey: invitationUpdatedEntity.id,
              personId: contact.PersonId,
              partyId:
                invitationUpdatedEntity[`${party}PartyId`] ||
                invitationUpdatedEntity.flexData.data[`${party}PartyId`],
              personType: party,
            } as TransactionPerson,
            person,
            transaction
          )
        }
      }
    }
    return[]
  }




  private async deleteOldTransactionParty(
    oldEntity: Booking,
    transaction: Transaction,
    person: JwtPayload,
    party: string
  ){
    const matchParty = await this.transactionParty.find({
        where: {
          tableName: 'booking',
          primaryKey: oldEntity.id,
          partyType: party,
          deletedAt: null,
        },
        transaction,
      })
    if (matchParty.length) {
      for (const party of matchParty) {
        this.transactionParty.delete(party.id, person, transaction)
      }
    }
    return []
  }
  private async deleteOldTransactionPerson(
    oldEntity: Booking,
    transaction: Transaction,
    person: JwtPayload,
    party: string
  ){
    const matchPerson = await this.transactionPerson.find({
      where: {
        tableName: 'booking',
        primaryKey: oldEntity.id,
        personType: party,
        deletedAt: null,
      },
      transaction,
    })
    if (matchPerson.length) {
      for (const per of matchPerson) {
        this.transactionPerson.delete(per.id, person, transaction)
      }
    }
    return []
  }

  public async mainFunction(parameters: any) {
    const {
      oldData = null,
      data = null
    } = parameters

    // AFTER CREATE
    // const markedPartiesList = ['shipper', 'consignee', 'forwarder', 'notifyParty', 'agent']
    // const morePartiesList = invitationUpdatedEntity.flexData.data.moreParty
    // const totalPartiesList = morePartiesList
    //   ? markedPartiesList.concat(morePartiesList)
    //   : markedPartiesList
    // for (const party of totalPartiesList) {
    //   if (
    //     invitationUpdatedEntity[`${party}PartyId`] ||
    //     invitationUpdatedEntity.flexData.data[`${party}PartyId`]
    //   ) {
    //     await this.saveTransactionParty(invitationUpdatedEntity, transaction, person, party)
    //     await this.saveTransactionPerson(invitationUpdatedEntity, transaction, person, party)
    //   }
    // }

    // AFTER UPDATE
    // return oldEntity

    // const markedPartiesList = ['shipper', 'consignee', 'forwarder', 'notifyParty', 'agent']
    // const morePartiesList = invitationUpdatedEntity.flexData.data.moreParty
    // const totalPartiesList = morePartiesList
    //   ? markedPartiesList.concat(morePartiesList)
    //   : markedPartiesList
    // for (const party of totalPartiesList) {
    //   await this.deleteOldTransactionParty(oldEntity, transaction, person, party)
    //   await this.deleteOldTransactionPerson(oldEntity, transaction, person, party)
    //   if (
    //     invitationUpdatedEntity[`${party}PartyId`] ||
    //     invitationUpdatedEntity.flexData.data[`${party}PartyId`]
    //   ) {
    //     await this.saveTransactionParty(invitationUpdatedEntity, transaction, person, party)
    //     await this.saveTransactionPerson(invitationUpdatedEntity, transaction, person, party)
    //   }
    // }

      // if (!matchParty.length)
      // {
      //   await this.transactionParty.save(
      //     {
      //       tableName: 'booking',
      //       primaryKey: invitationUpdatedEntity.id,
      //       partyId: invitationUpdatedEntity[`${party}PartyId`] || invitationUpdatedEntity.flexData.data[`${party}PartyId`],
      //       partyType: party   } as TransactionParty,
      //     person,
      //     transaction
      //   )
      // }
      // else
      // {
      //   if (invitationUpdatedEntity[`${party}PartyId`] === null || invitationUpdatedEntity.flexData.data[`${party}PartyId`] === null)
      //   {
      //     this.transactionParty.delete(matchParty[0].id, person, transaction)
      //   }
      //   else
      //   {
      //     await this.transactionParty.save(
      //       {
      //         id: matchParty[0].id,
      //         tableName: 'booking',
      //         primaryKey: invitationUpdatedEntity.id,
      //         partyId: invitationUpdatedEntity[`${party}PartyId`] || invitationUpdatedEntity.flexData.data[`${party}PartyId`],
      //         partyType: party   } as TransactionParty,
      //       person,
      //       transaction
      //     ) as TransactionParty
      //   }
      // }
    // }

    return {
      exampleResult: 'exampleValue',
    }
  }
}

export default {
  execute: async(
    parameters: any,
    eventConfig: EventConfig,
    repo: string,
    eventService: any,
    allService: any,
    user?: JwtPayload,
    transaction?: Transaction
  ) => {
    const event = new ExampleEvent(
      parameters,
      eventConfig,
      repo,
      eventService,
      allService,
      user,
      transaction
    )
    return await event.execute()
  },
}
