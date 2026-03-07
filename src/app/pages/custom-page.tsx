import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { fetchMenuPages } from '../../lib/supabaseData';

export function CustomPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      try {
        const menuPages = await fetchMenuPages();
        const foundPage = menuPages.find((item: any) => item.page_slug === slug);
        
        if (foundPage) {
          setPage({
            title: foundPage.page_name,
            content: foundPage.page_content,
            slug: foundPage.page_slug
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to load page:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FAF4EC]">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-[#36454F] mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#6B7F39] hover:bg-[#5a6930]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF4EC]">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF4EC]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-[#36454F] hover:text-[#6B7F39]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#36454F] mb-6">
            {page.title}
          </h1>
          
          <div 
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: page.content }}
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#374151'
            }}
          />
        </div>
      </div>
    </div>
  );
}