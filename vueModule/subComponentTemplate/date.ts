import { SubComponentField } from 'modules/vue/interface'
import _ = require('lodash')

// just for easier coding
interface PropParam {
  dateName: string
  includeEstimated?: boolean
  includeActual?: boolean
  includeRemark?: boolean
}


const fieldList = (propParam: PropParam) => {

  const { dateName, includeEstimated, includeActual, includeRemark } = propParam

  const fieldList = []

  const fieldObject = (dateName: string, suffix: string) => {

    const fieldName = `${dateName}${suffix}`

    return {
      'label': fieldName,
      'name': fieldName,
      'component': 'v-text-field',
      'validator': ['required']
    } as SubComponentField
  }

  if (includeEstimated) {
    fieldList.push(fieldObject(dateName, 'Estimated'))
  }
  if (includeActual) {
    fieldList.push(fieldObject(dateName, 'Acutal'))
  }
  if (includeRemark) {
    fieldList.push(fieldObject(dateName, 'Remark'))
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

// 
const entityToFormDataFunction = (propParam: PropParam) => {
  return (tableName: string, oldEntity: any, formData: any) => {
    // entity

    return formData
  }

}


// changeForm to entityData
const formDataToEntityFunction = (propParam: PropParam) => {

  return (tableName: string, oldEntity: any, formData: any) => {

    const { dateName } = propParam

    const datePropName = `${tableName}Date.${dateName}Estimated`

    const value = ''

    _.set(formData, datePropName, )
    // entity
    return formData
  }


}


const extra = {
  formDataToEntityFunction,
  entityToFormDataFunction
}

export {
  fieldList,
  component,
  adminComponent,
  extra,
}

export default component


