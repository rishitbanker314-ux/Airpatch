const admin = require('firebase-admin');

// Ensure we initialize the app properly
admin.initializeApp({ projectId: 'airpatch-b750a' });
const db = admin.firestore();

const rawData = `
[HS_001] Ghazipur Landfill
Type: Garbage Hotspot | Severity: Critical
Coordinates: 28.6256, 77.3259
Description: One of the largest garbage dumps in India, frequently experiencing landfill fires that contribute to air pollution.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcTI8UWxbDav5k-Kb8yxqUezjWv3-2rdFwcEXn1XrnhyIP1E2UkazmAybRX-s7JkUgs0JF7bUZXYA5C-ZZ4
------------------------------------------------------------------------

[HS_002] Anand Vihar ISBT
Type: Air Pollution Hotspot | Severity: Critical
Coordinates: 28.6469, 77.316
Description: A major transport hub causing severe vehicular emissions and dust, consistently recording some of the highest PM2.5 and PM10 levels in the city.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcTAXlUkhqRLPg3hptp9070S8gQrNOZt82J8W2gu2o0r3MjUNhIawNw7mN7WqfKW25z-0iuqL-_iqQh-qtw
------------------------------------------------------------------------

[HS_003] Bhalswa Landfill
Type: Garbage Hotspot | Severity: High
Coordinates: 28.7408, 77.1633
Description: Massive un-engineered dumping ground affecting local groundwater and causing foul odors for surrounding neighborhoods.
Image URL: https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcQE0aEz69aMRZZiQJiYzN_ls-OQ7SAchJz_lOdHjkZmMl28-Vrvq849OJkkpFqnUsnVASeqDpjsc9LsyYo
------------------------------------------------------------------------

[HS_004] Bawana Industrial Area
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.7997, 77.0425
Description: Industrial emissions, unauthorized plastic burning, and factory waste contribute heavily to local air toxicity.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcSEAw7BOmcADGzTJ3bULRTFRCMwQ0DuPbzE9ZJJ4Xn5sY5-s7QcOkeP2qv1gDVAJ02EVGMm_7UIZvNrMts
------------------------------------------------------------------------

[HS_005] Okhla Landfill Site
Type: Garbage Hotspot | Severity: High
Coordinates: 28.5147, 77.2872
Description: Over-capacitated waste site in South Delhi currently undergoing bioremediation.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcTyklHfaCIX6FJQiEnhg97E2ck6gu6jKw4re6nlngNSXrNrdcO_SgOl2CLNyN3Am4QOb1z8Qb33EVKT-RY
------------------------------------------------------------------------

[HS_006] Local Street GV Point (Example)
Type: Garbage Hotspot | Severity: Medium
Coordinates: 28.6231, 77.2889
Description: A typical 'Garbage Vulnerable Point' (Dhalao) where localized neighborhood dumping occurs outside designated zones.
Image URL: https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcRHwK8gwfqcjTwDhzxwlnD0VNBDu-Yk5Tp30aUGs3gn84liXdgOL9H5RCGge2Z5EF3w5O9rPWIRHMQf4FI
------------------------------------------------------------------------

[HS_007] Mundka Industrial Area
Type: Air Pollution Hotspot | Severity: Critical
Coordinates: 28.6792, 77.027
Description: Notorious for illegal plastic and rubber burning, generating dense, toxic black smoke that severely impacts local air quality.
Image URL: https://static.toiimg.com/thumb/msid-66612390,width-1280,height-720,imgsize-29982,resizemode-72,overlay-toi_sw,pt-32,y_pad-40/photo.jpg
------------------------------------------------------------------------

[HS_008] Yamuna River Bank (Kalindi Kunj)
Type: Water & Solid Waste Hotspot | Severity: Critical
Coordinates: 28.5442, 77.3023
Description: Industrial effluent and untreated sewage cause massive toxic foam generation, exacerbated by solid waste dumped directly onto the riverbanks.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcTeZC0CRYSuwRCoxiFfriWqpYcIhGWgWBKlqNi32g9YncRgYgfM85T_XqYiTGPJUAHDqchZrGYbnEZGwgc
------------------------------------------------------------------------

[HS_009] Seelampur E-Waste Hub
Type: Hazardous Waste Hotspot | Severity: High
Coordinates: 28.664, 77.2713
Description: One of India's largest informal e-waste dismantling markets. Crude extraction methods like acid baths and open wire burning heavily contaminate the soil and air.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcQ1v_GP6tPXJXJc15q89zZxIeSlUGie00CyO51-Krow1vW5hSV70kDrBru3Y1FQ7cOZ8grEUCnwBd_YlW0
------------------------------------------------------------------------

[HS_010] ITO Intersection
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.6291, 77.2415
Description: One of the busiest traffic bottlenecks in central Delhi, creating a localized micro-climate of extremely high vehicular exhaust and PM2.5 concentration.
Image URL: https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcTRKee_eun6LSrDfYQ5dg45F4lQYMaTYblU4qG0QDBe7VTS-s-XoKiLkRa8ytwNXB_0ZroTrS8eHotrLz4
------------------------------------------------------------------------

[HS_011] Jahangirpuri Garbage Dumps
Type: Garbage Hotspot | Severity: Medium
Coordinates: 28.7265, 77.1656
Description: Characterized by unregulated municipal solid waste dumping in residential periphery areas, posing severe hygiene and health risks.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQKYNPz-8EhcTck9SyZXANz03sVcHiuTU2msdxJ1x2IqAPrtOLjiMuAcBrajRJXtc_oh69kXkBzVeF3S7Y
------------------------------------------------------------------------

[HS_012] Punjabi Bagh Intersection
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.6666, 77.1352
Description: A major traffic artery where heavy commercial vehicles and constant idling create massive spikes in Nitrogen Dioxide (NO2) and PM2.5.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcR9d7yXdHFHYbtFtt-a7_YYFEqaucxeU-ea54lydV2e6Zz8PBb9YyhYBiZBz2d-_dzihGiFu9HPCTXEhY4
------------------------------------------------------------------------

[HS_013] Narela Industrial Estate
Type: Air & Solid Waste Hotspot | Severity: Critical
Coordinates: 28.8427, 77.0945
Description: Dense clusters of factories combined with widespread illegal burning of industrial waste and plastic make this a severe peripheral pollution zone.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQ8BVylU4Wu1qvo_M8tjOChyX35OhSEPpSoWIq_kZvvNUMuG1mWosyAyxOxK508v4sQSfDg6WaY0_x-aEw
------------------------------------------------------------------------

[HS_014] Dwarka (Sector 8 & Periphery)
Type: Air Pollution (Dust) Hotspot | Severity: Medium
Coordinates: 28.571, 77.0718
Description: Rapid, unmanaged construction and improper disposal of Construction and Demolition (C&D) waste cause localized dust storms and high PM10 levels.
Image URL: https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcRmY7LZB3Ckst5n9_jBuC34n-cLXlqTp3qLE2UHYeAAWSwgK-Z3o8vi0W_Gda2zDC7d1-UgunRZh7FzBRo
------------------------------------------------------------------------

[HS_015] Mayapuri Industrial Area
Type: Hazardous & Air Pollution Hotspot | Severity: Critical
Coordinates: 28.631, 77.1264
Description: India's largest scrap market. Unregulated metal cutting, smelting, and burning of rubber/wires release highly toxic fumes and heavy metals into the air.
Image URL: https://static.toiimg.com/thumb/msid-123444045,width-1280,height-720,resizemode-72/123444045.jpg
------------------------------------------------------------------------

[HS_016] R K Puram
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.5658, 77.1732
Description: Despite being residential, its location near major arterial roads like the Ring Road causes winter inversion layers to trap extreme vehicle exhaust.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcQEztCGm7aJ4-lB3fEI-g-P9JkCSTYZPDY2-3P-yzRCFRr0ETdTDMHeb_A2454BqWnhqv_9vCaLWylRdjA
------------------------------------------------------------------------

[HS_017] Wazirpur Industrial Area
Type: Air & Water Pollution Hotspot | Severity: Critical
Coordinates: 28.6975, 77.1639
Description: Known for steel pickling units. Both the air quality (from industrial emissions) and localized water runoff are severely contaminated with acids and heavy metals.
Image URL: https://thepatriot.in/wp-content/uploads/2024/01/Fire-scaled.jpg
------------------------------------------------------------------------

[HS_018] Najafgarh Drain (Basin)
Type: Water & Garbage Hotspot | Severity: Critical
Coordinates: 28.6255, 76.9839
Description: One of the most polluted waterways in Delhi. Widespread dumping of raw sewage and unsegregated solid waste creates a massive health hazard and methane emissions.
Image URL: https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcT3yFzfHgLJt3HA_8SsyRus38RcH3dHXJ1rvbpREPQJEXvnOiNU_j5tyEjTR3bd4TfASIS_EjIC0cIHZYE
------------------------------------------------------------------------

[HS_019] Sonia Vihar
Type: Garbage & Air Pollution Hotspot | Severity: Medium
Coordinates: 28.736, 77.26
Description: Frequent illegal dumping of municipal waste and subsequent localized burning creates intense, highly localized air pollution spikes for nearby residents.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQv5JpDWz4HuXIvCk58Q4NJJOTYONuAwpOtsSVfnskwFrZDtQ5MmbP52jabujsr3_85J3e9gmFdQj3SrNQ
------------------------------------------------------------------------

[HS_020] Ashok Vihar
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.6938, 77.182
Description: Consistently ranks among the top 13 pollution hotspots identified by the CPCB due to a mix of traffic bottleneck emissions and proximity to industrial zones.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQeJAGX0F46E1BmwXbvjnxRJvWnSynXJHxOmGsmd1g3jFxvcTKVd9zfwYaSwS8pG3w_N8vhcp9dgqbpH9s
------------------------------------------------------------------------

[HS_021] Burari Bypass Solid Waste Site
Type: Garbage Hotspot | Severity: High
Coordinates: 28.741, 77.195
Description: An open dumping ground for mixed municipal waste; local fires frequently ignite during summer months, leading to toxic fumes.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcQwc5qEXRbRbEAl00lQbDPQtNOGSYI-TScE1RSF0PaSSakmGBT8G8JBCOIQek9zQyEnU2Joxynni9JYhAM
------------------------------------------------------------------------

[HS_022] Mandoli Industrial Area
Type: Air Pollution Hotspot | Severity: Critical
Coordinates: 28.7061, 77.306
Description: Known for heavy industrial manufacturing, including metal casting and wire drawing, contributing to substantial particulate matter pollution.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQ6dS5OM3zzUXtxNNjv-b0SOZSJlD-5kKwfHtJt-j9_m80X14UsFHsR-73VhSVnvBvWFt-j_EUASdNfBn4
------------------------------------------------------------------------

[HS_023] Shahdara Drain
Type: Water & Solid Waste Hotspot | Severity: Critical
Coordinates: 28.6728, 77.3022
Description: A major open storm water drain heavily choked with unsegregated domestic and industrial waste, acting as a massive breeding ground for disease.
Image URL: https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcTPmuY17XfJpkzLN-KhOsw3i9FRDLW3y_BYrDJ8FXIeu3HTPOMMY5S4rq61zP83d7L_mYb8zzsL-vPoZsc
------------------------------------------------------------------------

[HS_024] Nizamuddin Traffic Junction
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.5888, 77.2472
Description: Extremely high traffic volume mixed with nearby railway emissions creates a persistent smog layer over the area, especially in winter.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcTHmiHATc0m16X-jHzPDs4jsSOC3WcZLQ55BFFoAbod-rNcDUoXc16E8a0tn03XwkjU6XinhjQNvTmmMC0
------------------------------------------------------------------------

[HS_025] Patparganj Industrial Estate
Type: Air Pollution Hotspot | Severity: Medium
Coordinates: 28.636, 77.309
Description: Surrounded by residential clusters, emissions from printing presses, packaging industries, and diesel generators cause severe local air quality drops.
Image URL: https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcQsWjATaTDIvWeX8kT5NVPwk5y_uHqH0l-Szzvn9F---eUyzqyNn5BxczaRWSwyH1R_Zj-HzwsGYxE-XIo
------------------------------------------------------------------------

[HS_026] Kirti Nagar Timber/Furniture Market
Type: Air & Solid Waste Hotspot | Severity: High
Coordinates: 28.6475, 77.142
Description: Asia's largest furniture market generates immense amounts of sawdust (PM10) and chemical fumes from varnishes and paints, alongside scrap wood burning.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcTyhWwdLIkYLnyek-WcF6nsRDz-ImDogVRszHkKneTNgA1ypvcv2RTLCD0GsASS0XYJmxKbY7gkD9kI_8U
------------------------------------------------------------------------

[HS_027] Okhla Phase 3 Industrial Area
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.5355, 77.265
Description: High density of garment and manufacturing factories. Emissions from unregulated boiler units and vehicular congestion are major issues.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcRTepCpwD2Y4mzeb6r-0pJbGwVo8xjoWpHbAIn5chQCKBPVE2cUruEeu3kMH5LaPWxv8_WUCB4uyYGETV8
------------------------------------------------------------------------

[HS_028] Siri Fort Road Smog Zone
Type: Air Pollution Hotspot | Severity: Medium
Coordinates: 28.549, 77.219
Description: A typical South Delhi high-traffic corridor where slow-moving vehicle exhaust gets trapped by dense tree canopies during winter inversions.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQ_HCE76im-YF6OJX1MMUCBpV8SGmA8WYLuqP4O8hzO6Pvyn-bgg2VJm9kRQKQnwDzG-8GN5DnqzYWD4J8
------------------------------------------------------------------------

[HS_029] Alipur Outskirts Dump
Type: Garbage & Air Pollution Hotspot | Severity: High
Coordinates: 28.799, 77.135
Description: A peripheral rural-urban fringe area suffering from illegal dumping of municipal solid waste, which is frequently set on fire to reduce volume.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcS-ytfiG0JcnoMILb5UpBOGrxfTTCJ18j_rcrNfKkgD2iz_kf63OXNKXeG7pSy_1qG958aem_iBAFzGTtQ
------------------------------------------------------------------------

[HS_030] Rohini Sector 16 C&D Dump
Type: Air Pollution (Dust) Hotspot | Severity: Medium
Coordinates: 28.739, 77.1265
Description: Illegal dumping ground for Construction and Demolition (C&D) waste. Heavy machinery and wind turn this into a major source of PM10 dust pollution.
Image URL: https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcRmY7LZB3Ckst5n9_jBuC34n-cLXlqTp3qLE2UHYeAAWSwgK-Z3o8vi0W_Gda2zDC7d1-UgunRZh7FzBRo
------------------------------------------------------------------------

[HS_031] Kashmere Gate ISBT
Type: Air Pollution Hotspot | Severity: Critical
Coordinates: 28.6672, 77.2285
Description: Massive interstate bus terminal. The constant idling of heavy diesel buses creates a highly concentrated zone of nitrogen oxides and black carbon.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcTAXlUkhqRLPg3hptp9070S8gQrNOZt82J8W2gu2o0r3MjUNhIawNw7mN7WqfKW25z-0iuqL-_iqQh-qtw
------------------------------------------------------------------------

[HS_032] Peera Garhi Chowk
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.678, 77.0925
Description: A notorious traffic bottleneck on the Outer Ring Road. Vehicles crawling through this junction create extreme localized spikes in PM2.5 emissions.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcR9d7yXdHFHYbtFtt-a7_YYFEqaucxeU-ea54lydV2e6Zz8PBb9YyhYBiZBz2d-_dzihGiFu9HPCTXEhY4
------------------------------------------------------------------------

[HS_033] Mustafabad E-Waste and Scrap
Type: Hazardous Waste & Air Hotspot | Severity: Critical
Coordinates: 28.715, 77.2725
Description: Similar to Seelampur, this area has numerous informal units recovering metals from e-waste through open burning of plastics and wires.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcQ1v_GP6tPXJXJc15q89zZxIeSlUGie00CyO51-Krow1vW5hSV70kDrBru3Y1FQ7cOZ8grEUCnwBd_YlW0
------------------------------------------------------------------------

[HS_034] Sanjay Gandhi Transport Nagar
Type: Air Pollution Hotspot | Severity: Critical
Coordinates: 28.7455, 77.155
Description: One of the largest trucking hubs in Asia. Dust from unpaved roads and emissions from thousands of diesel trucks make the air highly toxic.
Image URL: https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcSEAw7BOmcADGzTJ3bULRTFRCMwQ0DuPbzE9ZJJ4Xn5sY5-s7QcOkeP2qv1gDVAJ02EVGMm_7UIZvNrMts
------------------------------------------------------------------------

[HS_035] Okhla Sewage Treatment Plant Outfall
Type: Water & Methane Hotspot | Severity: High
Coordinates: 28.5475, 77.291
Description: Areas where partially treated or untreated sewage enters the Yamuna, causing massive foaming and releasing high levels of methane and hydrogen sulfide.
Image URL: https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcTeZC0CRYSuwRCoxiFfriWqpYcIhGWgWBKlqNi32g9YncRgYgfM85T_XqYiTGPJUAHDqchZrGYbnEZGwgc
------------------------------------------------------------------------

[HS_036] Tikri Kalan Plastic Waste Zone
Type: Garbage & Air Pollution Hotspot | Severity: Critical
Coordinates: 28.675, 76.975
Description: An area on the outskirts where massive quantities of PVC and plastic waste are sorted, and non-recyclables are frequently burnt openly.
Image URL: https://static.toiimg.com/thumb/msid-66612390,width-1280,height-720,imgsize-29982,resizemode-72,overlay-toi_sw,pt-32,y_pad-40/photo.jpg
------------------------------------------------------------------------

[HS_037] Barapullah Elevated Corridor
Type: Air Pollution Hotspot | Severity: High
Coordinates: 28.5865, 77.2405
Description: The corridor concentrates vehicular exhaust high above ground level, which then settles over the densely populated neighborhoods bordering the drain.
Image URL: https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcTRKee_eun6LSrDfYQ5dg45F4lQYMaTYblU4qG0QDBe7VTS-s-XoKiLkRa8ytwNXB_0ZroTrS8eHotrLz4
------------------------------------------------------------------------

[HS_038] Sadar Bazar Congestion Zone
Type: Air & Solid Waste Hotspot | Severity: High
Coordinates: 28.6535, 77.2085
Description: Extremely dense commercial market. Slow-moving traffic, heavy reliance on diesel generators during power cuts, and massive packaging waste generation.
Image URL: https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcRHwK8gwfqcjTwDhzxwlnD0VNBDu-Yk5Tp30aUGs3gn84liXdgOL9H5RCGge2Z5EF3w5O9rPWIRHMQf4FI
------------------------------------------------------------------------

[HS_039] Naraina Industrial Area
Type: Air Pollution Hotspot | Severity: Medium
Coordinates: 28.63, 77.14
Description: Houses numerous small-scale factories. Frequent complaints of illegal emissions from unregulated boiler units during night-time operations.
Image URL: https://thepatriot.in/wp-content/uploads/2024/01/Fire-scaled.jpg
------------------------------------------------------------------------

[HS_040] Gokalpuri Open Drains
Type: Water & Garbage Hotspot | Severity: High
Coordinates: 28.705, 77.288
Description: A network of open drains in North East Delhi severely clogged with plastic and solid waste, leading to localized flooding and severe health hazards.
Image URL: https://encrypted-tbn3.gstatic.com/licensed-image?q=tbn:ANd9GcT3yFzfHgLJt3HA_8SsyRus38RcH3dHXJ1rvbpREPQJEXvnOiNU_j5tyEjTR3bd4TfASIS_EjIC0cIHZYE
`;

