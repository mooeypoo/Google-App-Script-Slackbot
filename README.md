Google App Script Slack Commands
================================

This is a google app script that takes information from two Google spreadsheets and respond to slack commands.

## How it works

This code is meant to run on a Google App Script, and uses `.clasp` as a deployment tool. It can potentially be used for other spreadsheets by setting up their urls in the env file. Note the expectation of the columns in the slack responses.

## Contributing

As always, pull requests and issue reporting is very welcome!

### To deploy:

- Rename `.clasp.example.json` to `.clasp.json`
- Insert the correct app ID to the `.clasp.json` file
- Run `clasp push` to push the scripts to your Google App script
- Set up SLACK commands. This bot expects two commands (you can do either or both)
  - `/fun` assumes a spreadsheet with jokes and fun facts
  - `/abbrev` assumes a spreadsheet with 'abbreviation' and 'explanation' as its columns
- Rename `env.js.example` to `env.js`
- Fill in the relevant tokens per command, and the spreadsheet urls
- Push with clasp `clasp push`
- Go go the Google App Script page and deploy the app
- Copy the deployed app link (note! Not the development version!)
- Put the deployed app link in the "Slash command" URL definition in Slack

**NOTE:** The Google App script permissions must allow for anonymous access for the slack command to work. However, the script itself does not expose the content of the spreadsheet unless the token and command are correct (meaning they will only be exposed in the requested slack workspace)

You can now test your commands.

