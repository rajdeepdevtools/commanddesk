import { prisma } from './src/lib/prisma';
import { DashboardService } from './src/lib/services/dashboard-service';

async function main() {
  const companies = await prisma.company.findMany();
  if (companies.length === 0) {
    console.log("No companies found");
    return;
  }
  const companyId = companies[0].id;
  console.log("Company ID:", companyId);

  try {
    const overview = await DashboardService.getOverview(companyId);
    console.log("Overview:", JSON.stringify(overview, null, 2));
  } catch (e: any) {
    console.error("Dashboard error:", e.message);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
