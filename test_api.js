const http = require('http');

const data = JSON.stringify({
  componentType: 'section',
  pageRoute: '/',
  order: 0,
  props: {}
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/proxy/api/v2/core/components',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-project-id': 'test'
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(body));
});

req.write(data);
req.end();
