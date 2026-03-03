import { supabase } from '../composables/useSupabase.js' 

export const teamsService = {
  async getAll() {
    const { data, error } = await supabase.from('teams').select('*')
    if (error) throw error
    return data
  },
  async create(team) {
    const { data, error } = await supabase.from('teams').insert([team]).select()
    if (error) throw error
    return data[0]
  },
  async update(id, team) {
    const { data, error } = await supabase.from('teams').update(team).eq('id', id).select()
    if (error) throw error
    return data[0]
  },
  async delete(id) {
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) throw error
  }
}

export const evaluatorsService = {
  async getAll() {
    const { data, error } = await supabase.from('evaluators').select('*').order('name')
    if (error) throw error
    return data || []
  },
  async create(evaluator) {
    const { data, error } = await supabase.from('evaluators').insert([evaluator]).select()
    if (error) throw error
    return data[0]
  },
  async update(id, evaluator) {
    const { data, error } = await supabase
      .from('evaluators')
      .update(evaluator)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },
  async delete(id) {
    const { error } = await supabase.from('evaluators').delete().eq('id', id)
    if (error) throw error
  }
}

export const questionsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
    if (error) throw error
    return data || []
  },
  async create(question) {
    const { data, error } = await supabase
      .from('questions')
      .insert([question])
      .select()
    if (error) throw error
    return data[0]
  },
  async delete(id) {
    const { error } = await supabase.from('questions').delete().eq('id', id)
    if (error) throw error
  }
}



