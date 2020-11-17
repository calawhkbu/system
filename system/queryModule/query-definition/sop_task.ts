import { IQueryParams } from "classes/query"
import { QueryDef } from "classes/query/QueryDef"
import { IShortcut } from "classes/query/Shortcut"
import { isSopTaskSupported, sopTaskSettings, sopTaskSupportedTables } from "modules/sop-task/settings"
import { AndExpressions, BinaryExpression, CaseExpression, ColumnExpression, ExistsExpression, Expression, FromTable, FunctionExpression, InExpression, IsNullExpression, JoinClause, MathExpression, OrderBy, OrExpressions, ParameterExpression, Query, QueryExpression, ResultColumn, Unknown, Value } from "node-jql"
import { IfExpression, IfNullExpression, wrapOrder } from "utils/jql-subqueries"
import { generalIsClosedExpression, generalIsDeletedExpression, generalIsDoneExpression, getEntityExpression, getEntityExpressionSubquery, getEntityPartySubquery, getIsDueTodayExpression, hasSubTaskQuery, taskStatusJoinClauses } from "utils/sop-task"

const taskTable = 'sop_task'
const taskStatusTable = 'sop_task_status'
const templateTaskTable = 'sop_template_task'
const templateTemplateTaskTable = 'sop_template_template_task'
const selectedTemplateTable = 'sop_selected_template'
const templateTable = 'sop_template'

const statusList = ['Dead', 'Due', 'Open', 'Not Ready', 'Done', 'Closed', 'Deleted']

const query = new QueryDef({
  $from: new FromTable(taskTable,
    new JoinClause('LEFT', new FromTable(taskTable, 'parent'),
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(taskTable, 'parentId'), '=', new ColumnExpression('parent', 'id')),
        new IsNullExpression(new ColumnExpression('parent', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('parent', 'deletedBy'), false)
      ])
    ),
    ...taskStatusJoinClauses()
  )
})

