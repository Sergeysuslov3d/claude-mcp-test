// Named places on the community map of Leonida. Coordinates are in the 1386x2000 map space.
// tier 1 = always labelled, 2 = appears when zoomed in, 3 = appears when zoomed in a lot.
// official:true = region named by Rockstar; the rest are names taken from the community map and may change.
window.PLACES = (function(){
  const K={
    city:'City', town:'Town', beach:'Beach', key:'Key (island)', peak:'Peak', park:'National park', forest:'Forest', swamp:'Wetland', lake:'Lake',
    airport:'Airport', landmark:'Landmark', water:'Waters', district:'District', bay:'Bay', island:'Island'
  };
  const P=(name,x,y,tier,kind,text,official)=>({name,x,y,tier,kind,kindLabel:K[kind],text:text||'Named on the community map. Details are not confirmed yet.',official:!!official});
  const list=[
    // ---- official regions ----
    P('Vice City',1040,1170,1,'city','The glamorous, hustle-driven heart of the state, called the sun and fun capital of America.',true),
    P('Leonida Keys',560,1930,1,'key','A tropical island chain with laid-back bars and dangerous waters beyond the yachts.',true),
    P('The Grassrivers',655,1690,1,'swamp','Everglades-inspired wetlands with alligators and flamingos, and deadlier predators in the mangroves.',true),
    P('Port Gellhorn',400,815,1,'town','A rundown coastal area of cheap motels and empty strip malls.',true),
    P('Ambrosia',800,870,1,'town','Industrial land centered on a sugar refinery and a local biker gang.',true),
    P('Mount Kalaga National Park',680,400,1,'park','A national landmark on the northern border: hunting, fishing, off-road trails and off-grid residents.',true),
    // ---- north ----
    P('Sundown',855,112,1,'town'), P('Sundown Beach',1135,150,2,'beach'), P('Northern Swamps',430,262,2,'swamp'),
    P('Mt. Kalaga',775,323,2,'peak','The tallest peak in Mount Kalaga National Park on the community map.'),
    P('Redhill Forests',880,450,3,'forest'), P('Redhill',780,495,3,'town'),
    P('Mt. Mountain',715,577,3,'peak'), P('Mt. Waffles',598,642,3,'peak'), P('Mt. Leonida',915,596,3,'peak'), P('Ambrosia Hill',748,681,3,'peak'),
    P('S.E.R.A. Station',1283,462,2,'landmark'), P('St. Joseph',1180,676,3,'town'),
    P('Lannahachee Strait',440,150,1,'water'),
    // ---- middle ----
    P('Lake Leonida',945,775,1,'lake','The big lake in the middle of the state.'),
    P('Allied Crystal Sugar Refinery',830,905,3,'landmark','The refinery that provides local jobs in Ambrosia.'),
    P('Gellhorn Bluff',603,950,3,'peak'), P('The Forgotten Coast',345,1000,2,'district'),
    P('Leonida Cypress Natural Reserve',730,1110,2,'swamp'),
    // ---- west ----
    P('Port Gellhorn Beach',165,625,2,'beach'), P('Draper Island',490,712,3,'island'), P('Starlet Motel',385,780,3,'landmark','A neon-lit motel on the Port Gellhorn strip.'),
    P('Seaview',420,1375,2,'town'),
    // ---- east / Vice City ----
    P('Waning Sands',1253,860,2,'beach'), P('Northern Beaches',1330,990,3,'beach'), P('Washington Beach',1360,1128,3,'beach'),
    P('Vice Beach',1295,1160,1,'beach','The barrier-island beach strip east of Vice City.'),
    P('Ocean Beach',1355,1247,2,'beach','White-sand beaches and pastel art deco buildings.'),
    P('Downtown',1075,1285,2,'district','The dense core of Vice City.'),
    P('Little Cube',1000,1130,3,'district','A bustling neighborhood known for its bakeries.'),
    P('Bayside',1127,1247,3,'district'), P('Port Vice City',1190,1322,3,'district'),
    P('Tequesta Key',1120,1325,3,'key'), P('Virgin Key',1252,1453,3,'key'), P('Catalan Key',1140,1505,3,'key'), P('Shark Island',1335,1405,3,'island'),
    P('Peacock Bay',1020,1470,3,'bay'),
    P('Vice City International Airport',865,1295,2,'airport','The big international airport west of Vice City.'),
    // ---- south ----
    P('Hamlet',822,1585,2,'town'), P('Watson Bay',637,1597,2,'bay'),
    P('Sunset Key',320,1912,1,'key'), P('Airstrike Key',498,1952,2,'key'), P('Gator Key',690,1985,2,'key'), P('Key Lento',915,1885,2,'key')
  ];
  // nearest of the eight listening spots
  const spots=[[1010,1130],[1060,1230],[1300,1180],[330,1900],[640,1690],[370,800],[840,880],[700,390]];
  list.forEach(p=>{ let best=0,bd=1e12; spots.forEach((s,i)=>{ const d=(s[0]-p.x)**2+(s[1]-p.y)**2; if(d<bd){bd=d;best=i;} }); p.near=best; });
  return list;
})();
