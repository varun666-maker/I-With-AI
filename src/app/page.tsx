"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useNav, type ScreenId } from "@/lib/store";
import { TopNav } from "@/components/shared/top-nav";
import { FlowNav } from "@/components/shared/flow-nav";
import { LandingPage } from "@/components/screens/prep/landing";

// Prep Mode
import { AuthScreen } from "@/components/screens/prep/auth";
import { StudentDashboard } from "@/components/screens/prep/dashboard";
import { ResumeHub } from "@/components/screens/prep/resume";
import { AptitudePortal } from "@/components/screens/prep/aptitude";
import { CodingArena } from "@/components/screens/prep/coding";
import { InterviewStudio } from "@/components/screens/prep/interview";
import { InterviewReport } from "@/components/screens/prep/report";
import { InterviewReplay } from "@/components/screens/prep/replay";
import { StudentProfile } from "@/components/screens/prep/profile";

// Company Admin
import { CompanyLanding } from "@/components/screens/admin/landing";
import { CompanyRegister } from "@/components/screens/admin/register";
import { AdminDashboard } from "@/components/screens/admin/dashboard";
import { CampaignCreate } from "@/components/screens/admin/campaign-new";
import { QuestionManager } from "@/components/screens/admin/questions";
import { CandidateLeaderboard } from "@/components/screens/admin/candidates";
import { BulkUpload } from "@/components/screens/admin/bulk-upload";
import { ProctoringReview } from "@/components/screens/admin/proctoring";
import { FinalSelection } from "@/components/screens/admin/selection";

// Candidate
import { ApplyPage } from "@/components/screens/candidate/apply";
import { CandidateLogin } from "@/components/screens/candidate/login";
import { ForcePasswordChange } from "@/components/screens/candidate/change-password";
import { PreTestCheck } from "@/components/screens/candidate/system-check";
import { CandidateDashboard } from "@/components/screens/candidate/dashboard";
import { CandidateResults } from "@/components/screens/candidate/results";

// Super Admin
import { SuperAdminDashboard } from "@/components/screens/superadmin/dashboard";
import { CompanyManagement } from "@/components/screens/superadmin/companies";
import { UserManagement } from "@/components/screens/superadmin/users";
import { AIUsageMonitor } from "@/components/screens/superadmin/ai-usage";
import { QuestionBankAdmin } from "@/components/screens/superadmin/questions";
import { SystemConfig } from "@/components/screens/superadmin/system";
import { AuditLogs } from "@/components/screens/superadmin/audit";
import { DatabaseHealth } from "@/components/screens/superadmin/db-health";

const SCREENS: Record<ScreenId, React.ComponentType> = {
  // Prep Mode
  landing: LandingPage,
  auth: AuthScreen,
  dashboard: StudentDashboard,
  resume: ResumeHub,
  aptitude: AptitudePortal,
  coding: CodingArena,
  interview: InterviewStudio,
  report: InterviewReport,
  replay: InterviewReplay,
  profile: StudentProfile,
  // Company Admin
  "company-landing": CompanyLanding,
  "company-register": CompanyRegister,
  "admin-dashboard": AdminDashboard,
  "campaign-new": CampaignCreate,
  "question-manager": QuestionManager,
  "candidate-leaderboard": CandidateLeaderboard,
  "bulk-upload": BulkUpload,
  "proctoring-review": ProctoringReview,
  "final-selection": FinalSelection,
  // Candidate
  apply: ApplyPage,
  "candidate-login": CandidateLogin,
  "candidate-change-password": ForcePasswordChange,
  "candidate-system-check": PreTestCheck,
  "candidate-dashboard": CandidateDashboard,
  "candidate-results": CandidateResults,
  // Super Admin
  "superadmin-dashboard": SuperAdminDashboard,
  "superadmin-companies": CompanyManagement,
  "superadmin-users": UserManagement,
  "superadmin-ai-usage": AIUsageMonitor,
  "superadmin-questions": QuestionBankAdmin,
  "superadmin-system": SystemConfig,
  "superadmin-audit": AuditLogs,
  "superadmin-db-health": DatabaseHealth,
};

export default function Home() {
  const { current } = useNav();
  const Active = SCREENS[current] ?? LandingPage;

  return (
    <>
      <TopNav />
      <FlowNav />
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Active />
        </motion.div>
      </AnimatePresence>
    </>
  );
}
