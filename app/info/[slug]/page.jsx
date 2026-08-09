import Link from 'next/link';
import { notFound } from 'next/navigation';
import { policies } from '@/lib/store';

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = policies[slug];
  if (!page) return {};
  return { title: page.title, alternates: { canonical: `/info/${slug}` } };
}

export default async function InfoPage({ params }) {
  const { slug } = await params;
  const page = policies[slug];
  if (!page) notFound();

  return (
    <div className="wrap">
      <p className="breadcrumb">
        <Link href="/">Home</Link> / {page.title}
      </p>
      <article className="prose">
        <h1 className="display" style={{ marginBottom: 20 }}>{page.title}</h1>
        {page.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </article>
    </div>
  );
}
