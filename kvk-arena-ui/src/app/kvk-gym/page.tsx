import { SitePage } from "@/components/site/site-page";
import { pageContent } from "@/lib/site-content";

export default function GymPage() {
  return <SitePage content={pageContent.gym} />;
}