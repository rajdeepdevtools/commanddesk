// Mocked data since a Prisma model is not yet provisioned for Websites.
export class WebsiteService {
  private static sites = [
    {
      id: "corporate-main",
      name: "Main Corporate Site",
      domain: "commanddesk.com",
      status: "LIVE",
      pagesCount: 12,
      lastPublished: new Date().toISOString(),
      visitors: 45200,
    },
    {
      id: "careers-portal",
      name: "Careers Portal",
      domain: "careers.commanddesk.com",
      status: "DRAFT",
      pagesCount: 3,
      lastPublished: null,
      visitors: 0,
    },
    {
      id: "customer-help",
      name: "Help Center",
      domain: "help.commanddesk.com",
      status: "LIVE",
      pagesCount: 45,
      lastPublished: new Date(Date.now() - 86400000 * 2).toISOString(),
      visitors: 12400,
    }
  ];

  static async getSites(companyId: string) {
    // In a real DB, we would filter by companyId
    return this.sites;
  }

  static async getSiteById(siteId: string) {
    return this.sites.find(s => s.id === siteId) || null;
  }

  static async createSite(data: any) {
    const newSite = {
      id: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: data.name,
      domain: data.domain || `${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.commanddesk.com`,
      status: "DRAFT",
      pagesCount: 1,
      lastPublished: null,
      visitors: 0,
    };
    this.sites.push(newSite);
    return newSite;
  }
}
