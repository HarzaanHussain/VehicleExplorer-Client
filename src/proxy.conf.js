const target = 'https://localhost:40443';

const PROXY_CONFIG = [
  {
    context: ["/api"],
    target: target,
    secure: false
  }
]

module.exports = PROXY_CONFIG;
