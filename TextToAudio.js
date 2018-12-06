let AWS = require('aws-sdk');
require('./auth.js');

let polly = new AWS.Polly();
let fs = require('fs');

/* describe all Polly voices*/
// polly.describeVoices(function(err, data) {
//   if (err) console.log(err); // an error occurred
//   else     console.log(data);
// });

let textToConvert = fs.readFileSync('concatenatedReports.txt', 'utf8', function (err, data) {
  if (err) console.log(err);
  else {
    return data;
  }
});

console.log("Text to be converted >> \n" +  textToConvert);

let params = {
  OutputFormat: "mp3",
  Text: textToConvert,
  TextType: "text",
  VoiceId: "Matthew"
 };

let saveAudioFile = function(err, data) {
  if (err) console.log(err);
  else {
    fs.writeFile("audio1.mp3", data.AudioStream, function(err) {
        if(err) console.log(err);
        else {
            console.log("Audio file saved: audio1.mp3");
        }
    });
  }
}

/* convert text in params to speech and save the audio file*/
//polly.synthesizeSpeech(params, saveAudioFile);

/* convert text with SSML tags to audio */

let textToConvertSSML = fs.readFileSync('concatenatedReportsSSML.txt', 'utf8', function (err, data) {
  if (err) console.log(err);
  else {
    return data;
  }
});

console.log("Text to be converted >> \n" +  textToConvertSSML);

let paramsSSML = {
  OutputFormat: "mp3",
  Text: "textToConvertSSML",
  TextType: "ssml",
  VoiceId: "Matthew"
 };

let saveAudioFileSSML = function(err, data) {
  if (err) console.log(err);
  else {
    fs.writeFile("audioSSML.mp3", data.AudioStream, function(err) {
        if(err) console.log(err);
        else {
            console.log("Audio file saved: audioSSML.mp3");
        }
    });
  }
}

/* convert text in params to speech and save the audio file*/
polly.synthesizeSpeech(paramsSSML, saveAudioFileSSML);

// let paramsForSpeechMarks = {
//   OutputFormat: "json",
//   Text: textToConvert,
//   TextType: "text",
//   VoiceId: "Matthew",
//   SpeechMarkTypes: ["sentence"]
//  };
//
// let displaySpeechMarks = function(err, data) {
//   if (err) console.log(err);
//   else {
//     console.log(data.AudioStream.toString('utf-8'));
//   }
// }
//
// /* get speech marks metadata for converted text */
// polly.synthesizeSpeech(paramsForSpeechMarks, displaySpeechMarks);
