# Research Podcast  - For Hackathon - CodeWeek 2018
-using Amazon Polly - Text to speech <br/>
-using Amazon Comprehend  - Text Analytics <br/>

<pre>~$ node --version
v8.10.0
</pre>

1. Install xmldom for parsing XML reports: npm install xmldom

2. Fetch code from github

3. Under TextToSpeech folder, create a new folder "Reports" and save the 5 research reports here. This is not uploaded because of licensing rules

4. Run report parser:
     node reportParser.js

This will parse all the 5 reports, extract and concatenate the summaries. Then all the acronyms will be removed and replaced with full words using acronymMap.json.
Then the summarized report text will be saved to concatenatedReports.txt

5. Run  TextToAudio to convert report summary to audio:
     node TextToAudio.js

This will generate audio1.mp3.

Also, ./credits.json is not present in git either. This is needed for connecting to AWS services.
