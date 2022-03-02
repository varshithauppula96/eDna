// eslint-disable-next-line no-unused-vars
const { Pool, Client } = require('pg') // node-postgres package

// credentials to access the postgres database on the CentOS server
const config = {
  hostaddr : 'edna.bigelow.org',
  user : 'testuser',
  password : 'c7JAb7U2wcngrZPf',
  database : 'edna_db',
  port : 5432,
}

const pool = new Pool(config)

// export the postgres query pool * allowable addresses that can make query requests
module.exports = {
  query: (q_config) => pool.query(q_config),
  allowable: '*'
}
