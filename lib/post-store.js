const { createClient } = require('@supabase/supabase-js');

let supabase;

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be configured.');
  }

  if (!supabase) {
    supabase = createClient(url, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabase;
}

function toPost(row) {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: row.created_at,
  };
}

const postStore = {
  async list() {
    const { data, error } = await getSupabaseClient()
      .from('posts')
      .select('id, name, message, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(toPost);
  },

  async create({ name, message }) {
    const { data, error } = await getSupabaseClient()
      .from('posts')
      .insert({ name, message })
      .select('id, name, message, created_at')
      .single();

    if (error) throw error;

    return toPost(data);
  },
};

module.exports = { postStore };
