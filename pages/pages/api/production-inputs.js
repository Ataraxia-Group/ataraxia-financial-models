import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { modelId } = req.query;

      if (!modelId) {
        return res.status(400).json({ error: 'modelId required' });
      }

      const { data, error } = await supabase
        .from('production_inputs')
        .select('*')
        .eq('model_id', modelId)
        .order('order', { ascending: true });

      if (error) throw error;

      return res.status(200).json(data || []);
    }

    if (method === 'POST') {
      const { modelId, unitTypes } = req.body;

      if (!modelId || !Array.isArray(unitTypes)) {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      await supabase
        .from('production_inputs')
        .delete()
        .eq('model_id', modelId);

      const rows = unitTypes.map((ut, idx) => ({
        model_id: modelId,
        unit_type_name: ut.unitTypeName,
        revenue_per_unit: ut.revenuePerUnit,
        cogs_per_unit: ut.cogsPerUnit,
        cogs_coa_id: ut.cogsCoaId || null,
        order: idx
      }));

      const { data, error } = await supabase
        .from('production_inputs')
        .insert(rows)
        .select();

      if (error) throw error;

      return res.status(200).json(
        data.map(d => ({
          id: d.id,
          unitTypeName: d.unit_type_name,
          revenuePerUnit: d.revenue_per_unit,
          cogsPerUnit: d.cogs_per_unit,
          cogsCoaId: d.cogs_coa_id
        }))
      );
    }

    if (method === 'DELETE') {
      const { id } = req.query;

      const { error } = await supabase
        .from('production_inputs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Production inputs error:', error);
    return res.status(500).json({ error: error.message });
  }
}
