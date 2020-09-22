import { QueryDef } from 'classes/query/QueryDef'
import { IQueryParams } from 'classes/query'
import {
  Query,ColumnExpression,
  FunctionExpression,
  BinaryExpression,
  Value,
 AndExpressions,
 FromTable,
 OrExpressions,
 Unknown,
} from 'node-jql'
import { RegisterInterface, registerAll } from 'utils/jql-subqueries';
const queryDef = new QueryDef(new Query('shipment'))



   



//select * from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA = "swivel360_ken" AND TABLE_NAME ="alert"


queryDef.table('shipment_date',new Query({
  $from: new FromTable({
    table: 'shipment',
      joinClauses: [
          {
              operator: 'LEFT',
              table: 'shipment_date',
              $on: new BinaryExpression(new ColumnExpression('shipment_date','shipmentId'),'=',new ColumnExpression('shipment','id'))
          }
      ]
  })
}))

queryDef.table('shipment_party',new Query({
  $from: new FromTable({
    table: 'shipment',
      joinClauses: [
          {
              operator: 'LEFT',
              table: 'shipment_party',
              $on: new BinaryExpression(new ColumnExpression('shipment_party','shipmentId'),'=',new ColumnExpression('shipment','id'))
          }
      ]
  })
}))


const oceanBillDateActualExpression=new ColumnExpression('shipment_date','oceanBillDateActual')
const officePartyCodeExpression=new ColumnExpression('shipment_party','officePartyCode')
const shipperPartyCodeExpression=new ColumnExpression('shipment_party','shipperPartyCode')
const dumbPartyCode = new FunctionExpression('IF',new BinaryExpression(new ColumnExpression('shipment','moduleTypeCode'),'=',new Value('AIR')),officePartyCodeExpression,shipperPartyCodeExpression)





const myIdExpression=new ColumnExpression('shipment','id')
//queryDef.registerBoth('myId',myIdExpression);

const isAirExpression = new FunctionExpression('IF',new BinaryExpression(new ColumnExpression('shipment','moduleTypeCode'),'=','AIR'),1,0)
//queryDef.registerBoth("isAir",isAirExpression);


const fieldList=[
  {
    name:"myId",
    expression:myIdExpression
  },
  {
    name:"isAir",
    expression:isAirExpression
  },
  {
    name:"oceanBillDateActual",
    expression:oceanBillDateActualExpression,
    companion:['table:shipment_date']
  },
  {
      name:"dumbPartyCode",
      expression:officePartyCodeExpression,
      companion:['table:shipment_party']

    },
  

  

] as RegisterInterface[];

registerAll(queryDef,'shipment',fieldList);

queryDef.subquery('isNotAir',new Query({
  $where:[
    new BinaryExpression(new ColumnExpression('shipment','moduleTypeCode'),'!=',new Value("AIR"))

  ]
}));



//SQL <- JQL <-queryDef<-QueryParam

// queryDef.subquery('q',new Query({
//   $where:[
//     new OrExpressions([
//       new BinaryExpression(new ColumnExpression('shipment','masterNo'),'=',new Unknown()),
//       new BinaryExpression(new ColumnExpression('shipment','hostNo'),'=',new Unknown())
//     ])

  
// })).register('value',0)
// .register('value',1)

//table:shipment_partycode officePartyCode, shipperPartyCode
//dumbPartCode=>shipment.moduleTypeCode ='AIR', office ,shipper,

//dumpPartCode :(value:"123")



export default queryDef;
