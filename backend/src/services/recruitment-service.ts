import { prisma } from "@/prisma";

export class RecruitmentService {
  /**
   * Get all active job postings
   */
  static async getJobPostings(companyId: string) {
    return prisma.jobPosting.findMany({
      where: { companyId },
      include: {
        department: { select: { id: true, name: true } },
        _count: { select: { applicants: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Get applicants for a specific job
   */
  static async getApplicants(jobPostingId: string) {
    return prisma.applicant.findMany({
      where: { jobPostingId },
      include: {
        interviews: true,
      },
      orderBy: { appliedAt: "desc" }
    });
  }

  /**
   * Move applicant to a new stage
   */
  static async updateApplicantStatus(applicantId: string, status: string) {
    return prisma.applicant.update({
      where: { id: applicantId },
      data: { status, updatedAt: new Date() }
    });
  }
}
