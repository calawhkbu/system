module.exports = {
  // specify the name of the language for this file
  "language": "English",

  // the common text that will be used in different pages
  "colon": ": ",  // colon sign may be different in different languages
  "space": " ", // space size may be different in different languages
  "Login": "Login", // 'Login' button
  "Logout": "Logout", // 'Logout' button
  "My Profile": "My Profile", // 'My Profile' button
  "Create": "Create", // 'Create' button
  "Update": "Update", // 'Update' button
  "Confirmed?": "Confirmed?", // 'Confirm to Delete?' button
  "Delete": "Delete", // 'Delete' button
  "Save": "Save", // 'Save' button
  "Save as": "Save As", // 'Save As' button
  "Apply": "Apply", // 'Apply / Submit' button
  "Reset": "Reset", // 'Reset' button
  "Clear": "Clear", // 'Clear' button
  "Cancel": "Cancel", // 'Cancel' button
  "Close": "Close", // 'Close' button
  "Share": "Share", // 'Share' button
  "Refresh": "Refresh", // 'Refresh / Reload' button
  "Next": "Next", // 'Next' button
  "Back": "Back", // 'Back' button
  "Preview": "Preview", // 'Preview' button
  "Search": "Search", // 'Search' button
  "OK": "OK", // 'OK' button
  "Confirm": "Confirm", // 'Confirm' button
  "Select": "Select", // 'Select' button

  // no input
  "empty": "(Empty)",

  // search field in app bar
  "search-by": "Search by SKU, PO, B/L, Booking #",

  // the text shown when login
  "login": {
    "Email": "Email",
    "Password": "Password",
    "Register": "Register",
    "Forgot Password?": "Forgot Password?",
    "Please open WeChat to scan the QR code": "Please open WeChat to scan the QR code.",
    "Re-type the Password": "Re-type the Password", // re-type the password in registration for confirmation
    "Create Account": "Create Account",
    "Reset Password": "Reset Password",
    "First Name": "First Name",
    "Last Name": "Last Name"
  },

  // the text shown in 404 page
  "NotFoundPage": {
    "Page Not Found": "Page Not Found", // 404 primary message
    "... or you do not have the right to access this page": "... or you do not have the right to access this page"  // 404 secondary message
  },

  // the text shown in 500 page
  "ErrorPage": {
    "Error. Please retry.": "Error. Please retry."  // 500 message
  },

  // the text shown
  // in My Profile (/profile)
  "profile": {
    // basic section
    "Basic Information": "Basic Information",
    "User Name": "Username",
    "Display Name": "Display Name",
    "Photo URL": "Photo URL",

    // user preferences section
    "User Preferences": "User Preferences",
    "Select language": "Select Preferred Language",

    // change password section
    "Change": "Change", // 'Change' button
    "Change password": "Change Password",
    "Old Password": "Old Password",
    "New Password": "New Password",
    "Re-type the New Password": "Re-type the New Password",

    // notification section
    "Notification Preferences": "Notification Preferences", // settings about notifications
    "Phone": "Phone",
    "Enter your phone number": "Enter Your Tel. #",
    "WeChat ID": "WeChat ID",
    "Please click on the wechat button to login to Wechat": "Please click on the WeChat button to login to WeChat"
  },

  // the text shown in alert preference table
  // in My Profile (/profile)
  // and some alert-related text
  "alerts": {
    "Alert Entity": "Alert Entity", // the title of an alert type
    "Notification Method": "Notification Method", // the way to notify the user about the alert

    // the list of alert entities
    "Shipment ETD changed": "Shipment ETD changed",
    "Shipment ETA changed": "Shipment ETA changed",
    "Departure Delayed (AIR) [ETD + 30 mins]": "Departure Delayed (AIR) [ETD + 30 mins]",
    "Departure Delayed (SEA) [ETD + 1 day]": "Departure Delayed (SEA) [ETD + 1 day]",
    "Arrival Delayed (AIR) [ETA + 12 hours]": "Arrival Delayed (AIR) [ETA + 12 hours]",
    "Arrival Delayed (SEA) [ETA + 1 day]": "Arrival Delayed (SEA) [ETA + 1 day]",

    // the list of notification methods
    "Email": "Email",
    "No Notification": "Disabled"
  },

  // the text shown in autosuggest fields
  // used anywhere
  "auto-suggest": {
    // CustomAutoSuggest
    "Short Name": "Short Name", // party short name
    "Code": "Code", // party code
    "Location": "Location", // party address
  },

  // the text shown in cards
  // in Dashboard (/:dashboardId)
  "card": {
    "Your Cards": "My Cards", // the cards you own
    "System Cards": "System Cards", // the cards provided by default

    // shown in the list of available cards when there is none
    "No cards available": "No cards available",

    // shown when there is no data
    "No data": "No data",

    // shown when the card selected is not available
    "Not applicable": "Not applicable",

    // shown when the corresponding card is not found
    "Card '{name}' not found": "Card '{{ name|i18n(['card']) }}' not found", // note the {{ name }} should NOT be translated

    // the parameters applied to the corresponding card is altered by some reasons
    // a warning sign will be shown at the upper-right corner of the card
    "Filters": "Filters",

    // title of the card editor
    "Edit card": "Edit card - {{ name|i18n(['card']) }}",  // note the {{ name }} should NOT be translated

    // shown when there is an error when loading the card
    "Error": "Error", // the title of the error card
    "Fail to load card component": "Fail to load card component", // when the card script cannot be loaded from server

    // show more details
    "view-detail": "View Detail",

    // categories
    "Demo": "Demo",
    "General": "General",
    "Test": "Test",
    "Deprecated": "Deprecated",

    // the title of alerts cards
    "Alerts": "Alerts",
    "Alerts - Air": "Alerts - Air", // for air shipment
    "Alerts - Sea": "Alerts - Sea", // for sea shipment

    // shipment status
    "Shipment Status": "Shipment Status",
    "Delivered Shipments": "Delivered Shipments",
    "Not In Track": "Not In Track",
    "Processing": "Processing",
    "Cargo Ready": "Cargo Ready",
    "Departure": "Departure",
    "In Transit": "In Transit",
    "Arrival": "Arrival",
    "Delivered": "Delivered",

    // the title of outstanding status cards
    "Sea Export Freight Outstanding Status in 72 hours": "Sea Export Freight Outstanding Status within 72 hours",
    "Sea Import Freight Outstanding Status in 72 hours": "Sea Import Freight Outstanding Status within 72 hours",
    "Air Export Freight Outstanding Status in 48 hours": "Air Export Freight Outstanding Status within 48 hours",
    "Air Import Freight Outstanding Status in 48 hours": "Air Import Freight Outstanding Status within 48 hours",

    // dropdown options
    // show alerts within the following range
    "Last 12 hours": "Last 12 hours",
    "Last 24 hours": "Last 24 hours",
    "Last 36 hours": "Last 36 hours",
    "Last 2 days": "Last 2 days",
    "Last 3 days": "Last 3 days",
    // show data of the following range
    "Current Month": "Current Month",

    "Unnamed": "Unnamed", // card without a name
    "Unknown": "Unknown"  // if the card name is not found
  },

  // the text related to the hot list (~ My Favourites)
  // in the top navigation bar
  "hotList": {
    // tooltip
    "HotList": "Hot List",

    // the name of the items that can be put in the hot list
    "booking": "Booking",
    "bill": "Shipment",
    "purchaseOrder": "Purchase Order",

    "Consignee": "Consignee",
    "Shipper": "Shipper",

    // date-related
    "ETD": "Est. Departure Date", // estimated departure date
    "ETA": "Est. Arrival Date", // estimated arrival date
    "From": "From", // From POL
    "To": "To", // To POD
  },

  // the text related to the search function
  // in the top navigation bar
  "search": {
    // shown when loading
    "Loading ...": "Loading ...",

    // number of records found
    "Total: {number} records": "Total: {{ number }} records", // note the {{ number }} should NOT be translated

    // time spent on finding the records 
    "{time} seconds": "{{ time }} seconds", // note that {{ time }} should NOT be translated

    // shown when there is no result
    "No results": "No results"
  },

  // the text related to the navigation menu
  // in the LHS drawer
  "drawer-menu": {
    "Dashboard": "Dashboard",
    "Book Now": "Book Now", // create a booking
    "Shipments": "Shipments",
    "My Bookings": "My Bookings",
    "Relationships": "Relationships", // manage parties
    "Alerts": "Alerts",
    "Purchase Orders": "Purchase Orders",
    "Flex Fields": "Flex Fields", // refer to flexFields.pageTitle
    "Admin": "Admin", // administrator-only section
    "Products": "Products", // product management page
    "Workflow": "Workflow", // manage the flow of booking status
    "Product Categories": "Product Categories", // product category management page
    "Schedule Search": "Schedule Search", // search for shipment schedule
    "API Application": "API Application", // manage how FM3K integrates data with 360
    "Invitations and Users": "Invitations and Users", // manage invitations and users
    "Customer Profile": "Customer Profile", // manage information of the current company
    "User Permissions": "User Permissions", // permission management
    "User Group": "User Group"  // ~ department
  },

  // the text related to workflow
  // in administration page
  "Workflow": {
    "booking": "Booking",
    "purchaseOrder": "Purchase Order",
    "bill": "Shipment"
  },

  // the text used (mainly the field names)
  // in Dashboard (/:dashboardId)
  // in AlertsPage (/messages)
  // in ShipmentsPage (/shipments)
  // in BookingsPage (/bookings)
  // in PurchaseOrdersPage (/purchaseOrders)
  "ReportingTool": {
    // shown in parameteres that support multi-selection
    "Selected ({count})": "Selected ({{ count }})", // note the {{ count }} should NOT be translated

    // groups in date filter popup
    "Year": "Year",
    "Month": "Month",
    "Shortcut": "Shortcut ({{ group|i18n(['ReportingTool']) }})",
    "current": "Current",
    "last": "Last",

    // date-typed parameters
    "Current Week": "Current Week",
    "Current Month": "Current Month",
    "Current Quarter": "Current Quarter",
    "Current Year": "Current Year",
    "Year-To-Date": "Year-To-Date",
    "Last 7 Days": "Last 7 Days",
    "Last 30 Days": "Last 30 Days",
    "Last 12 Months": "Last 12 Months",

    // title of the dashboard configuration dialog
    "Configure dashboard": "Configure Dashboard",

    // title of the table configuration dialog
    "Configure table": "Configure Table",

    // dropdown of reports
    "Unnamed": "Unnamed", // report without a name
    "Select report": "Select Report",
    "New Report": "New Report", // creating a new report
    "No available reports": "No Available Reports",
    "Reports shared to me": "Reports Shared with Me",
    "My Reports": "My Reports",

    // for mapping tool
    "MBL": "MBL", // Master Bill of Landing
    "HBL": "HBL", // House Bill of Landing
    "Booking#": "Booking #",
    

    // save report dialog
    "Save report": "Save Report", // title of the dialog
    "Update report": "Update Report", // title of the dialog
    "Report name": "Report Name",
    "Report category": "Report Category",
    "Description": "Description",
    "Save as new report": "Save as New Report",
    "Delete report": "Delete Report",

    // share report dialog
    "Share to ...": "Share to ...", // placeholder
    "Share report": "Share Report", // title of the dialog
    "Share to all available branches": "Share to all available branches", // button to share to all offices
    "Branch": "Branch", // share a report to an office e.g. HKG
    "Division": "Division", // share a report to a department e.g. sea import department
    "User": "User", // share a report to a specific user by email
    "Branch-chip": "Branch: {{ name }}",  // note the {{ name }} should NOT be translated
    "Division-chip": "Division: {{ name }}",  // note the {{ name }} should NOT be translated
    "User-chip": "User: {{ name }}",  // note the {{ name }} should NOT be translated

    // fields for /shipments
    "id": "ID",
    "jobNo": "Job #",
    "jobDate": "Job Date",
    "masterNo": "Master #",
    "houseNo": "House #",
    "referenceNo": "Ref #",
    "bookingNo": "Booking #",
    "contractNo": "Contact #",
    "estimatedDepartureDate": "Est. Departure Date",
    "estimatedArrivalDate": "Est. Arrival Date",
    "officeParty": "Office",
    "officePartyShortName": "Office (abbr)",
    "officeCountryCode": "Office Country",
    "salesmanPersonName": "Salesman",
    "salesmanCode": "Salesman Code",
    "shipperParties": "Shipper",
    "shipperShortName": "Shipper (abbr)",
    "shipperPartyCode": "Shipper Code",
    "shipperPartyNature": "Shipper Nature",
    "consigneeParties": "Consignee",
    "consigneeShortName": "Consignee (abbr)",
    "consigneePartyCode": "Consignee Code",
    "consigneePartyNature": "Consignee Nature",
    "linerAgent": "Liner Agent",
    "linerAgentShortName": "Liner Agent (abbr)",
    "linerAgentPartyCode": "Liner Agent Code",
    "roAgent": "RO Agent",
    "roAgentShortName": "RO Agent (abbr)",
    "roAgentPartyCode": "RO Agent Code",
    "agent": "Agent",
    "agentShortName": "Agent (abbr)",
    "agentPartyCode": "Agent Code",
    "agentGroup": "Agent Group",
    "controllingCustomer": "Controlling Customer",
    "controllingCustomerShortName": "Controlling Customer (abbr)",
    "controllingCustomerPartyCode": "Controlling Customer Code",
    "controllingCustomerPartyNature": "Controlling Customer Nature",
    "shipmentCreateUser": "Shipment Created by",
    "commodity": "Commodity",
    "quantity": "Quantity",
    "containerNumbers": "Container #",
    "20ft": "20FT Containers",  // number of 20ft containers
    "40ft": "40FT Containers",  // number of 40ft containers
    "40ftHQ": "40FT HQ Containers", // number of 40ft HQ containers
    "45ft": "45FT Containers",  // number of 45ft containers
    "OtherContainerType": "Other Containers", // number of other containers
    "carrierName": "Carrier",
    "carrierCode": "Carrier Code",
    "vesselFlight": "Vessel / Flight",
    "vesselVoyage": "Vessel / Voyage",
    "division": "Division", // department
    "service": "Service", // e.g. CY, CFS
    "incoTerms": "Incoterms",
    "freightTerms": "Freight Terms",  // e.g. CC (collected), PP (Prepaid)
    "otherTerms": "Other Terms",  // e.g. CC (collected), PP (Prepaid)
    "moduleType": "Module Type",  // e.g. AIR, SEA
    "boundType": "Bound Type",  // e.g. import, export
    "billType": "Bill Type",  // e.g. M (master), H (house)
    "serviceType": "Service Type",  // ~ division
    "shipmentType": "Shipment Type",  // for SEA e.g. FCL, LCL, Consol
    "nominatedType": "Nominated Type",  // e.g. R (Routing), F (Free-hand)
    "isDirect": "Direct?",  // whether it is a direct shipment
    "isCoload": "Coload?",  // whether it is a coload shipment
    "por": "Place of Receipt (code)",
    "porLocation": "Place of Receipt",
    "porCountryName": "Country of Receipt",
    "porCountryCode": "Country of Receipt (code)",
    "pol": "Port of Loading (code)",
    "polLocation": "Port of Loading",
    "polCountryName": "Country of Loading",
    "polCountryCode": "Country of Loading (code)",
    "pod": "Port of Discharge (code)",
    "podLocation": "Port of Discharge",
    "podCountry": "Country of Discharge",
    "podCountryCode": "Country of Discharge (code)",
    "pld": "Place of Delivery (code)",
    "pldLocation": "Place of Delivery",
    "pldCountryName": "Country of Delivery",
    "pldCountryCode": "Country of Delivery (code)",
    "finalDestination": "Final Dest. (code)",
    "finalDestinationLocation": "Final Destination",
    "finalDestinationCountryName": "Country of Final Dest.",
    "finalDestinationCountryCode": "Country of Final Dest. (code)",
    "lastStatus": "Last Status",  // latest shipment status
    "lastStatusDate": "Last Status Date",
    "noOfContainer": "No. of Containers",
    "grossWeight": "Gross Weight",
    "chargeableWeight": "Chargeable Weight",
    "cntCbm": "CBM",
    "teu": "TEU",

    // fields for /messages
    "createdAt": "Created At",
    "alertType": "Alert",
    "alertCategory": "Type",
    "alertStatus": "Status",  // e.g. Open, Closed
    "message": "Message",
    "tableName": "Category",
    "primaryKey": "Reference ID",

    // fields for /bookings
    "poNo": "PO #",
    "cargoReadyDate": "Cargo Ready Date",
    "consignee": "Consignee",
    "shipper": "Shipper",
    "portOfLoading": "Port of Loading",
    "polHScode": "POL HS Code",
    "portOfDischarge": "Port of Discharge",
    "podHScode": "POD HS Code",
    "placeOfReceipt": "Place of Receipt",
    "placeOfDelivery": "Place of Delivery",
    "status": "Last Status",
    "statusDate": "Last Status Date",

    // fields for /purchaseOrders,
    "estimated": "Est. Delivery Date",  // estimated delivery date
    "remarks": "Remarks",
    "createdBy": "Created By",

    // fields for /shipment/map/:id,
    "Shipper": "Shipper",
    "Consignee": "Consignee",

    // fields for TableCard
    "noOfShipments": "No. of Shp",
    "yoyPercentageChange": "YoY Pct Chg",

    // common fields
    "Total": "Total"
  },

  // the text used in Table
  "Table": {
    // the number of rows shown in each page
    "Rows per Page": "Rows per Page",

    // the number of rows
    "results": "{{ count }} results", // note the {{ count }} should NOT be translated

    // the number of pages
    "pages": "{{ numPages }} pages",  // note the {{ numPages }} should NOT be translated

    // used in summary row
    "Total": "Total"
  },

  // the text shown
  // in AddUserPage (/admin/invitation/create)
  "addCustomerUsers": {
    // title of the page
    "Update Invitation": "Update Invitation",
    "Create Invitation": "Create Invitation",
    "Update User": "Update User",
    "Create User": "Create User",

    // the personal details of the user to be created
    "Personal Details": "Personal Details",
    "First Name": "First Name",
    "Last Name": "Last Name",
    "Title": "Title", // e.g. Mr., Ms., Dr., etc.
    "e-mail": "Email",

    // the group the user to be created belongs to (~ Department)
    "User Group": "User Group", // e.g. Sea Export Department

    // the checkbox for whethere the user to be created is an admin
    "is Admin": "is Admin",

    // tell the user to select the office the user to be created belongs to
    "User Branches": "Branches",  // e.g. Hong Kong office
    "selectBranchOrOfficeName": "Select branch or office name",

    // the default filtering criteria for Dashboard
    "Default Filters": "Default Filters"
  },

  // the text shown
  // in product-related pages (/admin/products)
  "products": {
    // the details of the product to be registered
    "name": "Name",
    "productCategory.name": "Category",
    "productCategory.party.shortName": "Party", // the company that provides this product
    "customerProductCode": "Customer Product Code", // the internal product code used within the company
    "skuCode": "SKU Code",
    "description": "Description",

    // shown when the product is saved successfully
    "Product created": "Product '{{ name }}' created",  // note the {{ name }} should NOT be translated
    "Product updated": "Product '{{ name }}' updated" // note the {{ name }} should NOT be translated
  },

  // the text shown
  // in AddProductCategoryPage (/admin/productCategories)
  "productCategories": {
    // the details of the product category to be registered
    "name": "Name",
    "party.shortName": "Party", // the company that provides products under this category
    "description": "Description",

    // shown when the category is saved successfully
    "Category created": "Category '{{ name }}' created",  // note the {{ name }} should NOT be translated
    "Category updated": "Category '{{ name }}' updated" // note the {{ name }} should NOT be translated
  },

  // the text shown
  // in FlexFieldsPage (/admin/flexDefinition)
  // these are flexible fields defined for each customer
  "flexFields": {
    "pageTitle": "Flex Fields",
    "Name": "Name",
    "Type": "Type",

    // the list of available field types
    "Text": "Text",
    "Number": "Number",
    "List": "List"
  },

  // the text shown
  // in customer-related page (/connections)
  "customers": {
    // the transaction role of that company corresponding to the company of the current user
    "Select Party Role": "Select Party Role",

    // create a company relationship
    "Party Creation": "Party Creation",

    // save the company relationship
    "Save Party": "Save Party",

    // update the information of offices
    "Update Branches": "Update Branches"
  },

  // the text shown
  // in Wizard's document section e.g. /booking/:id, /purchaseOrder/:id
  "documents": {
    "documentLibrary": "Document Library",
    "DocumentsUploaded": "{{ number }} Documents Uploaded", // note the {{ number }} should NOT be translated
    "Manage Documents": "Manage Documents"
  },

  // the text shown
  // in Wizard's transaction date section e.g. /shipment/:id, /booking/:id, /purchaseOrder/:id
  "transactionDate": {
    "Transaction Date": "Transaction Date",
    "Estimated": "Estimated",
    "Actual": "Actual",
    "PO Date": "PO Date",
    "Cargo Ready Date": "Cargo Ready Date",
    "Departure Date": "Departure Date",
    "DEPARTURE": "Departure Date",
    "Arrival Date": "Arrival Date",
    "ARRIVAL": "Arrival Date",
    "Final Delivery Date": "Final Delivery Date",
    "CY Cutoff": "CY Cutoff",
    "Create Sample Ocean Bill": "Create Sample Ocean Bill"
  },

  // the text shown
  // in Wizard's party section e.g. /shipment/:id, /booking/:id, /purchaseOrder/:id
  "partySection": {
    "Address": "Address",
    "Contact Person": "Contact Person",
    "Tel": "Tel.",
    "Email": "Email",
    "Name": "Name",
    "Select Buyer": "Select Buyer",
    "Address 1": "Street and number, P.O. box, c/o.",
    "Address 2": "Apartment, suite, unit, building, floor, etc.",
    "Address 3": "",
    "Address 4": "",
    "City": "City",
    "State/Province": "State/Province",
    "Country": "Country",
    "Zip/Postal Code": "Zip/Postal Code"
  },

  // the text shown
  // in Wizard's transaction date section e.g. /shipment/:id, /booking/:id, /purchaseOrder/:id
  "transactionDate": {
    "Transaction Date": "Transaction Date",
    "Estimated-prefix": "Estimated ", // prefix added to date field e.g. 'Estimated ' + 'Arrival Date' = 'Estimated Arrival Date'
    "Actual-prefix": "Actual ",  // prefix added to date field e.g. 'Actual ' + 'Arrival Date' = 'Actual Arrival Date'

    // date label
    "PO Date": "PO Date", // purchase order date
    "Cargo Ready Date": "Cargo Ready Date",
    "Departure Date": "Departure Date",
    "Arrival Date": "Arrival Date",
    "Final Delivery Date": "Final Delivery Date",
  },

  // the text shown
  // in Wizard's cargo and container section e.g. /shipment/:id, /booking/:id
  "cargoAndContainers": {
    // for cargos
    "Commodity": "Commodity",
    "Quantity": "Quantity",
    "Weight": "Weight",
    "Gross Weight": "Gross Weight",
    "Volume Weight": "Volumetric Weight",
    "Chargeable Weight": "Chargeable Weight",
    "CBM": "CBM",
    "Marks and Numbers": "Marks and Numbers",
    "Descriptions of Goods": "Descriptions of Goods",
    "Dimension": "Dimension",

    // for containers
    "Container No": "Container #",
    "Carrier Booking No": "Carrier Booking #",
    "Seal No": "Seal #",
    "Type": "Type"  // e.g. 20'GP, 40FT, etc.
  },

  // the text shown
  // in Wizard's alert section e.g. /shipment/:id, /booking/:id, /purchaseOrder/:id
  "chat": {
    "channels": "Channels",
    "placeHolder": "Type a message",
    "Unread": "Unread", // button to mark a message as unread
    "Read": "Read", // button to mark a message as read
    "View Messages": "View Messages"
  },

  // the text shown
  // in ShipmentPage (/shipment/:id)
  "shipments": {
    "pageTitle": "Shipment Summary",
    "shipments": "Shipments",
    "cargoDetails": "Cargo Details",
    "billContainerDetails": "Container Details",

    // transaction date section
    "ARRIVAL": "Arrival Date",
    "DEPARTURE": "Departure Date",

    // detail section
    "House No": "House #",
    "Master No": "Master #",
    "Place of Receipt": "Place of Receipt",
    "Port Of Loading": "Port of Loading",
    "Estimated Departure Date": "Est. Departure Date",
    "Port Of Discharge": "Port of Discharge",
    "Estimated Arrival Date": "Est. Arrival Date",
    "Place Of Delivery": "Place of Delivery",
    "Final Destination": "Final Destination",
    "Vessel/Voyage": "Vessel / Voyage",
    "Flight No": "Flight #",
    "Carrier": "Carrier",
    "Service": "Service", // e.g. CY, CFS
    "Incoterms": "Incoterms",
    "Issuing Agent": "Issuing Agent",
    "Value For Carriage": "Value for Carriage",
    "Value For Customs": "Value for Customs",
    "Amount Of Insurance": "Amount of Insurance",
    "Issue At": "Issue at", // where it is issued,
    "Issue Date": "Issue Date",

    // the shipment status section
    "shipmentsStatus": "Shipment Status",
    "Booked": "Booked", // shown when the shipment is booked but not yet being tracked
    "Show More...": "Show More...",
    "Show Less...": "Show Less..."
  },

  // the text shown
  // in BookingPage (/booking/:id)
  "booking": {
    // general
    "booking": "Booking", // page title
    "Please correct these errors and try again.": "Please correct these errors and try again.",
    "Marks and Numbers": "Marks and Numbers", // remark
    "Description of Goods": "Description of Goods",
    "Parties": "Parties", // transaction parties e.g. shipper, consignee, etc.
    "more": "Show More ...",
    "less": "Show Less ...",
    "Book": "Book", // 'Book' button
    "Workflow / Milestones": "Workflow / Milestones",
    "Action Required By": "Action Required By", // the people allowed to move on to the next workflow status or the next milestone

    // container section
    "Container No": "Container #",
    "Container Type": "Type",
    "Seal No": "Seal #",
    "No.Of Units": "No. of Units",
    "Unit": "Unit", // the counting unit of 'No. of Units', the metric unit of dimensions, the metirc unit of weight
    "Quantity": "Quantity",
    "V": "Vol.",  // volume
    "L": "L.",  // length
    "W": "W.",  // width
    "H": "H.",  // height
    "Weight": "Weight",
    "CTNS": "CTNS", // number of cartons,
    "Pieces": "Pieces", // number of pieces specified in purchase order

    // containers section
    "Containers": "Containers",
    "Container": "Container", // add container to Containers
    "Requested": "Requested",
    "Container Details": "Container Details",
    "Container Detail": "Container Detail", // add container detail to Container Details
    "Packing Details": "Packing Details",
    "Packing Detail": "Packing Detail", // add packing detail to Packing Details

    // container details section
    "Add Container": "Add Container",
    "Packing": "Packing",
    "Dimension": "Dimension",
    "By Units": "Per Pieces",
    "By Total Shipment": "As a Whole",

    // delivery details section
    "Delivery Details": "Delivery Details",
    "BookingDetails": "Booking Details",
    "Flight Forwarder": "Flight Forwarder",
    "Select Freight Forwarder": "Select Freight Forwarder",
    "SelectedFreightForwarder": "Selected Freight Forwarder",
    "Create a new vessel": "Create a New Vessel",
    "Fill in Delivery Details": "Fill in Delivery Details",
    "Vessel Name": "Vessel Name",
    "Call Sign": "Call Sign", // vessel code
    "duplicateVessel": "Duplicate vessel found. Please check call sign.",
    "Transport Mode": "Transport Mode", // moduleType i.e. AIR, SEA
    "Bound": "Bound", // boundType i.e. I(Import), O(Export)
    "Port Of Loading": "Port Of Loading",
    "Port Of Discharge": "Port Of Discharge",
    "Estimated Departure Date": "Estimated Departure Date",
    "Estimated Arrival Date": "Estimated Arrival Date",
    "Place of Receipt": "Place of Receipt",
    "Place of Delivery": "Place of Delivery",
    "Final Destination": "Final Destination",
    "Carrier": "Carrier",
    "Vessel": "Vessel", // vessel name
    "Voyage": "Voyage", // voyage for SEA, ROAD
    "Flight Number": "Flight Number", // voyage for AIR

    // freight details section
    "Freight Details": "Freight Details",
    "Service": "Service", // e.g. CY, CFS
    "Incoterms": "Incoterms",
    "Freight Term": "Freight Terms",
    "Other Term": "Other Terms",

    // commodity details section
    "Commodity Details": "Commodity Details",
    "Commodity": "Commodity",

    // party section
    "partiesTitle": "Fill in Parties' Information",

    // transaction date section
    "transactionsTitle": "Fill in Transaction Dates",

    // purchase order section
    "Purchase Orders": "Purchase Orders",
    "Packing Details": "Packing Details",
    "Mass Update": "Mass Update",
    "Search for PO": "Search for PO",

    // references section
    "References": "References",
    "Reference Type": "Reference Type",
    "Reference Number": "Reference #",
    "Doc Date": "Doc. Date",
    "Remarks": "Remarks",

    // messages
    "Booking created": "Booking created",
    "Booking updated": "Booking updated",
    "Sorry, Unable to process booking.": "Sorry, Unable to process booking."  // fail to prepare booking preview screen
  },

  // the text shown
  // in BookingPage (/booking/:id)
  // in PurchaseOrderPage (/purchaseOrder/:id)
  "roleCode": {
    "Shipper": "Shipper",
    "Consignee": "Consignee",
    "Agent": "Agent", // for shipment and booking
    "Controlling Customer": "Controlling Customer", // for shipment
    "Liner Agent": "Liner Agent", // for shipment
    "Customer Office": "Customer Office", // for shipment
    "Forwarder": "Forwarder", // for booking
    "Notify Party": "Notify Party", // for booking
    "Buyer": "Buyer", // for purchase order
    "Factory": "Factory"  // for purchase order
  },

  // the text from
  // the CodeMaster table
  "codeMaster": {
    // BOUND
    "EXPORT": "EXPORT", // O, outbound
    "IMPORT": "IMPORT", // I, inbound
    "MISC": "MISC", // M, miscellaneous

    // MODULE
    "SEA FREIGHT": "SEA FREIGHT", // SEA
    "AIR FREIGHT": "AIR FREIGHT", // AIR
    "ROAD FREIGHT": "ROAD FREIGHT", // ROAD

    // INCOTERMS
    "Ex Works": "Ex Works (EXW)",
    "Free Carrier": "Free Carrier (FCA)",
    "Carriage Paid To": "Carriage Paid To (CPT)",
    "Carriage and Insurance Paid to": "Carriage and Insurance Paid to (CIP)",
    "Delivered At Terminal": "Delivered At Terminal (DAT)",
    "Delivered At Place": "Delivered At Place (DAP)",
    "Delivered Duty Paid": "Delivered Duty Paid (DDP)",
    "Free Alongside Ship": "Free Alongside Ship (FAS)",
    "Free on Board": "Free on Board (FOB)",
    "Cost and Freight": "Cost and Freight (CFR)",
    "Cost, Insurance & Freight": "Cost, Insurance & Freight (CIF)",
    "Delivered at Frontier": "Delivered at Frontier (DAF)",
    "Delivered Ex Ship": "Delivered Ex Ship (DES)",
    "Delivered Ex Quay": "Delivered Ex Quay (DEQ)",
    "Delivered Duty Unpaid": "Delivered Duty Unpaid (DDU)",

    // PAYTERMS i.e. freight terms, other terms
    "PREPAID": "PREPAID (PP)",
    "COLLECT": "COLLECT (CC)",

    // SERVTYPE i.e. service type
    "LCL/LCL": "LCL/LCL",
    "FCL/FCL": "FCL/FCL",
    "FCL/LCL": "FCL/LCL",
    "DIRECT": "DIRECT",
    "CONSOL": "CONSOL"
  },

  // the text shown
  // in ScheduleSearchPage (/scheduleSearch)
  "scheduleSearch": {
    "from": "From",
    "to": "To",
    "etd": "Estimated Departure Date",
    "transport": "Transport", // ~ serviceType, i.e. FCL, LCL, AIR
    "Transit Time": "Transit Time", // estimated days required for the shipment
    "Carrier": "Carrier",
    "Departure": "Departure", // = departure date
    "Arrival": "Arrival", // = arrival date
    "Cut-off": "Cut-off", // the deadline for booking
    "{days} Days": "{{ days }} Days"  // note the {{ days }} should NOT be translated
  },

  // the text shown
  // in ConnectionsPage (/connections)
  "connections": {
    "partyRoles": "Party Roles",
    "searchParties": "Party Name or Short Name",
    "createNewParty": "Create a New Party",
    "roleCode": "Role Code",
    "partyRole": "Party Role",
    "Remove": "Remove",
    "managePartyRelations": "Manage Party Relations",
    "partyInfo": "Party Info.",
    "connectedParties": "Connected Parties - {{ count }}",  // note the {{ count }} should NOT be translated
    "contacts": "Contacts - {{ count }}", // note the {{ count }} should NOT be translated
    "choseParty": "Choose Parties to Connect",
    "connectNewParty": "Connect a New Party",
    "shortName": "Short Name",  // party short name
    "customerPartyCode": "Customer Party Code",
    "roles": "Roles", // party roles
    "address": "Address",
    "addNewRole": "Add a New Role to This Party",
    "manageCurrentRoles": "Manage Roles of This Party",
    "email": "Email",
    "name": "Name",
    "phone": "Phone",
    "Invitation": "Invitation"
  },

  "purchaseOrders": {
    "pageTitle": "Purchase Orders",
    "add": "Add",
    "createPurchaseOrders": "Create purchase orders",
    "cargoReadyDate": "Cargo Ready Date",
    "deliveryDate": "Delivery Date",
    "customerEmail": "Customer Email",
    "vendor": "Vendor",
    "vendorEmail": "Vendor Email",
    "portOfLoading": "Port Of Loading",
    "polCountry": "POL Country",
    "portOfDischarge": "Port Of Discharge",
    "podCountry": "POD Country",
    "serviceType": "Service Type",
    "incoTerms": "Inco Terms",
    "freightTerms": "Freight Terms",
    "purchaseOrderDetails": "Purchase Order Details",
    "product": "Product",
    "productDescription": "Product Description",
    "quantity": "Quantity",
    "unitOfMeasure": "Unit Of Measure",
    "grossWeight": "Gross Weight",
    "unitPrice": "Unit Price",
    "customer": "Customer",
    "save": "Save",
    "cancel": "Cancel",
    "fclLcl": "FCL/LCL",
    "PO created": "Purchase Order '{{ id }}' created",
    "PO updated": "Purchase Order '{{ id }}' updated",
    "PO Header": "PO Header",
    "Remarks": "Remarks",
    "Ref. No.": "Ref. No.",
    "PO No.": "PO No.",
    "Mode": "Mode",
    "POL": "POL",
    "POD": "POD",
    "Incoterms": "Incoterms",
    "Freight Term": "Freight Term",
    "PO Items": "PO Items",
    "Purchase Order": "Purchase Order"
  },
  "rolesManagement": {
    "rolesManagement": "Roles Management",
    "update": "Update",
    "selectCustomer": "Select Customer",
    "selectRole": "Select Role",
    "getPermissions": "Get Permissions",
    "menuItems": "Menu Items",
    "dashboardCards": "Dashboard Cards",
    "add": "Add",
    "cancel": "Cancel",
    "createUserRole": "Create User Role"
  },
  "thirdPartyIntegration": {
    "third-party-services": "Third Party Services",
    "submit-to-INTTRA": "Submit to INTTRA",
    "not-submitted": "Not Submitted"
  },
  "mappingView": {
    "Mapping Attributes": "Mapping Attributes",
    "Columns": "Columns",
    "PO line items": "PO line items",
    "Template Name": "Template Name",
    "Add new mapping file": "Add new mapping file"
  }
}