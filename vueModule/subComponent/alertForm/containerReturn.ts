
import { SubComponentTemplate,SubComponentInfo } from 'modules/vue/interface'
import { ValidatorMetadata } from 'modules/validation/service'

// the main json that need to be edit through the admin page
const subComponentTemplateList = [
    {
        subComponentTemplateName: 'date',
        propParam: {

            // how to add the param??
            "tableName" : "shipment",
            "dateName": "returnEmptyContainer",
            "includeEstimated": true,
            "includeActual": true,
            "includeRemark": true
        }
    },

] as SubComponentTemplate[]


const validators = [

    {
       field : 'shipmentDate.returnEmptyContainerDateEstimated',
       validator : 'required'
    },

    {
        field : 'shipmentDate.returnEmptyContainerActualEstimated',
        validator : 'required'
    }

] as ValidatorMetadata[]


// Function that return the mainComponent

const component = () => {

    const components = subComponentTemplateList.map(subComponent => {
        return {
            is: "SubFormComponent",
            props : subComponent
        }
    })

    return {
        "addAttrsToComponent": true,
        "components" : components
    }

}


export default component

export {
    validators,
    component,
    subComponentTemplateList
}