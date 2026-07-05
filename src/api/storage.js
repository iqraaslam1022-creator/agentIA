import { supabase } from './supabaseClient';

const BUCKET = 'documents';

/**
 * Replaces base44.integrations.Core.UploadFile({ file }).
 * Usage:
 *   const { file_url } = await uploadFile(file);
 */
export async function uploadFile(file) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return { file_url: data.publicUrl };
}
