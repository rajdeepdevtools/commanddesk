import { prisma } from './src/lib/prisma';
import { ProjectService } from './src/lib/services/project-service';
import { TaskService } from './src/lib/services/task-service';
import { LeadService } from './src/lib/services/lead-service';
import { InvoiceService } from './src/lib/services/invoice-service';
import { AttendanceService } from './src/lib/services/attendance-service';

async function main() {
  const companies = await prisma.company.findMany();
  if (companies.length === 0) {
    console.log("No companies found");
    return;
  }
  const companyId = companies[0].id;
  console.log("Company ID:", companyId);

  try {
    const projects = await ProjectService.getStats(companyId);
    console.log("Projects:", projects);
  } catch (e: any) {
    console.error("Projects error:", e.message);
  }

  try {
    const tasks = await TaskService.getStats(companyId);
    console.log("Tasks:", tasks);
  } catch (e: any) {
    console.error("Tasks error:", e.message);
  }

  try {
    const leads = await LeadService.getStats(companyId);
    console.log("Leads:", leads);
  } catch (e: any) {
    console.error("Leads error:", e.message);
  }

  try {
    const invoices = await InvoiceService.getStats(companyId);
    console.log("Invoices:", invoices);
  } catch (e: any) {
    console.error("Invoices error:", e.message);
  }

  try {
    const attendance = await AttendanceService.getStats(companyId);
    console.log("Attendance:", attendance);
  } catch (e: any) {
    console.error("Attendance error:", e.message);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
