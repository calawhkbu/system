// just for easier coding
interface PropParam {
    dateName: string
    includeEstimated?: boolean
    includeActual?: boolean
    includeRemark?: boolean
}

// the form that will show in the handle alert
const component =  (propParam: PropParam) => {

    const { dateName,includeEstimated,includeActual,includeRemark } = propParam
    const fieldList = []

    const fieldObject = (dateName:string,suffix:string) => {

        const fieldName = `${dateName}${suffix}`

        return {
            "label" : fieldName,
            "name" : fieldName,
            "component": "v-text-field",
            "validator": ["required"]
        }


    }
    if (includeEstimated)
    {
        fieldList.push(fieldObject(dateName,'Estimated'))
    }
    if (includeActual)
    {
        fieldList.push(fieldObject(dateName,'Acutal'))
    }
    if (includeRemark)
    {
        fieldList.push(fieldObject(dateName,'Remark'))
    }

    return {
        "is": "Form",
        "fields" : fieldList
        
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


// running validation of this form, used in backend validation
const validatation = () => {
    // vaild
    return true
}


const changeToEntityFunction = (tableName: string, oldEntity: any, formData: any, propParam: PropParam) => {
    // entity

    const { dateName } = propParam

    return formData
}

const extra = {
    validatation,
    changeToEntityFunction
}

export {
    component,
    adminComponent,
    extra,
}

export default component


