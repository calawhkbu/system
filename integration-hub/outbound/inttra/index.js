function intrraHandler () {
  var INTTRA_Metadata = require("./metadata/INTTRABookingRequest");
  // Make list of Parties based on booking object participated parties
  /*
      // Major functions:
      1. construct new JSON for INTTRA
      2. convert JSON to XML
      3. post XML to INTTRA
      4. save into DB
      5. get tokens for QWYK schedule search service
      6. refresh tokens for QWYK schedule search service
  */

  // 1. construct new JSON for INTTRA:
  // mapping INTTRA required fields to 360 booking fields (should be based on the metadata file, statis for now)
  var constructNewJSONforINTTRA = function (params, helper, callback) {
      let booker = params.bookingObj;
      let message = JSON.stringify(INTTRA_Metadata.message);
      let data = swig.render(message, { locals: booker });
      let jsonData = JSON.parse(data)
      makePartiesList(jsonData, booker);
      equipmentDetails(jsonData, booker);
      jsonToXMLParser(jsonData, helper, (INTTRA_XML) => {
        console.log('INTTRA_XML', INTTRA_XML);
          return callback(INTTRA_XML);
      })
  }
  var makePartiesList = function (JSONObject, booker, helper) {
      var partiesList = [];
      var partyDetails = booker.bookingParties;
      Object.keys(partyDetails).forEach((partyRole) => {
         let bookingParty = partyDetails[partyRole];
          let partyComponent = JSON.stringify(INTTRA_Metadata.message.MessageBody.MessageProperties.Party);
          let partyObject = swig.render(partyComponent, { locals: bookingParty });
          partyObject = JSON.parse(partyObject);
          partyObject.Role = partyRole;
         partiesList.push(partyObject);
      })
      let carrier = swig.render(JSON.stringify(carrierParty()), { locals: booker });
      partiesList.push(JSON.parse(carrier));
      JSONObject.MessageBody.MessageProperties["Party"] = partiesList;
  }

  var carrierParty = function () {
      return {
          "Role": "Carrier",
          "Name": `{{carrierCode}}`
      };
  }

  var equipmentDetails = function(JSONObject, booker) {
      var equipmentList = [];
      var bookingContainers = booker['bookingContainers'];
      bookingContainers.forEach((continer) => {
          let containersInfo = JSON.stringify(INTTRA_Metadata.message.MessageBody.MessageDetails.EquipmentDetails);
          let partyObject = swig.render(containersInfo, { locals: continer });
          partyObject = partyObject.replace("&#39;","'");
          partyObject = JSON.parse(partyObject);
          partyObject["ImportExportHaulage"]["CargoMovementType"] = booker.service;
          equipmentList.push(partyObject);
      })
      JSONObject.MessageBody.MessageDetails.EquipmentDetails = equipmentList;
  }

  // 2. convert JSON to XML
  var jsonToXMLParser = function(inttra_JSON, helper, callback) {
      var xml = helper.toXML(inttra_JSON, null, 2);
      return callback(xml);
  }

  this.handle = function (appId, params, helper) {
    console.log('start')
    try {
      var url = null;
      var reqPayLoad = null;
      // TODO:: handle ourbound API call here
      constructNewJSONforINTTRA(params, helper, (response) => {
          return reqPayload = response;
      });
      // 3. post XML to INTTRA
      // INTTRA post URL (to be updated when needed)
      // 4. save into DB
      helper.saveLog(appId, url, params.entity, params.entityId, reqPayLoad, null, null);
    } catch (e) {
      helper.saveLog(appId, url, params.entity, params.entityId, reqPayLoad, null, JSON.stringify(e));
    }
  }
}

module.exports = new intrraHandler();
