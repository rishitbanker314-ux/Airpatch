const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'airpatch-b750a' });

async function run() {
  const db = admin.firestore();
  
  // Base coordinates for Ahmedabad (where the original ones were) and New Delhi
  const cities = [
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090 }
  ];
  
  const categories = ['unpicked_waste', 'construction_dust', 'industrial_smoke', 'stagnant_water'];
  const bands = ['low', 'medium', 'high', 'critical'];
  
  const hotspots = [];
  
  for (let i = 0; i < 20; i++) {
    // Randomize between the two cities
    const city = cities[i % 2];
    
    // Slight random offset to spread them out (~5km radius)
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;
    
    // For authenticity to the original ones they deleted, we'll give some of them '5' and '3'
    const counts = [5, 3, 2, 4, 1];
    const activeCount = counts[i % counts.length];
    
    const category = categories[i % categories.length];
    
    hotspots.push({
      category: category,
      center: { lat: city.lat + latOffset, lng: city.lng + lngOffset },
      status: 'active',
      reportIds: [],
      activeReportCount: activeCount,
      totalReportCount: activeCount,
      avgSeverity: Math.floor(Math.random() * 5) + 1,
      risk: { 
        riskScore: Math.floor(Math.random() * 100), 
        riskBand: bands[i % bands.length], 
        summary: `Simulated risk summary for ${category}.`,
        drivers: ['Simulated driver'] 
      },
      latestReportAt: new Date(Date.now() - Math.random() * 86400000),
      firstSeenAt: new Date(Date.now() - Math.random() * 864000000),
      updatedAt: new Date()
    });
  }

  for (const h of hotspots) {
    await db.collection('hotspots').add(h);
  }
  
  console.log(`Successfully injected 20 beautiful hotspots!`);
  process.exit(0);
}

run().catch(console.error);
