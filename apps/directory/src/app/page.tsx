import DirectoryClient from "@/components/DirectoryClient";
import { ITEMS } from "@/lib/data";

export default function Page() {
  return <DirectoryClient items={ITEMS} />;
}
