// Test Supabase Connection
// Run this to verify if Supabase is properly connected

import { supabase, testSupabaseConnection } from './src/services/supabaseClient.js';

console.log('🔍 Testing Supabase Connection...\n');

// Test 1: Check if client is initialized
console.log('1️⃣ Checking Supabase client initialization...');
if (supabase) {
    console.log('   ✅ Supabase client initialized');
    console.log('   📍 URL:', supabase.supabaseUrl);
} else {
    console.log('   ❌ Supabase client not initialized');
    process.exit(1);
}

// Test 2: Check environment variables
console.log('\n2️⃣ Checking environment variables...');
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (anonKey && anonKey !== 'your_anon_key_here') {
    console.log('   ✅ VITE_SUPABASE_ANON_KEY is set');
    console.log('   🔑 Key:', anonKey.substring(0, 20) + '...');
} else {
    console.log('   ❌ VITE_SUPABASE_ANON_KEY not set or invalid');
    process.exit(1);
}

// Test 3: Test connection to Supabase
console.log('\n3️⃣ Testing connection to Supabase...');
try {
    const isConnected = await testSupabaseConnection();
    
    if (isConnected) {
        console.log('   ✅ Successfully connected to Supabase!');
    } else {
        console.log('   ⚠️  Connection test failed - tables might not exist yet');
        console.log('   💡 Run the SQL migration script in Supabase SQL Editor');
    }
} catch (error) {
    console.log('   ❌ Connection error:', error.message);
}

// Test 4: Check if tables exist
console.log('\n4️⃣ Checking if analytics tables exist...');
try {
    // Check activity_logs table
    const { data: logsData, error: logsError } = await supabase
        .from('activity_logs')
        .select('count')
        .limit(1);
    
    if (!logsError) {
        console.log('   ✅ activity_logs table exists');
    } else {
        console.log('   ❌ activity_logs table not found');
        console.log('   💡 Error:', logsError.message);
    }

    // Check active_sessions table
    const { data: sessionsData, error: sessionsError } = await supabase
        .from('active_sessions')
        .select('count')
        .limit(1);
    
    if (!sessionsError) {
        console.log('   ✅ active_sessions table exists');
    } else {
        console.log('   ❌ active_sessions table not found');
        console.log('   💡 Error:', sessionsError.message);
    }
} catch (error) {
    console.log('   ❌ Error checking tables:', error.message);
}

// Test 5: Try to insert a test record
console.log('\n5️⃣ Testing write permissions...');
try {
    const testRecord = {
        id: `test_${Date.now()}`,
        type: 'login',
        user_email: 'test@admac.com',
        user_name: 'Test User',
        user_type: 'admin',
        country: 'Brasil',
        state: 'São Paulo',
        city: 'São Paulo',
        district: 'Centro',
        browser: 'Chrome',
        platform: 'Win32',
        language: 'pt-BR',
        timestamp: new Date().toISOString(),
        session_id: `test_session_${Date.now()}`
    };

    const { data, error } = await supabase
        .from('activity_logs')
        .insert([testRecord])
        .select();

    if (!error) {
        console.log('   ✅ Successfully inserted test record');
        console.log('   📝 Record ID:', data[0].id);
        
        // Clean up test record
        await supabase.from('activity_logs').delete().eq('id', testRecord.id);
        console.log('   🧹 Test record cleaned up');
    } else {
        console.log('   ❌ Failed to insert test record');
        console.log('   💡 Error:', error.message);
    }
} catch (error) {
    console.log('   ❌ Write test error:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('🎉 Connection test complete!');
console.log('='.repeat(50));
