
// config/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gmflswlxghleuauuieis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZmxzd2x4Z2hsZXVhdXVpZWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MTQxMzgsImV4cCI6MjA2ODI5MDEzOH0.HCijwySIzbDa0-iNO_-mMSZp-ZMpKVE35YIDdnT_fdA';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
