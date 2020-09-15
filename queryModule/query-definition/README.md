# Documentation

1. Suggest to write the code under `swivel-backend-new/src` first (where tslint works), and then move it to `swivel-backend-custom`

2. You may need to take a look at [`node-jql`](https://github.com/kennysng/node-jql). This should help avoid some syntax errors when writing SQL

3. You can register `shortcuts` for predefined fields, and `subqueries` for extra join clauses or filters

4. Frontend-supported sub-queries (aka. filters) *MUST* have 1 and only 1 variable (`value`). Except date-typed filters, which have 2 (`from` and `to`)

5. In case you want to support both `=` and `in`, create 2 sub-queries, e.g. one named `moduleType` with `=` and one named `moduleTypes` with `in`

   - `BinaryExpression` and `InExpression` will not be merged. `BinaryExpression.right` will never support `Query` type (as well as `Array`)