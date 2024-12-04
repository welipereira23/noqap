const axios = require('axios');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

async function checkHealth() {
  const spinner = ora('Verificando a saúde do projeto...').start();
  
  try {
    // Lê o token de configuração
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.vercel-cli-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Configuração do Axios
    const api = axios.create({
      baseURL: 'https://api.vercel.com',
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    });

    // Verifica deployments recentes
    const deployments = await api.get('/v6/deployments');
    
    // Verifica logs de erro
    const logs = await api.get('/v2/deployments/${deployments.data.deployments[0].uid}/events');
    
    spinner.stop();

    // Analisa e exibe problemas encontrados
    const errors = logs.data.filter(log => log.type === 'error');
    
    if (errors.length > 0) {
      console.log(chalk.red('\n Problemas encontrados:'));
      errors.forEach(error => {
        console.log(chalk.yellow(`\n- ${error.message}`));
        console.log(`  Timestamp: ${new Date(error.created).toLocaleString()}`);
      });
    } else {
      console.log(chalk.green('\n✓ Nenhum erro encontrado nos logs recentes'));
    }

    // Exibe informações do último deploy
    const lastDeploy = deployments.data.deployments[0];
    console.log(chalk.blue('\nÚltimo deploy:'));
    console.log(`Estado: ${lastDeploy.state}`);
    console.log(`Criado em: ${new Date(lastDeploy.created).toLocaleString()}`);
    console.log(`URL: ${lastDeploy.url}`);

  } catch (error) {
    spinner.stop();
    console.error(chalk.red('\n❌ Erro ao verificar o projeto:'), error.message);
  }
}

module.exports = { checkHealth }; 