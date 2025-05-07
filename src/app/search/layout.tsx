import { SearchProvider } from '@/app/providers/SearchProvider';

export default function SearchLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SearchProvider>{children}</SearchProvider>;
}
