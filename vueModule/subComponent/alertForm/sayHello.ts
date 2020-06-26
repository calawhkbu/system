


export default () => {

    return {

        "addAttrsToComponent": true,
        "components": [
            {
                "is": "SubFormComponent",
                "props": {
                    "subComponentTemplateName": "date",
                    "propParam": {
                        "dateName": "departure",
                        "includeEstimated": true,
                        "includeActual": true,
                        "includeRemark": true
                    }
                }

            },

            {
                "is": "SubFormComponent",
                "props": {
                    "subComponentTemplateName": "date",
                    "propParam": {
                        "dateName": "arrival",
                        "includeEstimated": true,
                        "includeActual": true,
                        "includeRemark": true
                    }
                }

            }
        ]
    }


}

export const subComponentList = [
    {
        subComponentName  : 'date',
        propParam : {
            "dateName": "departure",
            "includeEstimated": true,
            "includeActual": true,
            "includeRemark": true
        }
    },
    {
        subComponentName  : 'date',
        propParam : {
            "dateName": "arrival",
            "includeEstimated": true,
            "includeActual": true,
            "includeRemark": true
        }
    }

]