# Log de Erros e Soluções

## 1. Cálculo de Horas Noturnas Incorreto
**Data**: 13/03/2024
**Tipo**: Cálculo
**Descrição**: O sistema não estava calculando corretamente o adicional noturno de 10 minutos por hora trabalhada entre 23h e 5h.

**Solução**:
- Implementado novo algoritmo em `utils/time/duration.ts`
- Adicionada função `calculateNightHours` para contar apenas horas noturnas completas
- Cada hora noturna completa adiciona 10 minutos ao total
- Exemplo: 6 horas noturnas = 60 minutos adicionais

## 2. Contagem de Dias Úteis Indevida
**Data**: 13/03/2024
**Tipo**: Regra de Negócio
**Descrição**: O sistema estava considerando dias úteis (excluindo finais de semana) no cálculo de horas mensais, quando deveria usar apenas o total de dias.

**Solução**:
- Removida lógica de dias úteis do cálculo
- Nova fórmula implementada:
  - Dias a trabalhar = Total de dias - Dias não contábeis
  - Horas previstas = (160/dias do mês) × dias a trabalhar
- Atualizado em `utils/time/monthly.ts`

## 3. Erro de Importação de Funções
**Data**: 13/03/2024
**Tipo**: Estrutura de Código
**Descrição**: Múltiplos erros de importação devido à reorganização dos cálculos em módulos separados.

**Solução**:
- Reorganizada estrutura de arquivos em `utils/time/`
- Criados módulos específicos para cada tipo de cálculo
- Centralizado constantes em `constants.ts`
- Implementado barrel file `index.ts` para exportações
- Corrigidas todas as importações nos componentes