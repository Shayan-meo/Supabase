// 1. Installed NPM Package se Supabase import karein
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// 2. Apni Supabase Details (Dashboard -> Project Settings -> API se copy karein)
const SUPABASE_URL = 'https://nwtqkqjyhvfsgkihbdzv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_I8Aj7Pzg7iby1_oMm50D3A_b6LCrc0q';

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. Button Click Event Handle Karein
document.getElementById('submitBtn').addEventListener('click', async () => {
  // HTML Inputs se Values lena
  const name = document.getElementById('userName').value;
  const age = document.getElementById('userAge').value;
  const country = document.getElementById('userCountry').value;
  const email = document.getElementById('userEmail').value;

  const statusMsg = document.getElementById('statusMsg');

  // Basic Validation
  if (!name || !age || !country || !email) {
    statusMsg.style.color = 'red';
    statusMsg.innerText = 'Tamam fields bharna zaroori hain!';
    return;
  }

  statusMsg.style.color = 'blue';
  statusMsg.innerText = 'Data Supabase mein ja raha hai...';

  // 4. Supabase Table Mein Data Push Karna
  try {
    const { data, error } = await db
      .from('users') // Aapke table ka exact naam
      .insert([
        {
          name: name,
          age: Number(age),
          country: country,
          email: email
        }
      ])
      .select(); // Insert hui row wapas mangwane ke liye

    // Response Check
    if (error) {
      console.error('Supabase Error:', error);
      statusMsg.style.color = 'red';
      statusMsg.innerText = '❌ Error: ' + error.message;
      return;
    }

    console.log('Insert hui row:', data);
    statusMsg.style.color = 'green';
    statusMsg.innerText = '✅ Data Successfully Push Ho Gaya!';

    // Inputs Clear Karna
    document.getElementById('userName').value = '';
    document.getElementById('userAge').value = '';
    document.getElementById('userCountry').value = '';
    document.getElementById('userEmail').value = '';

  } catch (e) {
    // Network / CORS / code level errors yahan pakde jayenge
    console.error('Exception:', e);
    statusMsg.style.color = 'red';
    statusMsg.innerText = '❌ Exception: ' + e.message;
  }
});