const fs = require('fs');

function replaceRegex(file, regex, replacement) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
  }
}

replaceRegex('src/app/employees/page.tsx', /departmentId: "",\s*departmentId: \[\] as string\[\],/g, 'departmentId: "",');
replaceRegex('src/app/employees/page.tsx', /departmentId: deptIds\[0\] \|\| "",\s*departmentId: deptIds,/g, 'departmentId: deptIds[0] || "",');
replaceRegex('src/app/employees/page.tsx', /departmentId: employee\.departmentId \|\| "",\s*departmentId: \[\] as string\[\],/g, 'departmentId: employee.departmentId || "",');

console.log("Fix 6 applied");
