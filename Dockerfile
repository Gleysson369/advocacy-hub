FROM node:20

WORKDIR /app

# 1. Copia tudo para dentro do container
COPY . .

# 2. Entra na pasta onde o package.json realmente está
# Se o seu servidor principal estiver no backEnd, use:
WORKDIR /app/backEnd

# 3. Agora o npm install vai funcionar porque ele achará o arquivo
RUN npm install

EXPOSE 3000

# 4. Inicia o servidor de dentro da pasta backEnd
CMD ["npm", "start"]
