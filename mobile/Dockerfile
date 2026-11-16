FROM node:22-alpine

WORKDIR /usr/src/app

# Instala dependências do projeto mobile
COPY package*.json ./
RUN npm ci

# Copia o código-fonte do aplicativo Expo
COPY . .

# Portas do Metro Bundler e Expo DevTools
EXPOSE 8081 19000 19001 19002

# Inicia o servidor de desenvolvimento do Expo acessível na rede
CMD ["npx", "expo", "start", "--lan"]
