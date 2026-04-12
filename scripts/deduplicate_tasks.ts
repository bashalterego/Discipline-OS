import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
        const toDelete: string[] = [];

        for (const task of tasks) {
            if (seen.has(task.name)) {
                toDelete.push(task.id);
            } else {
                seen.add(task.name);
            }
        }

        if (toDelete.length > 0) {
            console.log(`Deleting ${toDelete.length} duplicates for ${user.email}...`);
            await supabase.from('tasks').delete().in('id', toDelete);
        }
    }
    console.log('Deduplication complete.');
}

deduplicate();
