
import { BaseEvent } from 'modules/events/base-event'
import { EventService, EventConfig } from 'modules/events/service'
import { JwtPayload } from 'modules/auth/interfaces/jwt-payload';
import { Transaction } from 'sequelize';
import { AlertDbService } from '../../../../swivel-backend-new/src/modules/sequelize/alert/service';
import { BookingService } from '../../../../swivel-backend-new/src/modules/sequelize/booking/service';

import {Tracking} from '../../../../swivel-backend-new/src/models/main/tracking';


class TrackingUpdateDataEvent extends BaseEvent {

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


  public async mainFunction(parameters: any) {

    const data = parameters.data as Tracking


    // TODO : 


    // update eted/eta in booking

    // check if it changed too much 


    console.log(JSON.stringify(parameters), 'parameters')
    console.log('in main Excecute of TrackingUpdateData')

    const bookingService = this.allService['BookingService'] as BookingService

    const option = { where : {tableName : 'shipment'}, ...(this.transaction ? {transaction : this.transaction} : {})}

    await bookingService.find(option,this.user)

    console.log('in main Excecute of TrackingUpdateData Finish')

    return {
      'exampleResult': 'exampleValue'
    }
  }
}


export default {


  execute: async (parameters: any, eventConfig: EventConfig, repo: string, eventService: any, allService: any, user?: JwtPayload, transaction?: Transaction) => {

    const event = new TrackingUpdateDataEvent(parameters, eventConfig, repo, eventService, allService,user,transaction)
    return await event.execute()

  }

}
