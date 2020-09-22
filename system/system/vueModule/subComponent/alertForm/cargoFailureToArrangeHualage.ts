
import { SubComponentTemplate,SubComponentInfo } from 'modules/vue/interface'
import { ValidatorMetadata } from 'modules/validation/service'

// the main json that need to be edit through the admin page
const subComponentTemplateList = [
    {
        subComponentTemplateName: 'date',
        propParam: {

            // how to add the param??
            "tableName" : "shipment",
            "dateName": "sentToShipper",
            "includeEstimated": true,
            "includeActual": true,
            "includeRemark": true
        }
    },

] as SubComponentTemplate[]


const validators = [

    {
       field : 'shipmentDate.sentToShipperDateEstimated',
       validator : 'required'
    },

    {
        field : 'shipmentDate.sentToShipperActualEstimated',
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