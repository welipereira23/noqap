const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function login() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'token',
      message: 'Digite seu token de acesso da Vercel:',
      validate: input => input.length > 0
    }
  ]);

  const config = {
    token: answers.token
  };

  const configPath = path.join(process.env.HOME || process.env.USERPROFILE, '.vercel-cli-config.json');
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green('✓ Login realizado com sucesso!'));
  } catch (error) {
    console.error(chalk.red('Erro ao salvar as credenciais:', error.message));
  }
}

module.exports = { login }; 