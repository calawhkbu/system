import {
  MathExpression,
  ColumnExpression,
  IQueryParams,
  Value,
  CaseExpression,
  IsNullExpression,
  FunctionExpression,
  BinaryExpression,
  AndExpressions,
  OrExpressions,
  ICase


} from 'node-jql'
import { ExpressionHelperInterface, registerAll, SummaryField, registerSummaryField, NestedSummaryCondition, registerAllDateField, addDateExpression, convertToEndOfDate, convertToStartOfDate, registerQueryCondition, registerCheckboxField, registerNestedSummaryFilter, IfExpression, IfNullExpression, RegisterInterface, passSubquery } from 'utils/jql-subqueries'
import { QueryDef } from 'classes/query/QueryDef'

export default function(query:QueryDef)
{
 

 const dateStatusExpression = (queryParam: IQueryParams) => {

  const subqueryParam = queryParam.subqueries.dateStatus as any as { today: any, currentTime: any }

  if (!subqueryParam) {
    throw new Error(`missing dateStatus in subqueries`)
  }

  const rawATAExpression = new ColumnExpression('shipment_date', 'arrivalDateActual')
  const rawETAExpression = new ColumnExpression('shipment_date', 'arrivalDateEstimated')

  const rawATDExpression = new ColumnExpression('shipment_date', 'departureDateActual')
  const rawETDExpression = new ColumnExpression('shipment_date', 'departureDateEstimated')

  const rawfinalDoorDeliveryActualExpression = new ColumnExpression('shipment_date', 'finalDoorDeliveryDateActual')
  const rawfinalDoorDeliveryEstimatedExpression = new ColumnExpression('shipment_date', 'finalDoorDeliveryDateEstimated')

  const rawsentToCosigneeActualExpression = new ColumnExpression('shipment_date', 'sentToConsigneeDateActual')
  const rawsentToCosigneeEstimatedExpression = new ColumnExpression('shipment_date', 'sentToConsigneeDateEstimated')


  const AIRDateStatusExpression = (subqueryParam) => {

    // const todayExpression = new FunctionExpression('NOW')
    const todayExpression = new Value(subqueryParam.today)
    const currentTimeExpression = new Value(subqueryParam.currentTime)

    const calculatedATAExpression = new CaseExpression({
      cases: [
        {
          $when: new IsNullExpression(rawETAExpression, true),
          $then: convertToEndOfDate(rawETAExpression)
        },
        {
          $when: new IsNullExpression(rawETDExpression, true),
          $then: convertToEndOfDate(addDateExpression(rawETDExpression, 2, 'DAY'))
        }

      ],

      $else: new Value(null)

    })

    const calculatedATDExpression = convertToStartOfDate(addDateExpression(rawETDExpression, 1, 'DAY'))
    const finalATAExpression = new FunctionExpression('IFNULL', rawATAExpression, calculatedATAExpression)
    const finalATDExpression = new FunctionExpression('IFNULL', rawATDExpression, calculatedATDExpression)

    const finalATAInPast = new BinaryExpression(finalATAExpression, '<=', currentTimeExpression)
    const finalATDInPast = new BinaryExpression(new FunctionExpression('DATE', finalATDExpression), '<=', todayExpression)

    return new CaseExpression({

      cases: [

        {
          $when: finalATAInPast,
          $then: new CaseExpression({

            cases: [
              {
                $when: new AndExpressions([
                  new BinaryExpression(convertToEndOfDate(addDateExpression(finalATAExpression, 1, 'DAY')), '<=', currentTimeExpression),
                  new OrExpressions([
                    new IsNullExpression(rawfinalDoorDeliveryActualExpression, true),
                    new IsNullExpression(rawfinalDoorDeliveryEstimatedExpression, true),
                    new IsNullExpression(rawsentToCosigneeActualExpression, true),
                    new IsNullExpression(rawsentToCosigneeEstimatedExpression, true),
                  ])
                ]),
                $then: new Value('inDelivery')
              },
            ],

            $else: new Value('arrival')
          })
        },

        {

          $when: finalATDInPast,
          $then: new CaseExpression({

            cases: [
              {
                $when: new BinaryExpression(new FunctionExpression('DATE', finalATDExpression), '=', todayExpression),
                $then: new Value('departure')
              },

            ],

            $else: new Value('inTransit')
          })
        }

      ],
      $else: new Value('upcoming')
    })

  }

  const SEADateStatusExpression = (subqueryParam) => {

    const todayExpression = new Value(subqueryParam.today)
    const currentTimeExpression = new Value(subqueryParam.currentTime)

    const calculatedATAExpression = addDateExpression(rawETAExpression, 2, 'DAY')
    const calculatedATDExpression = addDateExpression(rawETDExpression, 1, 'DAY')
    const finalATAExpression = new FunctionExpression('IFNULL', rawATAExpression, calculatedATAExpression)
    const finalATDExpression = new FunctionExpression('IFNULL', rawATDExpression, calculatedATDExpression)

    const finalATAInPast = new BinaryExpression(finalATAExpression, '<=', todayExpression)
    const finalATDInPast = new BinaryExpression(finalATDExpression, '<=', todayExpression)

    return new CaseExpression({

      cases: [

        {
          $when: finalATAInPast,
          $then: new CaseExpression({
            cases: [
              {
                $when: new AndExpressions([
                  new BinaryExpression(addDateExpression(finalATAExpression, 3, 'DAY'), '<=', todayExpression),
                  new OrExpressions([
                    new IsNullExpression(rawfinalDoorDeliveryActualExpression, true),
                    new IsNullExpression(rawfinalDoorDeliveryEstimatedExpression, true),
                    new IsNullExpression(rawsentToCosigneeActualExpression, true),
                    new IsNullExpression(rawsentToCosigneeEstimatedExpression, true),
                  ])
                   ]),
                $then: new Value('inDelivery')
              } as ICase,
            ],

            $else: new Value('arrival')
          }
          )
        },

        {
          $when: finalATDInPast,
          $then: new CaseExpression({
            cases: [
              {
                $when: new AndExpressions([
                  new BinaryExpression(addDateExpression(finalATDExpression, 3, 'DAY'), '<=', todayExpression)
                ]),
                $then: new Value('inTransit')
              } as ICase,
            ],

            $else: new Value('departure')
          }
          )
        },

        // {
        //   $when : new AndExpressions([
        //     new IsNullExpression(finalATAExpression, false),
        //     new BinaryExpression(addDateExpression(finalATDExpression, 'add', 3, 'DAY'), '<=', todayExpression)
        //   ]),
        //   $then : new Value('inTransit')
        // } as ICase,
        // {
        //   $when : new AndExpressions([

        //     new IsNullExpression(finalATAExpression, false),
        //     new BetweenExpression(finalATDExpression, false, todayExpression, addDateExpression(todayExpression, 'add', 3, 'DAY'))

        //   ]),
        //   $then : new Value('departure')
        // } as ICase,

        // {
        //   $when : new AndExpressions([
        //     new IsNullExpression(finalATAExpression, false),
        //     new BinaryExpression(finalATDExpression, '<', todayExpression)
        //   ]),
        //   $then : new Value('upcoming')
        // } as ICase,

      ],

      $else: new Value('upcoming')
    })
  }

  const result = new CaseExpression({

    cases: [
      {
        $when: new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'AIR'),
        $then: AIRDateStatusExpression(subqueryParam)
      },
      {
        $when: new BinaryExpression(new ColumnExpression('shipment', 'moduleTypeCode'), '=', 'SEA'),
        $then: SEADateStatusExpression(subqueryParam)
      }

    ],
    $else: new Value(null)
  })

  return result

}

const fieldList=[
  {
    name: 'dateStatus',
    expression: dateStatusExpression,
    companion: ['table:shipment_date']
  }
]as ExpressionHelperInterface[]


  registerAll(query, 'shipment', fieldList,true)
  return query
}
