import { SubComponentField } from 'modules/vue/interface'
import _ = require('lodash')

// just for easier coding
interface PropParam {
  tableName?: string
  dateName: string
  includeEstimated?: boolean
  includeActual?: boolean
  includeRemark?: boolean
  isInFlexData?: boolean
}

const fieldList = ({ tableName, dateName, includeEstimated, includeActual, includeRemark, isInFlexData }: PropParam) => {
  const fieldList = []
  const fieldObject = (dateName: string, component = 'DateTimePicker') => {
    const [tableName, actualDateName] = dateName.split('.') // "shipment" "XXDateXX"
    return {
      'label': dateName,
      'name': isInFlexData ? `${tableName}Date.flexData.${actualDateName}` : `${tableName}Date.${actualDateName}`,
      'component': component,
      'validator': ['required']
    } as SubComponentField
  }
  if (includeEstimated) {
    fieldList.push(fieldObject(`${tableName}.${dateName}DateEstimated`))
  }
  if (includeActual) {
    fieldList.push(fieldObject(`${tableName}.${dateName}DateActual`))
  }
  if (includeRemark) {
    fieldList.push(fieldObject(`${tableName}.${dateName}DateRemark`, 'v-text-field'))
  }
  return fieldList
}

// the form that will show in the handle alert
const component = (propParam: PropParam) => {


  const fields = fieldList(propParam)

  return {
    is: "Form",
    fields
  }
}


//  the one show on the admin page for composing the form
const adminComponent = ({ }) => {
  return {
    "is": "Form",
    "props": {
    }
  }
}




// changeForm to entityData
const formDataToEntityFunction = (propParam: PropParam) => {

  const {
    tableName,
    dateName,
    includeActual,
    includeEstimated,
    includeRemark,
    isInFlexData
  } = propParam


  const dateTableName = tableName ? `${tableName}Date` : undefined
  const flexData = isInFlexData ? 'flexData' : undefined
  const prefix = [dateTableName, flexData].filter(x => !!x).join('.')

  const finalDatePath = prefix ? `${prefix}.${dateName}` : dateName

  // const prefixPath = (isInFlexData ? `${tableName}Date.flexData.` : `${tableName}Date.`)
  // const prefix = tableName ? prefixPath : ''

  // formData : the one sent from POST request
  // finalFormData, the one need to get all the data
  return (formData: any, entityData: any) => {

    const fieldList = []


    // assuming have dateTableName
    if (isInFlexData) {

      if (!dateTableName) {
        throw new Error('missing dateTableName')
      }

      if (!entityData[dateTableName].flexData) {
        entityData[dateTableName].flexData = {}
        // _.set(entityData,'flexData',{})
      }

      if (!entityData[dateTableName].flexData.moreDate) {
        entityData[dateTableName].flexData.moreDate = []
        // _.set(entityData,'flexData.moreDate',[])
      }

      if (!entityData[dateTableName].flexData.moreDate.includes(dateName)) {
        entityData[dateTableName].flexData.moreDate = entityData[dateTableName].flexData.moreDate.concat([dateName])
      }
    }

    if (includeActual) {
      fieldList.push(`${finalDatePath}DateActual`)
    }

    if (includeEstimated) {
      fieldList.push(`${finalDatePath}DateEstimated`)
    }

    if (includeRemark) {
      fieldList.push(`${finalDatePath}DateRemark`)
    }


    fieldList.map(field => {
      const value = _.get(formData, field)
      _.set(entityData, field, value)
    })

    // entity
    return entityData
  }


}


const extra = {
  formDataToEntityFunction
}

export {
  fieldList,
  component,
  adminComponent,
  extra,
}

export default component