const shortcuts: IShortcut[] = [
  // table:sop_template_task
  {
    type: 'table',
    name: 'sop_template_task',
    queryArg: re => params => ({
      $from: new FromTable(taskTable, new JoinClause('INNER', templateTaskTable,
        new AndExpressions([
          new BinaryExpression(new ColumnExpression(taskTable, 'taskId'), '=', new ColumnExpression(templateTaskTable, 'id')),
          new BinaryExpression(new ColumnExpression(templateTaskTable, 'partyGroupCode'), '=', params.subqueries.partyGroupCode.value)
        ])
      ))
    })
  },

  // table:sop_template_template_task
  {
    type: 'table',
    name: 'sop_template_template_task',
    queryArg: re => params => ({
      $from: new FromTable(taskTable, new JoinClause('LEFT', templateTemplateTaskTable,
        new AndExpressions([
          new BinaryExpression(new ColumnExpression(templateTaskTable, 'id'), '=', new ColumnExpression(templateTemplateTaskTable, 'taskId')),
          new BinaryExpression(new ColumnExpression(templateTable, 'id'), '=', new ColumnExpression(templateTemplateTaskTable, 'templateId'))
        ])
      ))
    }),
    companions: ['table:sop_template_task', 'table:sop_template']
  },

  // table:sop_template
  {
    type: 'table',
    name: 'sop_template',
    fromTable: new FromTable(taskTable, new JoinClause('LEFT', templateTable,
      new AndExpressions([
        new BinaryExpression(new ColumnExpression(taskTable, 'templateId'), '=', new ColumnExpression(templateTable, 'id')),
        new IsNullExpression(new ColumnExpression(templateTable, 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression(templateTable, 'deletedBy'), false)
      ])
    ))
  },

  // field:id
  {
    type: 'field',
    name: 'id',
    expression: new ColumnExpression(taskTable, 'id'),
    registered: true
  },

  // field:tableName
  {
    type: 'field',
    name: 'tableName',
    expression: new ColumnExpression(taskTable, 'tableName'),
    registered: true
  },

  // field:primaryKey
  {
    type: 'field',
    name: 'primaryKey',
    expression: new ColumnExpression(taskTable, 'primaryKey'),
    registered: true
  },

  // field:templateId
  {
    type: 'field',
    name: 'templateId',
    expression: new ColumnExpression(taskTable, 'templateId'),
    registered: true
  },

  // field:taskId
  {
    type: 'field',
    name: 'taskId',
    expression: new ColumnExpression(taskTable, 'taskId'),
    registered: true
  },

  // field:parentId
  {
    type: 'field',
    name: 'parentId',
    expression: new ColumnExpression(taskTable, 'parentId'),
    registered: true
  },

  // field:remark
  {
    type: 'field',
    name: 'remark',
    expression: new ColumnExpression(taskTable, 'remark'),
    registered: true
  },

  // field:calculatedStartAt
  {
    type: 'field',
    name: 'calculatedStartAt',
    expression: new ColumnExpression(taskTable, 'startAt'),
    registered: true
  },

  // field:inputStartAt
  {
    type: 'field',
    name: 'inputStartAt',
    expression: new ColumnExpression(taskTable, 'inputStartAt'),
    registered: true
  },

  // field:startAtLocale
  {
    type: 'field',
    name: 'startAtLocale',
    expression: new ColumnExpression(taskTable, 'startAtLocale')
  },

  // field:calculatedDueAt
  {
    type: 'field',
    name: 'calculatedDueAt',
    expression: new ColumnExpression(taskTable, 'dueAt'),
    registered: true
  },

  // field:inputDueAt
  {
    type: 'field',
    name: 'inputDueAt',
    expression: new ColumnExpression(taskTable, 'inputDueAt'),
    registered: true
  },

  // field:dueAtLocale
  {
    type: 'field',
    name: 'dueAtLocale',
    expression: new ColumnExpression(taskTable, 'dueAtLocale')
  },

  // field:dueScore
  {
    type: 'field',
    name: 'dueScore',
    expression: new ColumnExpression(taskTable, 'dueScore'),
    registered: true
  },

  // field:calculatedDeadline
  {
    type: 'field',
    name: 'calculatedDeadline',
    expression: new ColumnExpression(taskTable, 'deadline'),
    registered: true
  },

  // field:inputDeadline
  {
    type: 'field',
    name: 'inputDeadline',
    expression: new ColumnExpression(taskTable, 'inputDeadline'),
    registered: true
  },

  // field:deadlineLocale
  {
    type: 'field',
    name: 'deadlineLocale',
    expression: new ColumnExpression(taskTable, 'deadlineLocale')
  },

  // field:deadlineScore
  {
    type: 'field',
    name: 'deadlineScore',
    expression: new ColumnExpression(taskTable, 'deadlineScore'),
    registered: true
  },

  // field:deletedAt
  {
    type: 'field',
    name: 'deletedAt',
    expression: new ColumnExpression(taskTable, 'deletedAt'),
    registered: true
  },

  // field:deletedBy
  {
    type: 'field',
    name: 'deletedBy',
    expression: new ColumnExpression(taskTable, 'deletedBy'),
    registered: true
  },

  // field:partyGroupCode
  {
    type: 'field',
    name: 'partyGroupCode',
    expression: new ColumnExpression(templateTaskTable, 'partyGroupCode'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:partyGroupTaskId
  {
    type: 'field',
    name: 'partyGroupTaskId',
    expression: new ColumnExpression(templateTaskTable, 'uniqueId'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:system
  {
    type: 'field',
    name: 'system',
    expression: new ColumnExpression(templateTaskTable, 'system'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:category
  {
    type: 'field',
    name: 'category',
    expression: new ColumnExpression(templateTaskTable, 'category'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:name
  {
    type: 'field',
    name: 'name',
    expression: new ColumnExpression(templateTaskTable, 'name'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:description
  {
    type: 'field',
    name: 'description',
    expression: new ColumnExpression(templateTaskTable, 'description'),
    registered: true,
    companions: ['table:sop_template_task']
  },

  // field:group
  {
    type: 'field',
    name: 'group',
    expression: new ColumnExpression(templateTable, 'group'),
    registered: true,
    companions: ['table:sop_template']
  },

  // field:defaultSeqNo
  {
    type: 'field',
    name: 'defaultSeqNo',
    expression: new ColumnExpression(templateTemplateTaskTable, 'seqNo'),
    registered: true,
    companions: ['table:sop_template_template_task']
  },

  // field:seqNo
  {
    type: 'field',
    name: 'seqNo',
    expression: re => IfExpression(new BinaryExpression(new ColumnExpression(taskTable, 'seqNo'), '=', new Value(0)), re['defaultSeqNo'], new ColumnExpression(taskTable, 'seqNo')),
    registered: true
  },

  // field:categorySeqNo
  {
    type: 'field',
    name: 'categorySeqNo',
    expression: re => new QueryExpression(new Query({
      $select: new ResultColumn(new ColumnExpression('temp_template', 'seqNo'), 'seqNo'),
      $from: new FromTable(templateTable, 'temp_template', new JoinClause('LEFT', new FromTable(selectedTemplateTable, 'temp_selected_template'), new AndExpressions([
        new BinaryExpression(new ColumnExpression('temp_selected_template', 'templateId'), '=', new ColumnExpression('temp_template', 'id')),
        new IsNullExpression(new ColumnExpression('temp_selected_template', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('temp_selected_template', 'deletedBy'), false)
      ]))),
      $where: [
        new BinaryExpression(new ColumnExpression('temp_selected_template', 'tableName'), '=', re['tableName']),
        new BinaryExpression(new ColumnExpression('temp_selected_template', 'primaryKey'), '=', re['primaryKey']),
        new IsNullExpression(new ColumnExpression('temp_template', 'deletedAt'), false),
        new IsNullExpression(new ColumnExpression('temp_template', 'deletedBy'), false),
        new BinaryExpression(new ColumnExpression('temp_template', 'category'), '=', re['category'])
      ],
      $limit: 1
    }))
  },

  // field:count
  {
    type: 'field',
    name: 'count',
    expression: re => new FunctionExpression('COUNT', new ParameterExpression('DISTINCT', re['id']))
  },

  // field:uniqueId
  {
    type: 'field',
    name: 'uniqueId',
    expression: re => new FunctionExpression('CONCAT', re['partyGroupCode'], new Value('-'), re['partyGroupTaskId'])
  },

  // field:startAt
  {
    type: 'field',
    name: 'startAt',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputStartAt'], re['calculatedStartAt']),
      IfNullExpression(new ColumnExpression('parent', 'inputStartAt'), new ColumnExpression('parent', 'startAt'))
    ),
    registered: true
  },

  // field:defaultStartAt
  {
    type: 'field',
    name: 'defaultStartAt',
    expression: re => IfNullExpression(
      re['calculatedStartAt'],
      IfNullExpression(new ColumnExpression('parent', 'inputStartAt'), new ColumnExpression('parent', 'startAt'))
    )
  },

  // field:dueAt
  {
    type: 'field',
    name: 'dueAt',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputDueAt'], re['calculatedDueAt']),
      IfNullExpression(new ColumnExpression('parent', 'inputDueAt'), new ColumnExpression('parent', 'dueAt'))
    ),
    registered: true
  },

  // field:defaultDueAt
  {
    type: 'field',
    name: 'defaultDueAt',
    expression: re => IfNullExpression(
      re['calculatedDueAt'],
      IfNullExpression(new ColumnExpression('parent', 'inputDueAt'), new ColumnExpression('parent', 'dueAt'))
    )
  },

  // field:deadline
  {
    type: 'field',
    name: 'deadline',
    expression: re => IfNullExpression(
      IfNullExpression(re['inputDeadline'], re['calculatedDeadline']),
      IfNullExpression(new ColumnExpression('parent', 'inputDeadline'), new ColumnExpression('parent', 'deadline'))
    ),
    registered: true
  },

  // field:defaultDeadline
  {
    type: 'field',
    name: 'defaultDeadline',
    expression: re => IfNullExpression(
      re['calculatedDeadline'],
      IfNullExpression(new ColumnExpression('parent', 'inputDeadline'), new ColumnExpression('parent', 'deadline'))
    )
  },

  // field:hasSubTasks
  {
    type: 'field',
    name: 'hasSubTasks',
    expression: new ExistsExpression(hasSubTaskQuery('temp'), false),
    registered: true
  },

  // field:noOfRemarks
  {
    type: 'field',
    name: 'noOfRemarks',
    expression: re => new FunctionExpression('JSON_LENGTH', re['remark']),
    registered: true
  },

  // field:hasRemark
  {
    type: 'field',
    name: 'hasRemark',
    expression: re => new BinaryExpression(re['noOfRemarks'], '>', new Value(0))
  },

  // field:latestRemark
  {
    type: 'field',
    name: 'latestRemark',
    expression: re => new MathExpression(new ColumnExpression(taskTable, 'remark'), '->>', new Value('$[0].message'))
  },

  // field:latestRemarkAt
  {
    type: 'field',
    name: 'latestRemarkAt',
    expression: re => new MathExpression(new ColumnExpression(taskTable, 'remark'), '->>', new Value('$[0].messageAt'))
  },

  // field:latestRemarkBy
  {
    type: 'field',
    name: 'latestRemarkBy',
    queryArg: re => params => {
      const latestRemarkByExpression = new MathExpression(new ColumnExpression(taskTable, 'remark'), '->>', new Value('$[0].messageBy'))
      const me = typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
      const byMeExpression = new BinaryExpression(latestRemarkByExpression, '=', me)
      return { $select: new ResultColumn(IfExpression(byMeExpression, new Value('me'), latestRemarkByExpression), 'latestRemarkBy') }
    }
  },

  // field:isStarted
  {
    type: 'field',
    name: 'isStarted',
    expression: re => new OrExpressions([
      new IsNullExpression(re['startAt'], false),
      new BinaryExpression(re['startAt'], '<=', new FunctionExpression('UTC_TIMESTAMP'))
    ]),
    registered: true
  },

  // field:startDays
  {
    type: 'field',
    name: 'startDays',
    expression: re => IfNullExpression(
      new FunctionExpression('GREATEST', new FunctionExpression('DATEDIFF', new FunctionExpression('UTC_TIMESTAMP'), re['startAt']), new Value(0)),
      new Value(0)
    )
  },

  // field:isDone
  {
    type: 'field',
    name: 'isDone',
    expression: re => IfExpression(re['hasSubTasks'], new ExistsExpression(hasSubTaskQuery('temp', true, generalIsDoneExpression('temp_status', true)), true), generalIsDoneExpression()),
    registered: true
  },

  // field:dueDays
  {
    type: 'field',
    name: 'dueDays',
    expression: re => IfNullExpression(
      new FunctionExpression('GREATEST', new FunctionExpression('DATEDIFF', new FunctionExpression('UTC_TIMESTAMP'), re['dueAt']), new Value(0)),
      new Value(0)
    )
  },

  // field:isDue
  {
    type: 'field',
    name: 'isDue',
    expression: re => new BinaryExpression(re['dueAt'], '<=', new FunctionExpression('UTC_TIMESTAMP')),
    registered: true
  },

  // field:isDueToday
  {
    type: 'field',
    name: 'isDueToday',
    queryArg: re => params => {
      return { $select: new ResultColumn(getIsDueTodayExpression()(re, params), 'isDueToday') }
    }
  },

  // field:isDead
  {
    type: 'field',
    name: 'isDead',
    expression: re => new BinaryExpression(re['deadline'], '<=', new FunctionExpression('UTC_TIMESTAMP')),
    registered: true
  },

  // field:isClosed
  {
    type: 'field',
    name: 'isClosed',
    expression: generalIsClosedExpression(),
    registered: true
  },

  // field:isDeleted
  {
    type: 'field',
    name: 'isDeleted',
    expression: generalIsDeletedExpression(),
    registered: true
  },

  // field:status (calculated)
  {
    type: 'field',
    name: 'status',
    expression: re => new CaseExpression(
      [
        { $when: re['isDeleted'], $then: new Value('Deleted') },
        { $when: re['isClosed'], $then: new Value('Closed') },
        { $when: re['isDone'], $then: new Value('Done') },
        { $when: re['isDead'], $then: new Value('Dead') },
        { $when: re['isDue'], $then: new Value('Due') },
        { $when: re['isStarted'], $then: new Value('Open') }
      ],
      new Value('Not Ready')
    ),
    registered: true
  },

  // field:taskStatus (raw)
  {
    type: 'field',
    name: 'taskStatus',
    expression: () => new ColumnExpression(taskStatusTable, 'status')
  },

  // field:statusAt
  {
    type: 'field',
    name: 'statusAt',
    expression: re => IfExpression(
      re['isDeleted'],
      new Value(null),
      new ColumnExpression(taskStatusTable, 'createdAt')
    )
  },

  // field:statusBy
  {
    type: 'field',
    name: 'statusBy',
    queryArg: re => params => {
      const statusByExpression = IfExpression(
        re['isDeleted'],
        new Value(null),
        new ColumnExpression(taskStatusTable, 'createdBy')
      )
      const me = params.subqueries && typeof params.subqueries.user === 'object' && 'value' in params.subqueries.user ? params.subqueries.user.value : ''
      const byMeExpression = new BinaryExpression(statusByExpression, '=', me)
      return { $select: new ResultColumn(IfExpression(byMeExpression, new Value('me'), statusByExpression), 'statusBy') }
    }
  },

  // field:deduct
  {
    type: 'field',
    name: 'deduct',
    expression: re => new FunctionExpression('SUM', new CaseExpression([
      {
        $when: re['isDead'],
        $then: IfNullExpression(new ColumnExpression('sop_task', 'deadlineScore'), new Value(0))
      },
      {
        $when: re['isDue'],
        $then: IfNullExpression(new ColumnExpression('sop_task', 'dueScore'), new Value(0))
      }
    ], new Value(0)))
  },

  // field:primaryNo
  {
    type: 'field',
    name: 'primaryNo',
    queryArg: () => getEntityExpressionSubquery('primaryNo')
  },

  // field:picEmail
  {
    type: 'field',
    name: 'picEmail',
    queryArg: () => getEntityExpressionSubquery('picEmail')
  },

  // field:team
  {
    type: 'field',
    name: 'team',
    queryArg: () => getEntityExpressionSubquery('team')
  },
  
  // field:jobNo
  {
    type: 'field',
    name: 'jobNo',
    queryArg: () => getEntityExpressionSubquery('jobNo')
  },

  // field:moduleTypeCode
  {
    type: 'field',
    name: 'moduleTypeCode',
    queryArg: () => getEntityExpressionSubquery('moduleTypeCode')
  },

  // field:boundTypeCode
  {
    type: 'field',
    name: 'boundTypeCode',
    queryArg: () => getEntityExpressionSubquery('boundTypeCode')
  },

  // field:divisionCode
  {
    type: 'field',
    name: 'divisionCode',
    queryArg: () => getEntityExpressionSubquery('divisionCode')
  },

  // subquery:default
  // filters for entity table(s)
  {
    type: 'subquery',
    name: 'default',
    subqueryArg: () => (value, params) => {
      const tables: string[] = []
      if (params.subqueries.tableName) {
        if (params.subqueries.tableName.value && isSopTaskSupported(params.subqueries.tableName.value)) {
          tables.push(params.subqueries.tableName.value)
        }
      }
      else {
        tables.push(...sopTaskSupportedTables())
      }
      
      // table not supported
      if (!tables.length) return {}

      if (tables.length === 1) {
        const table = tables[0]
        const queryDef: QueryDef = require(`./${table}`).default
        const supported = sopTaskSettings[table].subqueries
        let found = false
        const params_: IQueryParams = {
          fields: ['id'],
          subqueries: Object.keys(params.subqueries).reduce((r, k) => {
            if (supported.indexOf(k) > -1) {
              r[k] = params.subqueries[k]
              found = true
            }
            return r
          }, {})
        }
        if (!found) return {}
        const query = queryDef.apply(params_)
        return { $where: new InExpression(new ColumnExpression(taskTable, 'primaryKey'), false, query) }
      }
      else {
        const cases = tables.reduce((r, table) => {
          const queryDef: QueryDef = require(`./${table}`).default
          const supported = sopTaskSettings[table].subqueries
          let found = false
          const params_: IQueryParams = {
            fields: ['id'],
            subqueries: Object.keys(params.subqueries).reduce((r, k) => {
              if (supported.indexOf(k) > -1) {
                r[k] = params.subqueries[k]
                found = true
              }
              return r
            }, {})
          }
          if (found) {
            const query = queryDef.apply(params_)
            r.push({
              $when: new BinaryExpression(new ColumnExpression(taskTable, 'tableName'), '=', new Value(table)),
              $then: new InExpression(new ColumnExpression(taskTable, 'primaryKey'), false, query)
            })
          }
          return r
        }, [])
        return cases.length ? { $where: new CaseExpression(cases) } : {}
      }
    }
  },

  // subquery:tableName
  {
    type: 'subquery',
    name: 'tableName',
    expression: re => new BinaryExpression(re['tableName'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:primaryKey
  {
    type: 'subquery',
    name: 'primaryKey',
    expression: re => new BinaryExpression(re['primaryKey'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:date
  {
    type: 'subquery',
    name: 'date',
    expression: re => new OrExpressions([
      new IsNullExpression(re['startAt'], false),
      new BinaryExpression(re['startAt'], '<=', new Unknown())
    ]),
    unknowns: { fromTo: true },
  },

  // subquery:notDone
  {
    type: 'subquery',
    name: 'notDone',
    expression: re => new BinaryExpression(re['isDone'], '=', new Value(0))
  },

  // subquery:isDue
  {
    type: 'subquery',
    name: 'isDue',
    expression: re => new BinaryExpression(re['isDue'], '=', new Value(1))
  },

  // subquery:isDueToday
  {
    type: 'subquery',
    name: 'isDueToday',
    subqueryArg: re => (value, params) => {
      return { $where: new BinaryExpression(getIsDueTodayExpression()(re, params), '=', new Value(1)) }
    }
  },

  // subquery:isDead
  {
    type: 'subquery',
    name: 'isDead',
    expression: re => new BinaryExpression(re['isDead'], '=', new Value(1))
  },

  // subquery:notClosed
  {
    type: 'subquery',
    name: 'notClosed',
    expression: re => new BinaryExpression(re['isClosed'], '=', new Value(0))
  },

  // subquery:notSubTask
  {
    type: 'subquery',
    name: 'notSubTask',
    expression: re => new IsNullExpression(re['parentId'], false)
  },

  // subquery:notDeleted
  {
    type: 'subquery',
    name: 'notDeleted',
    expression: re => new BinaryExpression(re['isDeleted'], '=', new Value(0))
  },

  // subquery:notReferencedIn
  {
    type: 'subquery',
    name: 'notReferencedIn',
    subqueryArg: re => value => {
      if (Array.isArray(value.value) && value.value.length > 0) {
        return {
          $where: [
            new IsNullExpression(re['templateId'], true),
            new InExpression(re['taskId'], true, new Query({
              $distinct: true,
              $select: new ResultColumn(new ColumnExpression(templateTaskTable, 'id')),
              $from: new FromTable(templateTable,
                new JoinClause('LEFT', templateTemplateTaskTable,
                  new AndExpressions([
                    new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'templateId'), '=', new ColumnExpression(templateTable, 'id')),
                    new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedAt'), false),
                    new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedBy'), false)
                  ])
                ),
                new JoinClause('LEFT', templateTaskTable,
                  new AndExpressions([
                    new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'taskId'), '=', new ColumnExpression(templateTaskTable, 'id')),
                    new IsNullExpression(new ColumnExpression(templateTaskTable, 'deletedAt'), false),
                    new IsNullExpression(new ColumnExpression(templateTaskTable, 'deletedBy'), false)
                  ])
                )
              ),
              $where: [
                new InExpression(new ColumnExpression(templateTable, 'id'), false, new Value(value.value)),
                new IsNullExpression(new ColumnExpression(templateTaskTable, 'id'), true),
                new IsNullExpression(new ColumnExpression(templateTable, 'deletedAt'), false),
                new IsNullExpression(new ColumnExpression(templateTable, 'deletedBy'), false)
              ]
            }))
          ]
        }
      }
      else {
        return {
          $where: new IsNullExpression(re['templateId'], true)
        }
      }
    }
  },

  // subquery:notReferenced
  {
    type: 'subquery',
    name: 'notReferenced',
    subqueryArg: re => () => ({
      $where: new AndExpressions([
        new IsNullExpression(re['templateId'], true),
        new InExpression(re['taskId'], true, new Query({
          $distinct: true,
          $select: new ResultColumn(new ColumnExpression(templateTaskTable, 'id')),
          $from: new FromTable(selectedTemplateTable,
            new JoinClause('LEFT', templateTable, new AndExpressions([
              new BinaryExpression(new ColumnExpression(selectedTemplateTable, 'templateId'), '=', new ColumnExpression(templateTable, 'id')),
              new IsNullExpression(new ColumnExpression(templateTable, 'deletedAt'), false),
              new IsNullExpression(new ColumnExpression(templateTable, 'deletedBy'), false)
            ])),
            new JoinClause('LEFT', templateTemplateTaskTable, new AndExpressions([
              new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'templateId'), '=', new ColumnExpression(templateTable, 'id')),
              new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedAt'), false),
              new IsNullExpression(new ColumnExpression(templateTemplateTaskTable, 'deletedBy'), false)
            ])),
            new JoinClause('LEFT', templateTaskTable, new AndExpressions([
              new BinaryExpression(new ColumnExpression(templateTemplateTaskTable, 'taskId'), '=', new ColumnExpression(templateTaskTable, 'id')),
              new IsNullExpression(new ColumnExpression(templateTaskTable, 'deletedAt'), false),
              new IsNullExpression(new ColumnExpression(templateTaskTable, 'deletedBy'), false)
            ]))
          ),
          $where: [
            new BinaryExpression(new ColumnExpression(selectedTemplateTable, 'tableName'), '=', re['tableName']),
            new BinaryExpression(new ColumnExpression(selectedTemplateTable, 'primaryKey'), '=', re['primaryKey']),
            new IsNullExpression(new ColumnExpression(templateTaskTable, 'id'), true),
            new IsNullExpression(new ColumnExpression(selectedTemplateTable, 'deletedAt'), false),
            new IsNullExpression(new ColumnExpression(selectedTemplateTable, 'deletedBy'), false)
          ]
        }))
      ])
    })
  },

  // subquery:category
  {
    type: 'subquery',
    name: 'category',
    expression: re => new BinaryExpression(re['category'], '=', new Unknown()),
    unknowns: true
  },

  // subquery:activeStatus
  {
    type: 'subquery',
    name: 'activeStatus',
    expression: re => new BinaryExpression(IfExpression(new BinaryExpression(re['isDeleted'], '=', new Value(1)), new Value('deleted'), new Value('active')), '=', new Unknown()),
    unknowns: true
  },

  // subquery:shipperPartyId
  {
    type: 'subquery',
    name: 'shipperPartyId',
    subqueryArg: () => getEntityPartySubquery('shipperPartyId')
  },

  // subquery:consigneePartyId
  {
    type: 'subquery',
    name: 'consigneePartyId',
    subqueryArg: () => getEntityPartySubquery('consigneePartyId')
  },

  // subquery:branch
  {
    type: 'subquery',
    name: 'branch',
    subqueryArg: () => getEntityPartySubquery('officePartyId', ({ value }, { expression, partyTable, entityIdExpression }) => {
      return new Query({
        $select: new ResultColumn(entityIdExpression, 'primaryKey'),
        $from: new FromTable(partyTable, new JoinClause('LEFT', 'party',
          new AndExpressions([
            new BinaryExpression(expression, '=', new ColumnExpression('party', 'id')),
            new IsNullExpression(new ColumnExpression('party', 'deletedAt'), false),
            new IsNullExpression(new ColumnExpression('party', 'deletedBy'), false),
          ])
        )),
        $where: new BinaryExpression(
          new BinaryExpression(new ColumnExpression('party', 'thirdPartyCode'), '->>', new Value('$.\"erp-site\"')),
          '=',
          new Value(value)
        )
      })
    })
  },

  // subquery:officePartyId
  {
    type: 'subquery',
    name: 'officePartyId',
    subqueryArg: () => getEntityPartySubquery('officePartyId')
  },

  // subquery:agentPartyId
  {
    type: 'subquery',
    name: 'agentPartyId',
    subqueryArg: () => getEntityPartySubquery('agentPartyId')
  },

  // subquery:roAgentPartyId
  {
    type: 'subquery',
    name: 'roAgentPartyId',
    subqueryArg: () => getEntityPartySubquery('roAgentPartyId')
  },

  // subquery:linerAgentPartyId
  {
    type: 'subquery',
    name: 'linerAgentPartyId',
    subqueryArg: () => getEntityPartySubquery('linerAgentPartyId')
  },

  // subquery:controllingCustomerPartyId
  {
    type: 'subquery',
    name: 'controllingCustomerPartyId',
    subqueryArg: () => getEntityPartySubquery('controllingCustomerPartyId')
  },

  // subquery:anyPartyId
  {
    type: 'subquery',
    name: 'anyPartyId',
    subqueryArg: () => (value, params) => getEntityPartySubquery('officePartyId', ({ value }, { expression, partyTable, entityIdExpression }) => {
      return new Query({
        $select: new ResultColumn(entityIdExpression, 'primaryKey'),
        $from: partyTable,
        $where: [
          new InExpression(getEntityExpression('shipperPartyId')(params), false, new Value(value)),
          new InExpression(getEntityExpression('consigneePartyId')(params), false, new Value(value)),
          new InExpression(expression, false, new Value(value)),
          new InExpression(getEntityExpression('agentPartyId')(params), false, new Value(value)),
          new InExpression(getEntityExpression('roAgentPartyId')(params), false, new Value(value)),
          new InExpression(getEntityExpression('linerAgentPartyId')(params), false, new Value(value)),
          new InExpression(getEntityExpression('controllingCustomerPartyId')(params), false, new Value(value))
        ]
      })
    })(value, params)
  },

  // orderBy:seqNo
  {
    type: 'orderBy',
    name: 'seqNo',
    queryArg: re => () => ({
      $order: [
        ...wrapOrder(new ColumnExpression('categorySeqNo')),
        ...wrapOrder(re['seqNo'])
      ]
    }),
    companions: ['field:categorySeqNo']
  },

  // orderBy:status
  {
    type: 'orderBy',
    name: 'status',
    queryArg: re => () => ({
      $order: [
        new OrderBy(new FunctionExpression('FIELD', re['status'], ...statusList.map(v => new Value(v))), 'ASC'),
        ...wrapOrder(re['seqNo'])
      ]
    })
  },

  // orderBy:dueAt
  {
    type: 'orderBy',
    name: 'dueAt',
    queryArg: re => () => ({
      $order: [
        ...wrapOrder(re['dueAt']),
        ...wrapOrder(re['seqNo'])
      ]
    })
  },

  // orderBy:dueAt
  {
    type: 'orderBy',
    name: 'startAt',
    queryArg: re => () => ({
      $order: [
        new OrderBy(re['startAt']),
        ...wrapOrder(re['seqNo'])
      ]
    })
  }
]

export default query.useShortcuts(shortcuts)