// just for easier coding
interface PropParam {
    dateList: string[]
    includeEstimated: boolean
    includeActual: boolean
    
}

// the form that will show in the handle alert
export const component = (propParam: PropParam) => {
    return {
        "is": "Form",
        "props": {
        }
    }
}

//  the one show on the admin page for composing the form
export const adminComponment = ({ }) => {
    return {
        "is": "Form",
        "props": {
        }
    }
}


// running validation of this form
export const validatation = () => {
    // vaild

    return true
}


export const changeToEntityFunction = (oldEntity: any, formData: any, propParam: PropParam) => {
    // entity

    return formData
}


