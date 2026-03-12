FROM node:20

WORKDIR /app
COPY . .

# 1. Build do FrontEnd
WORKDIR /app/frontEnd
RUN npm install
RUN npm run build

# 2. Configuração do BackEnd
WORKDIR /app/backEnd
RUN npm install

# --- ADICIONE ESTA LINHA AQUI ---
RUN npx prisma generate
# -------------------------------

EXPOSE 3000

CMD ["npm", "start"]
