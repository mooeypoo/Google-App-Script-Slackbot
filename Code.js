function doPost(request) {
   var urls = env.spreadsheets;
   var slackTokens = env.SLACK_TOKENS;
   var params = request.parameters;

   if (Object.keys(env.SLACK_TOKENS).indexOf(params.token[0]) === -1) {
      return respond({ response_type: 'ephemeral', text: 'Invalid token.' })
   }

   // May have other commands later
   if (env.SLACK_TOKENS[params.token[0]] !== params.command[0]) {
      return respond({ response_type: 'ephemeral', text: 'Can\'t process this command.' })
   }

   var commandParameter = params.text && params.text[0];
   commandParameter = commandParameter.trim();

   if (params.command[0] === '/abbrev') {
      var rows = getSheetRows(urls.abbrev, 'A2')

      if (!commandParameter) {
         return respond({ 'response_type': 'ephemeral', text: 'Please provide an abbreviation to resolve!' })
      }

      rows = rows.filter(function (r) {
         return r[0].toLowerCase().trim() === commandParameter.toLowerCase().trim()
      });

      if (!rows.length) {
         return respond({ 'response_type': 'in_channel', text: 'I couldn\'t find anything for "' + commandParameter + '". <' + urls.abbrev + '|Add it?>' })
      }

      var results = [];
      rows.forEach(function (row) {
         var term = row[1]
         if (row[2]) {
            // There's a URL
            term = '<' + row[2] + '|' + row[1] + '>'
         }
         // Replace * inside the term so that they don't get confused with bold in Slack
         term = term.replace(/\*/g, '✱')
         results.push('*' + term + '*'); // Add bold
      });
      var response = 'According to <' + urls.abbrev + '|my database>, *' + commandParameter + '* means ' + results.join(' or ')

      return respond({ 'response_type': 'in_channel', text: response })
   } else if (params.command[0] === '/quaranteam') {
      var rows = getSheetRows(urls.fun, 'C2') // Note: Starting from "official title" column
      // Official title - 0
      // fun title - 1
      // fact - 4
      // joke - 5
      // name - 8

      // Collect
      jokes = [];
      facts = [];
      rows.forEach(function (row) {
         if (row[4].trim()) {
            facts.push({
               content: row[4].trim(),
               author: row[8].trim(),
               author_title: row[1].trim()
            })
         }

         if (row[5].trim()) {
            jokes.push({
               content: row[5].trim(),
               author: row[8].trim(),
               author_title: row[1].trim()
            })
         }
      });

      var result = {};
      var preface = '';
      if (commandParameter === 'fact') {
         // Random fact
         result = getRandomItem(facts)
         type = 'fact'
      } else if (commandParameter === 'joke') {
         // Random joke
         result = getRandomItem(jokes)
         type = 'joke'
      } else {
         // Random either
         var rand = Math.floor(Math.random() * 2) // 0 or 1
         if (rand = 0) {
            // Random fact
            result = getRandomItem(facts)
            type = 'fact'
         } else {
            // Random joke
            result = getRandomItem(jokes)
            type = 'joke'
         }
      }

      var attachments = [
         {
            'mrkdwn_in': ['text'],
            "color": "#36a64f",
            "pretext": "",
            "title": type === 'joke' ? "Random joke from a fellow WMF'er" : "Random fact about a fellow WMF'er",
            "text": result.content,
            "fields": [
               {
                  "title": "",
                  "value": "",
                  "short": true
               },
               {
                  "title": result.author,
                  "value": result.author_title,
                  "short": true
               }
            ]
         },
         {
            'mrkdwn_in': ['text'],
            "color": "#36a64f",
            "text": "<https://forms.gle/xQRSdKtyxVSnmTQ97|Click here to add your own facts or jokes through the form!>"
         }
      ]
      return respond({
         'response_type': 'in_channel',
         attachments: attachments
      });
   }
}

function respond(output) {
   return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

function getSheetRows(sheetUrl, startRange) {
   var SheetApp = SpreadsheetApp.openByUrl(sheetUrl)
   var sheet = SheetApp.getSheets()[0];
   var lastRow = sheet.getLastRow();
   var lastColumn = sheet.getLastColumn();
   var rangeObject = sheet.getRange(startRange + ':' + lastRow + lastColumn);

   return rangeObject.getValues().filter(function (r) {
      return !!r[0].length; // Only return if first cell has value
   });
}

function getRandomItem(arr) {
   return arr[Math.floor(Math.random() * arr.length)];
}
