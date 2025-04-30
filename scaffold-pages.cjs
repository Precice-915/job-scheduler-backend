// scaffold-pages.js
const fs = require('fs');
const path = require('path');

const pages = [
  'auth/LoginPage',
  'jobs/JobsPage',
  'jobs/JobDetailPage',
  'jobs/NewJobPage',
  'clients/ClientsPage',
  'clients/ClientDetailPage',
  'clients/NewClientPage',
  'technicians/TechniciansPage',
  'technicians/TechnicianDetailPage',
];

for (const page of pages) {
  const fullDir = path.join('src', 'pages', path.dirname(page));
  fs.mkdirSync(fullDir, { recursive: true });

  const name = path.basename(page);
  const filePath = path.join('src', 'pages', page + '.tsx');

  fs.writeFileSync(
    filePath,
    `import React from "react";

export default function ${name}() {
  return (
    <div>
      <h1>${name}</h1>
      {/* TODO: implement ${name} */}
    </div>
  );
}
`
  );
}

console.log('✅ Page stubs created!');
