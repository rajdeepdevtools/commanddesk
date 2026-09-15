const BRAND_COLOR = "#4F46E5"; // Indigo 600
const BRAND_NAME = "CommandDesk";
const LOGO_URL = "https://ui-avatars.com/api/?name=CD&background=4F46E5&color=fff&rounded=true&bold=true"; // Placeholder for an actual hosted logo

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${BRAND_NAME} Notification</title>
  <style>
    /* Reset & Base */
    body, p, h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      background-color: #f4f4f5; /* Zinc 100 */
      color: #3f3f46; /* Zinc 700 */
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      padding: 40px 20px;
    }
    
    /* Layout */
    .wrapper { max-width: 600px; margin: 0 auto; }
    .card { 
      background: #ffffff; 
      border-radius: 16px; 
      overflow: hidden; 
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
      border: 1px solid #e4e4e7;
    }
    
    /* Header */
    .header { 
      padding: 32px 40px; 
      text-align: center;
      background-color: #ffffff;
      border-bottom: 1px solid #f4f4f5;
    }
    .header img { width: 48px; height: 48px; border-radius: 12px; margin-bottom: 12px; }
    .header h1 { color: #18181b; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; }
    
    /* Content */
    .content { padding: 40px; }
    .content h2 { color: #18181b; font-size: 24px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.025em; }
    .content p { font-size: 16px; margin-bottom: 24px; color: #52525b; }
    
    /* Data/Stats Box */
    .stats-box { 
      background-color: #fafafa; 
      border: 1px solid #e4e4e7; 
      border-radius: 12px; 
      padding: 24px; 
      margin: 24px 0; 
    }
    .stats-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .stats-row:last-child { margin-bottom: 0; }
    .stats-label { color: #71717a; font-size: 14px; font-weight: 500; }
    .stats-value { color: #18181b; font-size: 15px; font-weight: 600; text-align: right; }
    .divider { height: 1px; background-color: #e4e4e7; margin: 16px 0; }
    
    /* Button */
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { 
      display: inline-block; 
      background-color: ${BRAND_COLOR}; 
      color: #ffffff !important; 
      text-decoration: none; 
      padding: 14px 32px; 
      border-radius: 10px; 
      font-weight: 600; 
      font-size: 15px;
      letter-spacing: 0.025em;
      transition: background-color 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
    }
    
    /* Footer */
    .footer { 
      padding: 32px 40px; 
      text-align: center; 
      background-color: #fafafa;
      border-top: 1px solid #e4e4e7;
    }
    .footer p { font-size: 13px; color: #a1a1aa; margin-bottom: 8px; }
    .footer-links { margin-top: 16px; font-size: 13px; }
    .footer-links a { color: #71717a; text-decoration: none; margin: 0 8px; font-weight: 500; }
    .footer-links a:hover { color: ${BRAND_COLOR}; text-decoration: underline; }

    /* Mobile Responsiveness */
    @media only screen and (max-width: 600px) {
      .header, .content, .footer { padding: 30px 24px; }
      .content h2 { font-size: 20px; }
      .content p { font-size: 15px; }
      .btn { width: 100%; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <img src="${LOGO_URL}" alt="${BRAND_NAME} Logo" />
        <h1>${BRAND_NAME}</h1>
      </div>
      
      <div class="content">
        ${content}
      </div>
      
      <div class="footer">
        <p>This email was sent to you because an event was triggered in your ${BRAND_NAME} workspace.</p>
        <p>© ${new Date().getFullYear()} ${BRAND_NAME} Inc. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Help Center</a>
          •
          <a href="#">Privacy Policy</a>
          •
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getWelcomeEmailTemplate = (firstName: string, role: string) => {
  return baseTemplate(`
    <h2>Welcome aboard, ${firstName}! 🎉</h2>
    <p>We are absolutely thrilled to have you join the team as our new <strong>${role}</strong>. Your enterprise workspace on ${BRAND_NAME} has been successfully provisioned.</p>
    <p>With CommandDesk, you have instant access to your HR profile, project boards, timesheets, and internal communications all in one centralized hub.</p>
    
    <div class="stats-box">
      <h4 style="margin-top:0; margin-bottom:16px; color:#18181b; font-size: 16px;">Next Steps Checklist:</h4>
      <p style="font-size: 14px; margin-bottom: 8px;">✅ Log in using your corporate credentials</p>
      <p style="font-size: 14px; margin-bottom: 8px;">✅ Complete your HR employee profile</p>
      <p style="font-size: 14px; margin-bottom: 0;">✅ Check the Projects tab for your assignments</p>
    </div>

    <div class="btn-container">
      <a href="https://commanddesk.com/login" class="btn">Access Your Workspace</a>
    </div>
    
    <p style="margin-bottom: 0;">If you run into any issues getting set up, our IT support desk is just a ticket away.</p>
  `);
};

export const getNewProjectTemplate = (projectName: string, leadName: string, startDate?: string) => {
  return baseTemplate(`
    <h2>New Project Assignment 🚀</h2>
    <p>Hi ${leadName},</p>
    <p>Great news! You have been officially assigned as the <strong>Project Lead</strong> for a newly initiated project.</p>
    
    <div class="stats-box">
      <div class="stats-row">
        <span class="stats-label">Project Name</span>
        <span class="stats-value">${projectName}</span>
      </div>
      ${startDate ? `
      <div class="divider"></div>
      <div class="stats-row">
        <span class="stats-label">Target Start Date</span>
        <span class="stats-value">${new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>` : ''}
    </div>

    <p>Your leadership and expertise are critical to the success of this initiative. Please review the project scope and begin assigning tasks to your team members.</p>
    
    <div class="btn-container">
      <a href="https://commanddesk.com/projects" class="btn">Open Project Dashboard</a>
    </div>
  `);
};

export const getPayslipTemplate = (firstName: string, month: number, year: number, netSalary: number) => {
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  return baseTemplate(`
    <h2>Your Payslip is Ready 💰</h2>
    <p>Hi ${firstName},</p>
    <p>Your payroll for the month of <strong>${monthName} ${year}</strong> has been successfully processed and authorized by the finance department.</p>
    
    <div class="stats-box">
      <div class="stats-row">
        <span class="stats-label">Pay Period</span>
        <span class="stats-value">${monthName} ${year}</span>
      </div>
      <div class="divider"></div>
      <div class="stats-row">
        <span class="stats-label">Net Salary Processed</span>
        <span class="stats-value" style="color: #10b981; font-size: 18px;">₹${netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>

    <p>The funds have been scheduled for transfer to your registered bank account. You can view the full breakdown of earnings and deductions in the Payroll module.</p>
    
    <div class="btn-container">
      <a href="https://commanddesk.com/payroll" class="btn">Download PDF Payslip</a>
    </div>
  `);
};

export const getSupportTicketTemplate = (firstName: string, title: string, priority: string) => {
  return baseTemplate(`
    <h2>Support Ticket Received 🎫</h2>
    <p>Hi ${firstName},</p>
    <p>This is an automated confirmation that we have received your support request.</p>
    
    <div class="stats-box">
      <div class="stats-row">
        <span class="stats-label">Ticket Subject</span>
        <span class="stats-value" style="max-width: 60%; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</span>
      </div>
      <div class="divider"></div>
      <div class="stats-row">
        <span class="stats-label">Assigned Priority</span>
        <span class="stats-value">
          <span style="background-color: ${priority === 'URGENT' || priority === 'HIGH' ? '#fef2f2' : '#f0fdf4'}; color: ${priority === 'URGENT' || priority === 'HIGH' ? '#ef4444' : '#10b981'}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block;">
            ${priority}
          </span>
        </span>
      </div>
    </div>

    <p>Our helpdesk specialists have been notified and will review your request shortly. You can track the live status, add comments, or attach screenshots via your Support dashboard.</p>
    
    <div class="btn-container">
      <a href="https://commanddesk.com/support" class="btn">Track Ticket Status</a>
    </div>
  `);
};

export const getForgotPasswordTemplate = (resetLink: string) => {
  return baseTemplate(`
    <h2>Password Reset Request 🔒</h2>
    <p>We received a request to reset the password associated with your ${BRAND_NAME} account.</p>
    <p>If you made this request, please click the secure button below to choose a new password. For security reasons, this link will expire in exactly 60 minutes.</p>
    
    <div class="btn-container">
      <a href="${resetLink}" class="btn">Reset My Password</a>
    </div>
    
    <p style="font-size: 13px; color: #71717a; margin-top: 32px; margin-bottom: 0;">If you didn't request a password reset, you can safely ignore this email. Your account remains completely secure and no changes have been made.</p>
  `);
};

export const getTaskAssignedTemplate = (firstName: string, taskTitle: string, priority: string, projectName?: string) => {
  return baseTemplate(`
    <h2>New Task Assigned ✅</h2>
    <p>Hi ${firstName},</p>
    <p>A new task has just been assigned to you in CommandDesk.</p>
    
    <div class="stats-box">
      <div class="stats-row">
        <span class="stats-label">Task</span>
        <span class="stats-value" style="max-width: 60%; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${taskTitle}</span>
      </div>
      <div class="divider"></div>
      <div class="stats-row">
        <span class="stats-label">Priority</span>
        <span class="stats-value">
          <span style="background-color: ${priority === 'URGENT' || priority === 'HIGH' ? '#fef2f2' : '#f0fdf4'}; color: ${priority === 'URGENT' || priority === 'HIGH' ? '#ef4444' : '#10b981'}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block;">
            ${priority}
          </span>
        </span>
      </div>
      ${projectName ? `
      <div class="divider"></div>
      <div class="stats-row">
        <span class="stats-label">Project</span>
        <span class="stats-value">${projectName}</span>
      </div>
      ` : ''}
    </div>

    <p>Please log in to review the task requirements, log your hours, and update the status as you make progress.</p>
    
    <div class="btn-container">
      <a href="https://commanddesk.com/tasks" class="btn">View Task Details</a>
    </div>
  `);
};

export const getChatMentionTemplate = (firstName: string, senderName: string, messagePreview: string) => {
  return baseTemplate(`
    <h2>New Message Received 💬</h2>
    <p>Hi ${firstName},</p>
    <p><strong>${senderName}</strong> just sent you a direct message on CommandDesk.</p>
    
    <div class="stats-box" style="border-left: 4px solid ${BRAND_COLOR};">
      <p style="font-style: italic; color: #52525b; margin: 0; font-size: 15px;">"${messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview}"</p>
    </div>
    
    <div class="btn-container">
      <a href="https://commanddesk.com/messages" class="btn">Reply to Message</a>
    </div>
  `);
};
