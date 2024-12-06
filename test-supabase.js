import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env') });

// Criar cliente Supabase usando variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Verificando variáveis de ambiente:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '[PRESENTE]' : '[AUSENTE]');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertNonAccountingDay() {
  try {
    console.log('Iniciando teste de inserção...');
    
    const testData = {
      date: new Date().toISOString(),
      type: 'FERIADO',
      reason: 'Teste de inserção',
      user_id: '1208b645-bf75-4e78-a220-533e3e289358'
    };

    console.log('Dados para inserção:', testData);

    const { data, error } = await supabase
      .from('non_accounting_days')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.error('Erro na inserção:', {
        code: error.code,
        message: error.message,
        details: error.details
      });
      throw error;
    }

    console.log('Dados inseridos com sucesso:', data);
    return data;
  } catch (error) {
    console.error('Erro no teste:', error);
    throw error;
  }
}

// Executar o teste
testInsertNonAccountingDay()
  .then(() => console.log('Teste concluído'))
  .catch(error => console.error('Teste falhou:', error));
