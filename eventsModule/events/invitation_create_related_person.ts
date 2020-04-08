import { EventService, EventConfig, EventHandlerConfig, EventData } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Invitation } from 'models/main/invitation'
import { InvitationDbService } from 'modules/sequelize/invitation/service'
import { RelatedPerson } from 'models/main/relatedPerson'
import { RelatedPersonDatabaseService } from 'modules/sequelize/relatedPerson/service'
import BaseEventHandler from 'modules/events/baseEventHandler'
import { IFindOptions } from 'sequelize-typescript'

export default class InvitationCreateRelatedPersonEvent extends BaseEventHandler {
  constructor(
    protected  eventDataList: EventData<any>[],
    protected readonly eventHandlerConfig: EventHandlerConfig,
    protected readonly repo: string,
    protected readonly eventService: EventService,
    protected readonly allService: any,

    protected readonly user?: JwtPayload,
    protected readonly transaction?: Transaction
  ) {
    super(eventDataList, eventHandlerConfig, repo, eventService, allService, user, transaction)
  }

  public async mainFunction(eventDataList: EventData<Invitation>[]) {
    console.debug('Start Excecute...', this.constructor.name)

    const {
      RelatedPersonDatabaseService: relatedPersonDatabaseService
    } = this.allService as {
      RelatedPersonDatabaseService: RelatedPersonDatabaseService

    }

    const createRelatedPersonList = []

    const relatedPersonRawDataList = []

    eventDataList.map(eventData => {

      const { latestEntity } = eventData

      const person = latestEntity.person

      const partyIdList = person.parties.map(x => x.id)

      // extra the useful information from person
      const personPhoneContact = person.contacts.find(x => x.contactType === 'phone')
      const phone = personPhoneContact ? personPhoneContact.content : undefined

      const nameString = (person.firstName || '') + (person.lastName || '')
      const name = nameString.length ? nameString : undefined

      const dataList = partyIdList.map(partyId => {

        return {
          email : person.userName,
          partyId,
          name,
          phone,
          personId : person.id

        } as RelatedPerson
      })

      relatedPersonRawDataList.concat(dataList)

    })

    const findOptions = {

      where : relatedPersonDatabaseService.generateOrFilter(relatedPersonRawDataList, ['email', 'partyId'])

    } as IFindOptions<RelatedPerson>

    const existingRelatedPersonList = await relatedPersonDatabaseService.find(findOptions, this.user, this.transaction)

    const rawEntityMap = relatedPersonRawDataList.map(x => ({ rawData : x }))
    const entityMap = relatedPersonDatabaseService.mergeEntityList(rawEntityMap, existingRelatedPersonList, 'rawData', 'foundEntity') as {  rawData: RelatedPerson , foundEntity: RelatedPerson}[]

    // create not found case
    const needCreateEntityList = entityMap.filter(x => !x.foundEntity).map(x => x.rawData)

    const createdEntityList = await relatedPersonDatabaseService.create(needCreateEntityList, this.user, this.transaction)

    // update existing case

    const foundEntityMap = entityMap.filter(x => !!x.foundEntity)

    const entityToUpdateMap = foundEntityMap.map( ({ rawData, foundEntity}) => {
      const entityToUpdate =  {
        ...foundEntity,
        personId : rawData.personId
      } as RelatedPerson

      return { rawData, foundEntity, entityToUpdate}
    })

    const updatedEntityList = await relatedPersonDatabaseService.update(
      entityToUpdateMap.map(x => (x.entityToUpdate)),
      entityToUpdateMap.map(x => (x.foundEntity)),
      this.user,
      this.transaction,
      true
    )

    const result = createRelatedPersonList.concat(updatedEntityList)

    console.debug('End Excecute...', this.constructor.name)
    return result

  }
}
