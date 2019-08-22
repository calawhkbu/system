
import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload'
import { Transaction } from 'sequelize'
import { Booking } from 'models/main/booking'

import { AlertDbService } from '../../../../swivel-backend-new/src/modules/sequelize/alert/service'
import { InvitationDbService } from '../../../../swivel-backend-new/src/modules/sequelize/invitation/service'
import { BookingService } from '../../../../swivel-backend-new/src/modules/sequelize/booking/service'

class EntityCreateInvitationEvent extends BaseEvent {

  constructor (

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

  public async mainFunction (parameters: any) {

    console.log(JSON.stringify(parameters), 'parameters')
    console.log('in main Excecute of EntityCreateInvitation')

    const invitationDbService = this.allService['InvitationDbService'] as InvitationDbService

    let entity = parameters.data

    if (entity.hasOwnProperty('dataValues')) {
      entity = JSON.parse(JSON.stringify(entity.dataValues))

    }

    const tableName = parameters.tableName

    const entityService = this.allService[`BookingService`] as BookingService

    const invitationUpdatedEntity = await invitationDbService.entityCreateInvitaion(entity, 'booking', this.user, this.transaction) as Booking

    if (invitationUpdatedEntity)
    {
      // warning: autoSave = true
      return await entityService.save({...entity, ...invitationUpdatedEntity}, this.user, this.transaction, true)
    }

  }
}

export default {

  execute: async (parameters: any, eventConfig: EventConfig, repo: string, eventService: any, allService: any, user?: JwtPayload, transaction?: Transaction) => {

    const event = new EntityCreateInvitationEvent(parameters, eventConfig, repo, eventService, allService, user, transaction)
    return await event.execute()

  }

}
