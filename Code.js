function doPost(request) {
   var urls = env.spreadsheets;
   var slack_token = env.SLACK_TOKEN;
   var params = request.parameters;

   if (slack_token != params.token) {
      return respond({ response_type: 'in_channel', text: 'Invalid token.' })
   }

   // May have other commands later
   if (params.command[0] !== '/abbrev') {
      return respond({ response_type: 'ephemeral', text: 'Can\'t process this command.' })
   }

   var abbrevSheetApp = SpreadsheetApp.openByUrl(urls.abbrev)
   var abbrevSheet = abbrevSheetApp.getSheets()[0];
   var lastRow = abbrevSheet.getLastRow();
   var rangeObject = abbrevSheet.getRange('A2:B' + lastRow);
   var rows = (rangeObject && rangeObject.getValues()) || [];
   var requested = params.text && params.text[0];
   requested = requested.trim()

   if (!requested) {
      return respond({ 'response_type': 'ephemeral', text: 'Please provide an abbreviation to resolve!' })
   }

   rows = rows.filter(function (r) {
      return r[0].toLowerCase().trim() === requested.toLowerCase().trim()
   });

   if (!rows.length) {
      return respond({ 'response_type': 'in_channel', text: 'I couldn\'t find anything for "' + requested + '". <' + urls.abbrev + '|Add it?>' })
   }

   var results = [];
   rows.forEach(function (row) {
      results.push('*' + row[1] + '*'); // Add bold
   });
   var response = 'According to <' + urls.abbrev + '|my database>, *' + requested + '* means ' + results.join(' or ')

   return respond({ 'response_type': 'in_channel', text: response })
}

function respond(output) {
   return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}