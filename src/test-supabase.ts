import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jumgqbwxvwdmyplzbkay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1bWdxYnd4dndkbXlwbHpia2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDIwNzg5MzcsImV4cCI6MjAxNzY1NDkzN30.GzpYEHxD0VXBtLhBVzlXhNkWVVgYTOmr6u8tEkI6Gho';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar a inserção
async function testInsert() {
    const testData = {
        date: '2024-12-06',
        type: 'FERIAS',
        reason: null,
        user_id: 'd734570d-b8f8-4db9-a83d-204bfbd1bf50'
    };

    console.log('Tentando inserir:', testData);

    const { data, error } = await supabase
        .from('non_accounting_days')
        .insert(testData)
        .select();

    console.log('Resultado:', { data, error });
}

// Função para testar a busca
async function testSelect() {
    const { data, error } = await supabase
        .from('non_accounting_days')
        .select('*')
        .eq('user_id', 'd734570d-b8f8-4db9-a83d-204bfbd1bf50');

    console.log('Dados encontrados:', { data, error });
}

// Executar os testes
testInsert().then(() => testSelect());
