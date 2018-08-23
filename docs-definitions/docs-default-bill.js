module.exports =[
    {
        name: "Invoice",
        tags: {
            moduleType: "SEA"
        },
        type:"pdf"
    },
    {
        name: "FCL Document",
        tags: {
            service: ["FCL/FCL"]
        },
        type:"pdf"
    },
    {
        name: "LCL Document",
        tags: {
            service: ["LCL/LC*"]
        },
        type:"pdf"
    },
    {
        name: "MBL begins with KKL and *CL Document",
        tags: {
            masterNo: ["KKL*"],
            service: "*CL"
        },
        type:"pdf"
    },
    {
        name: "MBL begins with MOL Document & CY",
        tags: {
            masterNo: ["MOL*"],
            service: ["CY*"]
        },
        type:"pdf"
    }
]