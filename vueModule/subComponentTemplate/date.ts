import { SubComponentField } from 'modules/vue/interface'
import _ = require('lodash')

// just for easier coding
interface PropParam {
  
  tableName?:string
  dateName: string
  includeEstimated?: boolean
  includeActual?: boolean
  includeRemark?: boolean
}



const fieldList = (propParam: PropParam) => {

  const { tableName, dateName, includeEstimated, includeActual, includeRemark } = propParam

  const fieldList = []

  const fieldObject = (dateName: string,component = 'DateTimePicker') => {

    const prefix = tableName ? `${tableName}Date.` : ''

    const fieldName = `${prefix}${dateName}`

    return {
      'label': dateName,
      'name': fieldName,
      'component': component,
      'validator': ['required']
    } as SubComponentField


  }

  if (includeEstimated) {
    fieldList.push(fieldObject(`${dateName}DateEstimated`))
  }
  if (includeActual) {
    fieldList.push(fieldObject(`${dateName}DateActual`))
  }
  if (includeRemark) {
    fieldList.push(fieldObject(`${dateName}DateRemark`,'v-text-field'))
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


  const { tableName,dateName,includeActual,includeEstimated,includeRemark } = propParam
  const prefix = tableName ? `${tableName}Date.` : ''

  return (entityData: any, formData: any) => {

    const fieldList = []

    if (includeActual)
    {
      const fieldName = `${prefix}${dateName}DateActual`
      fieldList.push(fieldName)
    }

    if (includeEstimated)
    {
      const fieldName = `${prefix}${dateName}DateEstimated`
      fieldList.push(fieldName)
    }

    if (includeRemark)
    {
      const fieldName = `${prefix}${dateName}DateEstimated`
      fieldList.push(fieldName)
    }


    fieldList.map(field => {
      const value = _.get(entityData,field)
      _.set(formData, field,value)
    })
    
    return formData
  }

}


// changeForm to entityData
const formDataToEntityFunction = (propParam: PropParam) => {

  

  const { tableName,dateName,includeActual,includeEstimated,includeRemark } = propParam
  const prefix = tableName ? `${tableName}Date.` : ''

  // formData : the one sent from POST request
  // finalFormData, the one need to get all the data
  return (formData: any, entityData: any) => {

    const fieldList = []

    if (includeActual)
    {
      const fieldName = `${prefix}${dateName}DateActual`
      fieldList.push(fieldName)
    }

    if (includeEstimated)
    {
      const fieldName = `${prefix}${dateName}DateEstimated`
      fieldList.push(fieldName)
    }

    if (includeRemark)
    {
      const fieldName = `${prefix}${dateName}DateEstimated`
      fieldList.push(fieldName)
    }


    fieldList.map(field => {
      const value = _.get(formData,field)
      _.set(entityData, field,value)
    })
  
    // entity
    return entityData
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


