// Sky rectangles, daylight strength and cloud setup for every place (loaded after the scenes).
(function(){
  const META={
    apartment:  { sky:{x:160,y:44,w:236,h:106,horizon:154,sx0:12,sx1:224,arc:92}, relight:.72, clouds:{n:4,y0:2,y1:46,seed:3,speed:2} },
    downtown:   { sky:{x:0,y:0,w:480,h:122,horizon:128}, relight:1, clouds:{n:6,y0:4,y1:60,seed:5,speed:3} },
    beach:      { sky:{x:0,y:0,w:480,h:128,horizon:130}, relight:.5, clouds:{n:7,y0:6,y1:84,seed:7,speed:3} },
    keys:       { sky:{x:0,y:0,w:480,h:126,horizon:128}, relight:.45, clouds:{n:7,y0:6,y1:80,seed:9,speed:2.5} },
    grassrivers:{ sky:{x:0,y:0,w:480,h:118,horizon:122}, relight:.85, clouds:{n:5,y0:4,y1:60,seed:11,speed:2} },
    gellhorn:   { sky:{x:0,y:0,w:480,h:150,horizon:160}, relight:1, clouds:{n:6,y0:4,y1:90,seed:13,speed:3} },
    ambrosia:   { sky:{x:0,y:0,w:480,h:150,horizon:152}, relight:.5, clouds:{n:6,y0:6,y1:90,seed:15,speed:2.5} },
    kalaga:     { sky:{x:0,y:0,w:480,h:150,horizon:162}, relight:.95, clouds:{n:5,y0:6,y1:70,seed:17,speed:2},
                  skyStops:{ night:['#03051a','#081232','#122454','#1e3270','#2a3a78'], dusk:['#0a1036','#1a2058','#3a2a6a','#7a3a6a','#c0606a'] } }
  };

  const LIVE={
    apartment:{ water:[160,176,{clip:[160,396],spread:24,glints:14}],
      birds:{ clip:[160,44,236,132], fly:[{kind:'pigeon',y:62,n:3,every:23,speed:26,nightKind:'bat'},{kind:'gull',y:84,n:2,every:37,speed:18,dir:-1,night:false}] } },
    downtown:{ birds:{ fly:[{kind:'pigeon',y:36,n:5,every:21,speed:34,spread:14,nightKind:'bat'},{kind:'crow',y:22,n:2,every:47,speed:20,dir:-1,night:false}],
        perch:[{kind:'pigeon',x:60,y:127,night:false},{kind:'pigeon',x:242,y:127,every:33,night:false},{kind:'crow',x:424,y:127,every:41,night:false}] },
      npcs:[{kind:'walk',x0:0,x1:480,y:213,k:.44},{kind:'walk',x0:40,x1:440,y:213,k:.44,speed:7},{kind:'dogwalk',x0:20,x1:460,y:213,k:.44},{kind:'couple',x0:100,x1:380,y:213,k:.44,speed:6},
        {kind:'photo',x:352,y:213,k:.44},{kind:'music',x:126,y:213,k:.44},{kind:'cafe',x:56,y:213,k:.44},{kind:'skate',x0:0,x1:480,y:213,k:.42},{kind:'jog',x0:0,x1:480,y:213,k:.44}] },
    beach:{ water:[130,176,{spread:70}], air:{banner:58,text:'VICE BEACH'},
      birds:{ fly:[{kind:'gull',y:44,n:4,every:19,speed:24,spread:20},{kind:'pelican',y:72,n:5,every:43,speed:16,v:1,dir:-1,night:false}],
        perch:[{kind:'gull',x:300,y:152},{kind:'gull',x:394,y:152,every:35},{kind:'pelican',x:440,y:152,every:51,night:false}] },
      npcs:[{kind:'jog',x0:0,x1:480,y:219,k:.38},{kind:'skate',x0:0,x1:480,y:219,k:.36},{kind:'couple',x0:20,x1:460,y:219,k:.38,speed:6},
        {kind:'lie',x:236,y:242,k:.5},{kind:'lie',x:436,y:244,k:.5},{kind:'photo',x:302,y:234,k:.42},{kind:'music',x:180,y:236,k:.42},{kind:'walk',x0:30,x1:460,y:252,k:.46,speed:7}] },
    keys:{ water:[128,206,{spread:80,lights:[[372,'#ffb050'],[400,'#ffb050'],[428,'#ffb050']]}], air:{seaplane:150},
      birds:{ fly:[{kind:'pelican',y:60,n:5,every:37,speed:15,v:1,night:false},{kind:'gull',y:40,n:3,every:23,speed:22,dir:-1},{kind:'flamingo',y:92,n:6,every:71,speed:18,gap:12,night:false}],
        perch:[{kind:'gull',x:46,y:206},{kind:'pelican',x:192,y:206,every:46,night:false}] },
      npcs:[{kind:'fish',x:96,y:206,k:.4,line:30},{kind:'walk',x0:10,x1:220,y:206,k:.4,speed:6},{kind:'stand',x:214,y:206,k:.4}] },
    grassrivers:{ water:[124,200,{spread:40}],
      birds:{ fly:[{kind:'flamingo',y:62,n:6,every:41,speed:16,v:1,night:false},{kind:'egret',y:84,n:2,every:29,speed:20,dir:-1,night:false},{kind:'bat',y:50,n:3,every:17,speed:30,night:true}],
        perch:[{kind:'egret',x:408,y:124,nightKind:'owl'}] },
      npcs:[{kind:'fish',x:372,y:170,k:.3,line:22}] },
    gellhorn:{ birds:{ fly:[{kind:'crow',y:30,n:3,every:31,speed:22,nightKind:'bat'}], perch:[{kind:'crow',x:118,y:50,night:false},{kind:'crow',x:146,y:52,every:37,night:false},{kind:'pigeon',x:260,y:146,every:29,night:false}] },
      npcs:[{kind:'walk',x0:30,x1:320,y:200,k:.36,speed:5,indoor:true},{kind:'couple',x0:60,x1:300,y:200,k:.36,speed:4,indoor:true},{kind:'walk',x0:0,x1:480,y:252,k:.5,speed:8}] },
    ambrosia:{ birds:{ fly:[{kind:'hawk',y:46,n:1,every:29,speed:12},{kind:'crow',y:70,n:4,every:25,speed:20,dir:-1,nightKind:'bat'}], perch:[{kind:'crow',x:30,y:90,night:false}] },
      npcs:[{kind:'cyclist',x0:-30,x1:520,y:190,dir:-1,speed:22,s:1}] },
    kalaga:{ birds:{ fly:[{kind:'hawk',y:50,n:1,every:33,speed:10,night:false},{kind:'bat',y:80,n:3,every:15,speed:28,night:true}], perch:[{kind:'owl',x:450,y:178}] },
      npcs:[{kind:'music',x:284,y:252,k:.42},{kind:'stand',x:170,y:254,k:.44},{kind:'sit',x:206,y:254,k:.42}] }
  };
  SCENES.forEach(s=>{ const l=LIVE[s.id]; if(l) Object.assign(s,l); });
  SCENES.forEach(s=>{ const m=META[s.id]; if(m) Object.assign(s,m); if(!s.sky) s.sky={x:0,y:0,w:480,h:130,horizon:134}; });
})();
