const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'airpatch-b750a' });

async function run() {
  const db = admin.firestore();
  
  const hotspots = [
    {
      category: 'industrial_smoke',
      center: { lat: 28.644800, lng: 77.216721 }, // Paharganj area
      status: 'active',
      reportIds: ['R_dummy_1', 'R_dummy_2', 'R_dummy_3'],
      activeReportCount: 3,
      totalReportCount: 3,
      avgSeverity: 5,
      risk: { riskScore: 85, riskBand: 'critical', summary: 'Severe industrial emissions detected.', drivers: ['High severity'] },
      latestReportAt: new Date(),
      firstSeenAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date()
    },
    {
      category: 'construction_dust',
      center: { lat: 28.592140, lng: 77.225010 }, // Lodhi Colony
      status: 'active',
      reportIds: ['R_dummy_4', 'R_dummy_5'],
      activeReportCount: 2,
      totalReportCount: 2,
      avgSeverity: 3,
      risk: { riskScore: 60, riskBand: 'high', summary: 'Construction site generating continuous dust.', drivers: ['Sustained exposure'] },
      latestReportAt: new Date(Date.now() - 3600000), // 1 hour ago
      firstSeenAt: new Date(Date.now() - 172800000),
      updatedAt: new Date()
    },
    {
      category: 'unpicked_waste',
      center: { lat: 28.650000, lng: 77.230000 }, // Old Delhi
      status: 'active',
      reportIds: ['R_dummy_6'],
      activeReportCount: 1,
      totalReportCount: 1,
      avgSeverity: 4,
      risk: { riskScore: 45, riskBand: 'medium', summary: 'Illegal waste burning reported.', drivers: ['Toxic fumes'] },
      latestReportAt: new Date(Date.now() - 7200000), // 2 hours ago
      firstSeenAt: new Date(Date.now() - 7200000),
      updatedAt: new Date()
    },
    {
      category: 'stagnant_water',
      center: { lat: 28.535516, lng: 77.241020 }, // CR Park / Kalkaji
      status: 'active',
      reportIds: ['R_dummy_7', 'R_dummy_8', 'R_dummy_9', 'R_dummy_10'],
      activeReportCount: 4,
      totalReportCount: 4,
      avgSeverity: 2,
      risk: { riskScore: 35, riskBand: 'low', summary: 'Stagnant water posing vector-borne disease risk.', drivers: ['Volume of reports'] },
      latestReportAt: new Date(Date.now() - 14400000), // 4 hours ago
      firstSeenAt: new Date(Date.now() - 432000000),
      updatedAt: new Date()
    },
    {
      category: 'industrial_smoke',
      center: { lat: 28.520000, lng: 77.280000 }, // Okhla Industrial Area
      status: 'active',
      reportIds: ['R_dummy_11'],
      activeReportCount: 1,
      totalReportCount: 1,
      avgSeverity: 4,
      risk: { riskScore: 70, riskBand: 'high', summary: 'Heavy smoke from factory exhaust.', drivers: ['High severity'] },
      latestReportAt: new Date(Date.now() - 1800000), // 30 mins ago
      firstSeenAt: new Date(Date.now() - 1800000),
      updatedAt: new Date()
    }
  ];

  for (const h of hotspots) {
    await db.collection('hotspots').add(h);
  }
  
  console.log('Successfully injected 5 highly realistic hotspots with varied active counts!');
  process.exit(0);
}

run().catch(console.error);
