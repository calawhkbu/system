import { QueryDef } from 'classes/query/QueryDef'
import {
  Query,
  FromTable,
  ResultColumn,
  GroupBy,
  BinaryExpression,
  BetweenExpression,
  RegexpExpression,
  ColumnExpression,
  FunctionExpression,
  ParameterExpression,
  InExpression,
  IsNullExpression,
  OrExpressions,
  AndExpressions,
  CreateFunctionJQL,
} from 'node-jql'

const query = new QueryDef(
  new Query({
    $select: [
      new ResultColumn(new ColumnExpression('purchase_order', '*')),
      new ResultColumn(new ColumnExpression('flex_data', 'data')),
      new ResultColumn(new ColumnExpression('purchase_order_item', '*')),
      // avoid id being overwritten
      new ResultColumn(new ColumnExpression('purchase_order', 'id'), 'purchaseOrderId')
    ],
    $distinct: true,
    $from: new FromTable(
      'purchase_order',
      {
        operator: 'LEFT',
        table: 'flex_data',
        $on: [
          new BinaryExpression(new ColumnExpression('flex_data', 'tableName'), '=', 'purchase_order'),
          new BinaryExpression(
            new ColumnExpression('purchase_order', 'id'),
            '=',
            new ColumnExpression('flex_data', 'primaryKey')
          ),
        ],
      },
      {
        operator: 'LEFT',
        table: new FromTable({
          table: new Query({
            $select: [
              new ResultColumn(new ColumnExpression('purchase_order_item', 'poId'), 'poId'),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('product', 'productCode'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'productCode'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('product', 'name'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'productName'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('product', 'skuCode'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'productSkuCode'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('product', 'description'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'productDesctiption'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('product_category', 'name'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'productCategoryName'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('product_category', 'description'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'productCategoryDesctiption'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new ColumnExpression('purchase_order_item', 'htsCode'),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'htsCode'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new FunctionExpression(
                      'concat',
                      new ColumnExpression('purchase_order_item', 'length'),
                      new ColumnExpression('purchase_order_item', 'lwhUnit'),
                      ' x ',
                      new ColumnExpression('purchase_order_item', 'width'),
                      new ColumnExpression('purchase_order_item', 'lwhUnit'),
                      ' x ',
                      new ColumnExpression('purchase_order_item', 'height'),
                      new ColumnExpression('purchase_order_item', 'lwhUnit'),
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'lwh'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new FunctionExpression(
                      'concat',
                      new ColumnExpression('purchase_order_item', 'ctnFrom'),
                      ' - ',
                      new ColumnExpression('purchase_order_item', 'ctnTo'),
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'ctn'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('purchase_order_item', 'ctns')
                ),
                'totalCtns'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new FunctionExpression(
                      'concat',
                      new ColumnExpression('purchase_order_item', 'grossWeight'),
                      new ColumnExpression('purchase_order_item', 'weightUnit'),
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'weight'
              ),
              new ResultColumn(new FunctionExpression('SUM', new ColumnExpression('purchase_order_item', 'grossWeight')), 'totalGrossWeight'),
              new ResultColumn(new FunctionExpression('SUM', new ColumnExpression('purchase_order_item', 'volume')), 'totalVolume'),
              new ResultColumn(
                new FunctionExpression(
                  'group_concat',
                  new ParameterExpression({
                    expression: new FunctionExpression(
                      'concat',
                      new ColumnExpression('purchase_order_item', 'quantity'),
                      new ColumnExpression('purchase_order_item', 'quantityUnit'),
                    ),
                    suffix: 'SEPARATOR \', \'',
                  })
                ),
                'quantity'
              ),
              new ResultColumn(
                new FunctionExpression(
                  'SUM',
                  new ColumnExpression('purchase_order_item', 'quantity')
                ),
                'totalQuantity'
              ),
            ],
            $from: new FromTable('purchase_order_item', 'purchase_order_item', {
              operator: 'LEFT',
              table: new FromTable('flex_data', 'flex_data'),
              $on: [
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'tableName'),
                  '=',
                  'purchase_order_item'
                ),
                new BinaryExpression(
                  new ColumnExpression('flex_data', 'primaryKey'),
                  '=',
                  new ColumnExpression('purchase_order_item', 'id')
                ),
              ],
            }, {
              operator: 'LEFT',
              table: new FromTable('product', 'product'),
              $on: [
                new BinaryExpression(
                  new ColumnExpression('purchase_order_item', 'productId'),
                  '=',
                  new ColumnExpression('product', 'id'),
                ),
              ],
            }, {
              operator: 'LEFT',
              table: new FromTable('product_category', 'product_category'),
              $on: [
                new BinaryExpression(
                  new ColumnExpression('product', 'productCategoryId'),
                  '=',
                  new ColumnExpression('product_category', 'id'),
                ),
              ],
            }),
            $where: new AndExpressions({
              expressions: [
                new IsNullExpression(new ColumnExpression('purchase_order_item', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('purchase_order_item', 'deletedBy'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression('flex_data', 'deletedBy'), false),
              ],
            }),
            $group: new GroupBy([new ColumnExpression('purchase_order_item', 'poId')]),
          }),
          $as: 'purchase_order_item',
        }),
        $on: new BinaryExpression(
          new ColumnExpression('purchase_order', 'id'),
          '=',
          new ColumnExpression('purchase_order_item', 'poId')
        ),
      }
    ),
  })
)

query.register('noOfBookings', {
  expression: new FunctionExpression({
    name: 'COUNT',
    parameters: new ParameterExpression({
      prefix: 'DISTINCT',
      expression: new ColumnExpression('*'),
    }),
  }),
  $as: 'noOfPurchaseOrders',
})

query
  .register(
    'partyGroupCode',
    new Query({
      $where: new BinaryExpression(new ColumnExpression('purchase_order', 'partyGroupCode'), '='),
    })
  )
  .register('value', 0)

export default query
