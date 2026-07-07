import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xaaijapxgbzvpfjhcbxa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYWlqYXB4Z2J6dnBmamhjYnhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTg0NzExOCwiZXhwIjoyMDk3NDIzMTE4fQ.4XtqA-xTMfYgGSmlCShR8qa9ykG8nfkpCsGgJ6nfy98'
);

async function run() {
  console.log("Fetching users...");
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) return console.error('List error:', listError);
  
  const testUser = users.users.find(u => u.email === 'test@ledger.ai');
  if (testUser) {
    console.log("Updating password...");
    const { data, error } = await supabase.auth.admin.updateUserById(testUser.id, { password: 'password123', email_confirm: true });
    if (error) console.error('Update error:', error);
    else console.log('Password updated successfully for test@ledger.ai');
  } else {
    console.log("Creating user...");
    const { data, error } = await supabase.auth.admin.createUser({ email: 'test@ledger.ai', password: 'password123', email_confirm: true });
    if (error) console.error('Create error:', error);
    else console.log('User created with password123');
  }
}
run();
