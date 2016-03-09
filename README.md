****USEFUL LINKS****

AdModule API:
http://docs.brightcove.com/en/video-cloud/smart-player-api/references/symbols/brightcove.api.modules.AdModule.html

Code Snippet at bottom for ad monitoring:
https://docs.brightcove.com/en/video-cloud/smart-player-api/samples/set-ad-policy.html



****PROBLEMS****

1. WHY IS THE VAST TAG EMPTY?
- this might be why we are getting no ads appearing.

Request: vmm.ashx?mt=1&xf=12&pid=13923&ap=0&rand=1925567442&refUrl=http://localhost/ADF/index.html HTTP/1.1
Returns: <?xml version="1.0" encoding="utf-8"?>
<VAST version="2.0" />



2. WHY DOES onTemplateLoad not load & onTemplateReady load twice?

