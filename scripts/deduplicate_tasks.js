require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deduplicate() {
    console.log('Fetching all users...');
    const { data: users } = await supabase.from('users').select('id, email');

    if (!users) return;

    for (const user of users) {
        console.log(`Checking tasks for ${user.email}...`);
        const { data: tasks } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (!tasks) continue;

        const seen = new Set();
        const toDelete = [];

        for (const task of tasks) {
            const key = `${task.name.trim().toLowerCase()}`;
            if (seen.has(key)) {
                toDelete.push(task.id);
            } else {
                seen.add(key);
            }
        }

        if (toDelete.length > 0) {
            console.log(`Deleting ${toDelete.length} duplicates for ${user.email}...`);
            const { error } = await supabase.from('tasks').delete().in('id', toDelete);
            if (error) console.error('Delete error:', error);
        }
    }
    console.log('Deduplication complete.');
}

deduplicate();
