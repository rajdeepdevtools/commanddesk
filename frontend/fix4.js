const fs = require('fs');

function replaceInFile(file, search, replacement) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replacement);
    fs.writeFileSync(file, content);
  }
}

// 1. Websites
replaceInFile('src/app/api/websites/route.ts', 'id: session.user.companyId,', 'id: session.user.companyId as string,');

// 2. Employees departmentIds
replaceInFile('src/app/employees/page.tsx', 'employee.departmentIds || []', 'employee.departmentId || ""');
replaceInFile('src/app/employees/page.tsx', 'departmentIds: [selectedDept]', 'departmentId: selectedDept');
replaceInFile('src/app/employees/page.tsx', 'departmentIds: Array.from(e.target.selectedOptions, (op) => op.value)', 'departmentId: e.target.value');
replaceInFile('src/app/employees/page.tsx', 'employee.departmentIds?', 'employee.departmentId ?');
replaceInFile('src/app/employees/page.tsx', 'departmentIds: employee.departmentId || ""', 'departmentId: employee.departmentId || ""');
replaceInFile('src/app/employees/page.tsx', 'departmentIds:', 'departmentId:');

// 3. Payroll Calendar
replaceInFile('src/app/payroll/page.tsx', 'import { Download, Search, Upload, Plus, AlertCircle, CheckCircle2 } from "lucide-react";', 'import { Download, Search, Upload, Plus, AlertCircle, CheckCircle2, Calendar } from "lucide-react";');

// 4. Support author -> createdBy
replaceInFile('src/app/support/[id]/page.tsx', 'comment.author?.firstName', 'comment.createdBy?.firstName');
replaceInFile('src/app/support/[id]/page.tsx', 'comment.author?.lastName', 'comment.createdBy?.lastName');
replaceInFile('src/app/support/[id]/page.tsx', 'comment.author.firstName', 'comment.createdBy?.firstName');
replaceInFile('src/app/support/[id]/page.tsx', 'comment.author.lastName', 'comment.createdBy?.lastName');
replaceInFile('src/app/support/[id]/page.tsx', 'comment.author?.avatarUrl', 'comment.createdBy?.avatarUrl');

console.log('Done');
