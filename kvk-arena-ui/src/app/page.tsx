import { SitePage } from "@/components/site/site-page";
import { pageContent } from "@/lib/site-content";

export default function Home() {
  return <SitePage content={pageContent.home} />;
}