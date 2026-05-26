import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Supabase URL:', supabaseUrl ? 'SET' : 'MISSING');
    console.log('Supabase Key:', supabaseKey ? 'SET' : 'MISSING');

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        error: 'Missing Supabase credentials',
        url: supabaseUrl ? 'present' : 'missing',
        key: supabaseKey ? 'present' : 'missing'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

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

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

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

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
