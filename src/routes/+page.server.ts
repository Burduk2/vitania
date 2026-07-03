import { supabase } from "$lib/supabase";

export const load = async () => {
  return {
    messages: (await getLast100Messages()) ?? []
  };
};

async function getLast100Messages(): Promise<App.Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('text,iso_code,created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) {
    console.error(error);
    return [];
  }
  const msgs = data.map((row) => {
    return {
      text: row.text,
      isoCode: row.iso_code,
      displayTime: new Intl.DateTimeFormat(undefined, {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(new Date(row.created_at))
    };
  });
  return msgs.reverse();
}
