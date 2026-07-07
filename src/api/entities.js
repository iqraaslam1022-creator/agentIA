import { supabase } from './supabaseClient';

/**
 * This factory recreates the same shape as Base44's
 * base44.entities.X.list() / .get() / .create() / .update() / .delete()
 * so the rest of your app's code barely has to change.
 *
 * Usage elsewhere in your app stays almost identical to before:
 *   import { Lead, Deal, Property } from '@/api/entities';
 *   const leads = await Lead.list();
 *   const newLead = await Lead.create({ name: 'Ali', status: 'New' });
 *   await Lead.update(id, { status: 'Contacted' });
 *   await Lead.delete(id);
 */
function makeEntity(tableName) {
  return {
    // list all rows (optionally ordered by most recent first)
    async list(orderBy = 'created_at', ascending = false) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(orderBy, { ascending });
      if (error) throw error;
      return data;
    },

    // get a single row by id
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    // filter rows, e.g. Lead.filter({ status: 'New' })
    async filter(matchObject = {}) {
      let query = supabase.from(tableName).select('*');
      for (const [key, value] of Object.entries(matchObject)) {
        query = query.eq(key, value);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    // create a new row (owner_id is auto-set by Postgres default in schema.sql)
    async create(payload) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // update an existing row by id
    async update(id, payload) {
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // delete a row by id
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    }
  };
}

// One export per entity — matches your original Base44 entity names
export const Lead = makeEntity('leads');
export const Property = makeEntity('properties');
export const Deal = makeEntity('deals');
export const Invoice = makeEntity('invoices');
export const FollowUp = makeEntity('follow_ups');
export const Document = makeEntity('documents');
export const CommunicationLog = makeEntity('communication_logs');
export const UserProfile = makeEntity('users'); // note: auth itself is in auth.js
