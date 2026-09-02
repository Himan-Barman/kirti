require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const { data, error } = await supabase.from('pandals').select(`
    id, name,
    pandal_locations ( address, city, latitude, longitude, zones ( name ) ),
    pandal_images ( public_url, is_primary )
  `).limit(1);
  
  if (error) console.error("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

test();
