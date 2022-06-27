FROM node:14.17.0
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN yarn
COPY . .
EXPOSE 1337
CMD ["yarn","develop"]