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
    const { data, error } = await supabase
      .from('teams')
      .update(team)
      .eq('id', id)
      .select()
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
    const { data, error } = await supabase
      .from('evaluators')
      .select('*')
      .order('name')
    if (error) throw error
    return data || []
  },
  async create(evaluator) {
    const { data, error } = await supabase
      .from('evaluators')
      .insert([evaluator])
      .select()
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
    const { data, error } = await supabase.from('questions').select('*')
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

// helper para códigos aleatórios
export function generateRandomCode(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const assignmentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        id, code, status, created_at,
        team:teams ( id, name, escola, cidade, numero_estande ),
        evaluator:evaluators ( id, name, email, area_conhecimento ),
        template:evaluation_templates ( id, name, type )
      `)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  // aqui o code já vem pronto (ex: "A12-3f9a7cde")
  async create(assignment) {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignment])
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase.from('assignments').delete().eq('id', id)
    if (error) throw error
  },

  // ✅ NOVO MÉTODO - EXCLUI RESPOSTAS DA TABELA evaluation_answers
  async deleteResponsesByAssignment(assignmentId) {
    const { data, error } = await supabase
      .from('evaluation_answers')
      .delete()
      .eq('assignment_id', assignmentId)

    if (error) throw error
    return data
  }
}

// Modelos de avaliação (templates)
export const templatesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('evaluation_templates')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data || []
  },
  async create(template) {
    const { data, error } = await supabase
      .from('evaluation_templates')
      .insert([template])
      .select()
    if (error) throw error
    return data[0]
  },
  async delete(id) {
    const { error } = await supabase
      .from('evaluation_templates')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

// Perguntas ligadas a um template
export const templateQuestionsService = {
  async getByTemplate(templateId) {
    const { data, error } = await supabase
      .from('evaluation_template_questions')
      .select(`
        id,
        ordem,
        question:questions(id, text, type)
      `)
      .eq('template_id', templateId)
      .order('ordem', { ascending: true })
    if (error) throw error
    return data || []
  },
  async saveTemplateQuestions(templateId, questionIds) {
    const { error: delError } = await supabase
      .from('evaluation_template_questions')
      .delete()
      .eq('template_id', templateId)
    if (delError) throw delError

    const rows = questionIds.map((qid, index) => ({
      template_id: templateId,
      question_id: qid,
      ordem: index + 1
    }))

    if (!rows.length) return []

    const { data, error } = await supabase
      .from('evaluation_template_questions')
      .insert(rows)
      .select()
    if (error) throw error
    return data
  }
}