function parseData(raw) {
  const blocks = raw.split(/---+/).map(b => b.trim()).filter(b => b.length > 0 && b.includes('[HS_'));
  
  return blocks.map(block => {
    try {
      // Don't split by strict newline character, as there could be \\r\\n
      // Instead we use regex to extract each part reliably
      const idMatch = block.match(/\[(HS_\d+)\]\s*(.*)/);
      const customId = idMatch ? idMatch[1] : 'HS_UNKNOWN';
      const localityName = idMatch ? idMatch[2].trim() : 'Unknown Location';
      
      const typeMatch = block.match(/Type:\s*(.*?)\s*\|\s*Severity:\s*(.*)/);
      const rawType = typeMatch ? typeMatch[1] : '';
      const rawSeverity = typeMatch ? typeMatch[2] : '';
      
      let category = 'unpicked_waste';
      if (rawType.toLowerCase().includes('garbage') || rawType.toLowerCase().includes('solid waste')) category = 'unpicked_waste';
      if (rawType.toLowerCase().includes('air') || rawType.toLowerCase().includes('smoke')) category = 'industrial_smoke';
      if (rawType.toLowerCase().includes('dust')) category = 'construction_dust';
      if (rawType.toLowerCase().includes('water')) category = 'stagnant_water';
      
      let severityNum = 3;
      let riskBand = 'medium';
      let riskScore = 50;
      if (rawSeverity.toLowerCase().includes('critical')) { severityNum = 5; riskBand = 'critical'; riskScore = 90; }
      else if (rawSeverity.toLowerCase().includes('high')) { severityNum = 4; riskBand = 'high'; riskScore = 75; }
      else if (rawSeverity.toLowerCase().includes('medium')) { severityNum = 3; riskBand = 'medium'; riskScore = 50; }
      
      const coordMatch = block.match(/Coordinates:\s*([\d.]+),\s*([\d.]+)/);
      const lat = coordMatch ? parseFloat(coordMatch[1]) : 28.0;
      const lng = coordMatch ? parseFloat(coordMatch[2]) : 77.0;
      
      const descMatch = block.match(/Description:\s*(.*?)\n/);
      const description = descMatch ? descMatch[1].trim() : '';
      
      const imgMatch = block.match(/Image URL:\s*(https?:\/\/[^\s]+)/);
      const imageUrl = imgMatch ? imgMatch[1].trim() : '';
      
      return {
        customId,
        localityName,
        category,
        severityNum,
        riskBand,
        riskScore,
        lat,
        lng,
        description,
        imageUrl
      };
    } catch(e) {
      console.error('Failed to parse block:', block, e);
      return null;
    }
  }).filter(Boolean);
}

