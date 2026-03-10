# c:\Users\Santri\Documents\Estudo Dev\advocacia_v3-main\backEnd\Dockerfile

# Usa uma imagem Node.js recente
FROM node:22

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Gera o cliente do Prisma para o Linux (sistema do container)
RUN npx prisma generate

# Copia e torna o script de entrypoint executável
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expõe a porta que a API usa
EXPOSE 3333

# Define o entrypoint que rodará as migrações
ENTRYPOINT ["./entrypoint.sh"]

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"]
