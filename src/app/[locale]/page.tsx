import { redirect } from 'next/navigation';

interface Props {
  params: { locale: string };
}

// Redirection vers la boutique (landing page principale)
export default function RootPage({ params }: Props) {
  redirect(`/${params.locale}/shop`);
}