async function runSeeder() {
  console.log("Parsing data...");
  const items = parseData(rawData);
  console.log('Parsed ' + items.length + ' items.');
  
  let inserted = 0;
  for (const item of items) {
    // 1. Create a Report
    const reportRef = db.collection('reports').doc();
    
    // Simulate real report timestamps across the last 7 days
    const randomDaysAgo = Math.random() * 7;
    const createdAt = new Date(Date.now() - randomDaysAgo * 86400000);
    
    const reportData = {
      createdBy: 'anonymous',
      category: item.category,
      note: item.description, // using description as the note
      imageUrl: item.imageUrl,
      imagePath: 'dummy/path',
      location: {
        lat: item.lat,
        lng: item.lng,
        localityName: item.localityName
      },
      status: 'verified',
      aiStatus: 'completed',
      contextStatus: 'completed',
      aiVerification: {
        isPollutionEvent: true,
        predictedCategory: item.category,
        confidence: 0.95,
        severity: item.severityNum,
        reason: item.description.substring(0, 50) + '...'
      },
      createdAt: admin.firestore.Timestamp.fromDate(createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(createdAt)
    };
    
    await reportRef.set(reportData);
    
    // 2. Create the Hotspot
    const hotspotRef = db.collection('hotspots').doc();
    const hotspotData = {
      category: item.category,
      name: item.localityName,
      imageUrl: item.imageUrl,
      center: {
        lat: item.lat,
        lng: item.lng,
        localityName: item.localityName
      },
      status: 'active',
      reportIds: [reportRef.id],
      activeReportCount: 1, // Start with 1 so it feels realistic and organic
      totalReportCount: 1,
      avgSeverity: item.severityNum,
      risk: {
        riskScore: item.riskScore,
        riskBand: item.riskBand,
        summary: item.description,
        drivers: [item.localityName]
      },
      latestReportAt: admin.firestore.Timestamp.fromDate(createdAt),
      firstSeenAt: admin.firestore.Timestamp.fromDate(createdAt),
      updatedAt: admin.firestore.Timestamp.fromDate(createdAt)
    };
    
    await hotspotRef.set(hotspotData);
    
    // 3. Link Report to Hotspot
    await reportRef.update({ hotspotId: hotspotRef.id });
    
    inserted++;
  }
  
  console.log('Successfully injected ' + inserted + ' robust Delhi hotspots!');
  process.exit(0);
}

runSeeder().catch(console.error);
