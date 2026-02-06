
import { api } from './api';
import { supabase } from './supabase';

/**
 * Migration Utility
 * Moves messages from LocalStorage to Supabase
 * Invoke manually from console: `import { migrateMessages } from './services/migration'; migrateMessages();`
 */
export const migrateMessages = async () => {
  console.log("Starting Migration...");
  
  const raw = localStorage.getItem('evowell_messages');
  if (!raw) return console.log("No local messages found.");

  const localMessages = JSON.parse(raw);
  console.log(`Found ${localMessages.length} messages.`);

  // 1. Identify Unique Threads (Room IDs)
  // Format: thread-ID1-ID2 or thread-ID1-system
  const threads = new Set<string>();
  localMessages.forEach((m: any) => threads.add(m.roomId));

  for (const roomId of threads) {
    // Parse participants from roomId
    const parts = roomId.replace('thread-', '').split('-');
    // This is tricky because IDs might contain dashes.
    // However, our seed IDs are simple (u-prov-001). 
    // Standard format was sorting IDs.
    // If parsing fails, we skip.
    
    // Attempt to extract IDs. 
    // Assuming format: thread-[ID1]-[ID2] sorted.
    // But IDs like 'u-prov-001' have dashes.
    // The sorting in `ProviderSupport` was `[user.id, 'system'].sort().join('-')`
    // So 'system' and 'u-prov-001' becomes 'system-u-prov-001'
    
    let p1 = '', p2 = '';
    
    if (roomId.includes('system')) {
        p1 = roomId.replace('system-', '').replace('-system', ''); // extract the other ID
        // Assign p2 to a known admin ID or placeholder
        // For migration, we might need to fetch a real admin ID from Supabase
        const { data: admin } = await supabase.from('users').select('id').eq('role', 'ADMIN').limit(1).single();
        if (admin) p2 = admin.id;
        else {
            console.warn(`Skipping thread ${roomId}: No admin found in DB.`);
            continue;
        }
    } else {
        // Try to split. This relies on knowledge of ID format.
        // If IDs are u-prov-001 (10 chars), we can try to guess.
        // For this MVP migration, let's assume we can't easily parse complex IDs 
        // without a robust separator.
        console.warn(`Skipping peer thread ${roomId}: ID parsing requires specific logic.`);
        continue;
    }

    if (!p1 || !p2) continue;

    console.log(`Migrating thread between ${p1} and ${p2}...`);

    try {
        // Create Conversation in Supabase
        const conversation = await api.getOrCreateConversation(p1, p2);
        
        // Filter messages for this room
        const threadMsgs = localMessages.filter((m: any) => m.roomId === roomId);

        for (const msg of threadMsgs) {
            // Insert Message
            await supabase.from('messages').insert({
                conversation_id: conversation.id,
                sender_id: msg.senderId === 'system' ? p2 : p1, // Map 'system' to admin ID
                receiver_id: msg.senderId === 'system' ? p1 : p2,
                content: msg.text,
                is_read: msg.read,
                created_at: msg.timestamp
            });
        }
        console.log(`Migrated ${threadMsgs.length} messages.`);
    } catch (err) {
        console.error(`Failed to migrate thread ${roomId}`, err);
    }
  }

  console.log("Migration Complete.");
};
