import { notFound } from "next/navigation";
import { getPolicy, PolicyKey } from "../../content";

const policyRoutes: Record<string, PolicyKey> = {
  "privacy-policy": "privacy",
  "shipping-policy": "shipping",
  "refund-policy": "refund",
};

type PolicyPageProps = {
  params: Promise<{ policy: string }>;
};

export function generateStaticParams() {
  return Object.keys(policyRoutes).map((policy) => ({ policy }));
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { policy } = await params;
  const key = policyRoutes[policy];

  if (!key) notFound();

  const entry = getPolicy(key);

  return (
    <main id="main" className="inner-main policy-page">
      <header className="policy-hero">
        <p className="kicker">TACT / Customer care</p>
        <h1>{entry.title}</h1>
        <p>Clear information, kept in one place.</p>
      </header>
      <section
        className="policy-content"
        dangerouslySetInnerHTML={{ __html: entry.html }}
      />
    </main>
  );
}
