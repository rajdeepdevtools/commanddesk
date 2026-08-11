const fs = require('fs');

function replaceInFile(file, search, replacement) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(search).join(replacement);
    fs.writeFileSync(file, content);
  }
}

function replaceRegex(file, regex, replacement) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
  }
}

// 1. Employees duplicates
replaceRegex('src/app/employees/page.tsx', /departmentId: "",\s*departmentId: \[\] as string\[\],/g, 'departmentId: "",');
replaceRegex('src/app/employees/page.tsx', /departmentId: employee\.departmentId \|\| "",\s*departmentId: \[\] as string\[\],/g, 'departmentId: employee.departmentId || "",');

// 2. Messages Route
replaceInFile('src/app/api/messages/[chatId]/route.ts', '{ params }: { params: { chatId: string } }', '{ params }: { params: Promise<{ chatId: string }> }');
replaceRegex('src/app/api/messages/[chatId]/route.ts', /const chatId = params\.chatId;/g, 'const { chatId } = await params;');
replaceRegex('src/app/api/messages/[chatId]/route.ts', /const \{ chatId \} = params;/g, 'const { chatId } = await params;');

// 3. Support Service
replaceInFile('src/lib/services/support-service.ts', 'include: { createdBy: true, assignedTo: true, comments: true }', 'include: { createdBy: true, assignedTo: true, comments: { include: { author: true } } }');

// 4. Support Page
replaceInFile('src/app/support/[id]/page.tsx', 'comment.createdBy?.firstName', 'comment.author?.firstName');
replaceInFile('src/app/support/[id]/page.tsx', 'comment.createdBy?.lastName', 'comment.author?.lastName');
replaceInFile('src/app/support/[id]/page.tsx', 'comment.createdBy?.avatarUrl', 'comment.author?.avatarUrl');

console.log("Fix 5 applied");
