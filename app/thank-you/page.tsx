import { ThankYouScreen } from "@/components/screens/legal/thank-you-screen";

export const metadata = {
  title: "Thank You | InterviewAI",
  description: "Submission received. We have dispatched confirmation details to your inbox.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return <ThankYouScreen />;
}
