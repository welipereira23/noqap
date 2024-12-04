#!/bin/bash

# Instalar dependências
npm install

# Build do projeto
npm run build

# Criar arquivo de redirecionamento para SPA
echo "/* /index.html 200" > dist/_redirects
