const fs = require('fs')

module.exports = {
  configureWebpack: {
    devServer: {
      host: '0.0.0.0',
      port: process.env.NODE_ENV === 'production' ? 443 : 8080,
      public: 'edna.bigelow.org',
      https: {
        // key: fs.readFileSync('/etc/pki/tls/private/star.bigelow.org.key'),
        // cert: fs.readFileSync('/etc/pki/tls/certs/star.bigelow.org.crt'),
        // ca: fs.readFileSync('/etc/pki/tls/certs/star.bigelow.org.ca-bundle'),
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
    }
  }
}
