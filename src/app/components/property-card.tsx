import { Link } from 'react-router';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return `Ksh ${price.toLocaleString()}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-56 bg-muted">
        {property.images && property.images.length > 0 ? (
          <ImageWithFallback
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
          {property.type}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-xl font-bold mb-2 line-clamp-1">{property.title}</h3>
        
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {property.description}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1 text-accent" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1 text-accent" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center">
            <Maximize className="w-4 h-4 mr-1 text-accent" />
            <span>{property.area} m²</span>
          </div>
        </div>
        
        <div className="text-2xl font-bold text-accent mb-4">
          {formatPrice(property.price)}/month
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link to={`/property/${property.id}`} className="w-full">
          <Button className="w-full bg-accent hover:bg-accent/90">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
