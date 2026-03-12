# 1. Escolha uma imagem que já venha com Node.js
FROM node:20

# 2. Cria a pasta do app
WORKDIR /app

# 3. Copia os arquivos de dependências
COPY package*.json ./

# 4. Instala as dependências
RUN npm install

# 5. Copia o resto dos arquivos do projeto
COPY . .

# 6. Expõe a porta que o Render usa (geralmente 10000 ou 3000)
EXPOSE 3000

# 7. O comando que inicia seu site (ajuste se seu arquivo principal não for index.js)
CMD ["npm", "start"]
