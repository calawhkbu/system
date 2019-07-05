{

    "tableName" : "booking",

    "defaultDocumentConfig" : {

        "allowFileType" : ["image/png","image/gif","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],
        "allowFillTemplate" : false

    },

    "documentList" : [

        {

            "fileName" : "testDoc",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],

            "allowFillTemplate" : true,
            "templateName" : "testDoc"
        },

        {

            "fileName" : "Shipping Order",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],

            "allowFillTemplate" : true,
            "templateName" : "shippingOrder-{{moduleTypeCode}}"

        },

        {
            "fileName" : "Shipping Advice",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],


            "allowFillTemplate" : false
        },
        {
            "fileName" : "Print Invoice",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],


            "allowFillTemplate" : false
        },
        {
            "fileName" : "Pro Forma Invoice",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],


            "allowFillTemplate" : false
        },
        {
            "fileName" : "Packing List",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],


            "allowFillTemplate" : false
        },
        {
            "fileName" : "Load Plan",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],


            "allowFillTemplate" : false
        },
        {
            "fileName" : "Shipping Instructions",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],


            "allowFillTemplate" : false
        },
        {
            "fileName" : "House Bill",
            "allowFileType" : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/pdf"],


            "allowFillTemplate" : false
        }

    ]

}