import { SearchResult } from '@/app/components/SearchResult';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Result'
};

export default function SearchResultPage() {
  return <SearchResult />;
}
