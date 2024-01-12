FROM node:21-alpine3.18
WORKDIR /app
COPY package.json yarn.lock ./ 
RUN yarn install
COPY . .
CMD ["yarn", "run", "dev"]