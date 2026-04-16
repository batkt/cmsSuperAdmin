const { execSync } = require('child_process');
const fs = require('fs');

async function check() {
  const token = fs.readFileSync(require('os').homedir() + '/.gemini/antigravity/brain/' + process.cwd().split('/').pop() + '/scratch/token.txt', 'utf8').trim();
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-project-id': 'admin@demo.com_My-App',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
      componentType: 'section',
      pageRoute: '/test8',
      order: 0,
      props: {}
    })
  };
  const res = await fetch('http://localhost:3001/api/proxy/api/v2/core/components', options);
  console.log(await res.text());
}
check();
