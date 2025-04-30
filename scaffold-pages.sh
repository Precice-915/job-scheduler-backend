#!/usr/bin/env sh
set -eu

for page in \
  auth/LoginPage \
  jobs/JobsPage \
  jobs/JobDetailPage \
  jobs/NewJobPage \
  clients/ClientsPage \
  clients/ClientDetailPage \
  clients/NewClientPage \
  technicians/TechniciansPage \
  technicians/TechnicianDetailPage; do

  dir=$(dirname "$page")
  name=$(basename "$page")
  mkdir -p "src/pages/$dir"

  cat > "src/pages/${page}.tsx" <<EOF
import React from 'react';

export default function ${name}() {
  return (
    <div>
      <h1>${name}</h1>
      {/* TODO: implement ${name} */}
    </div>
  );
}
EOF

done

echo "✅ Page stubs created!"