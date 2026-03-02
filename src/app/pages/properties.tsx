import { useState, useEffect } from 'react';
import { Layout } from '../components/layout';
import { PropertyCard } from '../components/property-card';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';
import { useRealtimeProperties } from '../hooks/useRealtime';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  amenities: string[];
  images: string[];
  available: boolean;
}

export function Properties() {
  const { data: properties, loading } = useRealtimeProperties();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    applyFilters();
  }, [properties, searchQuery]);

  const applyFilters = () => {
    let filtered = [...properties];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Only show available properties
    filtered = filtered.filter((p) => p.available);

    setFilteredProperties(filtered);
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-warm-beige to-white min-h-screen">
        {/* Header Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">Browse Properties</h1>
              <p className="text-xl opacity-90">
                Discover your perfect home from our curated collection of premium properties 
                across Kenya. Filter by location, price, and amenities.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by location, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>

          {/* Properties Grid */}
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="text-xl text-muted-foreground">Loading properties...</div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-2xl font-bold mb-2">No properties found</div>
                <p className="text-muted-foreground">
                  Try adjusting your search
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {filteredProperties.length} {filteredProperties.length === 1 ? 'Property' : 'Properties'} Found
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}