FROM beevelop/nodejs-python
WORKDIR /server
COPY package.json /server
RUN npm install
COPY . /server
CMD node ./bin/www
EXPOSE 3001
