import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Edit, Trash2, Database, Tag, Layers, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseClient } from '../../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { seedSampleProperties } from '../../utils/sample-data';
import { useRealtimeProperties } from '../../hooks/useRealtime';

const supabase = getSupabaseClient();

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
  categorizedImages?: CategorizedImage[];
}

interface Category {
  id: string;
  name: string;
}

interface Feature {
  id: string;
  name: string;
}

interface CategorizedImage {
  file?: File;
  url?: string;
  category: string;
}

const IMAGE_CATEGORIES = [
  'Living Room',
  'Dining',
  'Bedroom',
  'Bathroom',
  'Kitchen',
  'Amenities'
];

const initialFormState = {
  title: '',
  description: '',
  price: '',
  location: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  type: '',
  selectedAmenities: [] as string[],
  categorizedImages: [] as CategorizedImage[],
};

export function AdminProperties() {
  const navigate = useNavigate();
  const { data: properties, loading } = useRealtimeProperties();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [accessToken, setAccessToken] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Categories and Features
  const [categories, setCategories] = useState<Category[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      // First try to refresh the session to get a fresh token
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session?.user) {
        console.log('❌ Session refresh failed, trying getSession:', error);
        // Fallback to getSession if refresh fails
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        
        if (!fallbackSession?.user) {
          toast.error('Please login to access this page.');
          navigate('/login');
          return;
        }
        
        const adminEmails = ['admin@skyway.com', 'admin@123.com'];
        if (!adminEmails.includes(fallbackSession.user.email || '')) {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }
        
        console.log('✅ Using fallback session token');
        setAccessToken(fallbackSession.access_token);
        await loadCategoriesAndFeatures(fallbackSession.access_token);
        return;
      }
      
      const adminEmails = ['admin@skyway.com', 'admin@123.com'];
      if (!adminEmails.includes(session.user.email || '')) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }
      
      console.log('✅ Using refreshed session token');
      setAccessToken(session.access_token);
      await loadCategoriesAndFeatures(session.access_token);
    } catch (error) {
      console.error('❌ Error in checkAdmin:', error);
      toast.error('Authentication error');
      navigate('/login');
    }
  };

  const loadCategoriesAndFeatures = async (token: string) => {
    try {
      // Load categories
      const catResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/categories`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (catResponse.ok) {
        const catData = await catResponse.json();
        setCategories(catData.categories || []);
      }

      // Load features
      const featResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/features`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (featResponse.ok) {
        const featData = await featResponse.json();
        setFeatures(featData.features || []);
      }
    } catch (error) {
      console.error('Error loading categories/features:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      console.log('Sending category request:', { name: newCategoryName });
      console.log('Using token:', accessToken ? 'Token present' : 'No token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/categories`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newCategoryName }),
        }
      );

      console.log('Category response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Category created:', result);
        toast.success('Category added successfully');
        setNewCategoryName('');
        await loadCategoriesAndFeatures(accessToken);
      } else {
        const errorText = await response.text();
        console.error('Failed to add category:', errorText);
        toast.error(`Failed to add category: ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(`Failed to add category: ${error}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/categories/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        toast.success('Category deleted');
        await loadCategoriesAndFeatures(accessToken);
      } else {
        toast.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleAddFeature = async () => {
    if (!newFeatureName.trim()) {
      toast.error('Please enter a feature name');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/features`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newFeatureName }),
        }
      );

      if (response.ok) {
        toast.success('Feature added successfully');
        setNewFeatureName('');
        await loadCategoriesAndFeatures(accessToken);
      } else {
        toast.error('Failed to add feature');
      }
    } catch (error) {
      console.error('Error adding feature:', error);
      toast.error('Failed to add feature');
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Delete this feature?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/features/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        toast.success('Feature deleted');
        await loadCategoriesAndFeatures(accessToken);
      } else {
        toast.error('Failed to delete feature');
      }
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error('Failed to delete feature');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      category: 'Living Room', // Default category
    }));
    setFormData({
      ...formData,
      categorizedImages: [...formData.categorizedImages, ...newImages],
    });
  };

  const handleImageCategoryChange = (index: number, category: string) => {
    const updatedImages = [...formData.categorizedImages];
    updatedImages[index].category = category;
    setFormData({ ...formData, categorizedImages: updatedImages });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = formData.categorizedImages.filter((_, i) => i !== index);
    setFormData({ ...formData, categorizedImages: updatedImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setSaving(true);

    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: formData.area ? Number(formData.area) : 0,
        type: formData.type,
        amenities: formData.selectedAmenities,
        images: formData.categorizedImages.map(img => img.url || '').filter(url => url),
        categorizedImages: formData.categorizedImages,
        available: true,
      };

      const url = editingProperty
        ? `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/properties/${editingProperty.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/properties`;

      const response = await fetch(url, {
        method: editingProperty ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        toast.success(editingProperty ? 'Property updated!' : 'Property added!');
        setDialogOpen(false);
        setFormData(initialFormState);
        setEditingProperty(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save property');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      price: property.price.toString(),
      location: property.location,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area.toString(),
      type: property.type,
      selectedAmenities: property.amenities,
      categorizedImages: property.categorizedImages || property.images.map(url => ({ url, category: 'Living Room' })),
      available: true,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/properties/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Property deleted');
      } else {
        toast.error('Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProperty(null);
    setFormData(initialFormState);
  };

  const handleSeedProperties = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    toast.info('Seeding sample properties...');
    
    try {
      const results = await seedSampleProperties(session.access_token, projectId);
      const successCount = results.filter((r: any) => r.success).length;
      
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} sample properties!`);
      } else {
        toast.error('Failed to seed properties');
      }
    } catch (error) {
      console.error('Error seeding properties:', error);
      toast.error('Failed to seed properties');
    }
  };

  const initializeDefaultCategories = async () => {
    const defaultCategories = ['Studio', '1 BR', '2 BR', '3 BR', '4 BR'];
    
    for (const cat of defaultCategories) {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/categories`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: cat }),
          }
        );
      } catch (error) {
        console.error('Error adding default category:', error);
      }
    }
    
    toast.success('Default categories added!');
    await loadCategoriesAndFeatures(accessToken);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Manage Properties</h1>
          
          <div className="flex gap-2">
            {/* Add Categories Dialog */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  <Layers className="w-4 h-4 mr-2" />
                  Add Categories
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Manage Categories</DialogTitle>
                  <DialogDescription>
                    Add and manage property categories like Studio, 1 BR, 2 BR, etc.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter category name (e.g., Studio, 1 BR)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button onClick={handleAddCategory}>Add</Button>
                  </div>

                  {categories.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-2">No categories yet</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={initializeDefaultCategories}
                      >
                        Add Default Categories
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="font-medium">{category.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Features Dialog */}
            <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                  <Tag className="w-4 h-4 mr-2" />
                  Add Features
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Manage Features</DialogTitle>
                  <DialogDescription>
                    Add and manage property features and amenities like WiFi, Pool, Gym, etc.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter feature name (e.g., WiFi, Pool)"
                      value={newFeatureName}
                      onChange={(e) => setNewFeatureName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                    />
                    <Button onClick={handleAddFeature}>Add</Button>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <span className="font-medium">{feature.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeature(feature.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {features.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No features yet. Add your first feature!</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Property Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProperty ? 'Edit Property' : 'Add New Property'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProperty 
                      ? 'Update property details, images, and amenities.' 
                      : 'Fill in the property details, upload images, and select amenities.'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Ksh / Day</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="50000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">No. of Beds</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                        placeholder="2"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                        placeholder="2"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area">Area (m²)</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="120"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Property Category</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="none" disabled>No categories available</SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {categories.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Please add categories first using the "Add Categories" button
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Amenities/Features</Label>
                    {features.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No features available. Please add features first using the "Add Features" button.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg max-h-48 overflow-y-auto">
                        {features.map((feature) => (
                          <div key={feature.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`feature-${feature.id}`}
                              checked={formData.selectedAmenities.includes(feature.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    selectedAmenities: [...formData.selectedAmenities, feature.name],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedAmenities: formData.selectedAmenities.filter(
                                      (a) => a !== feature.name
                                    ),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={`feature-${feature.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {feature.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageFiles">Property Images</Label>
                    <Input
                      id="imageFiles"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload images and categorize them by room type
                    </p>
                  </div>

                  {formData.categorizedImages.length > 0 && (
                    <div className="space-y-3 p-4 border rounded-lg">
                      <Label>Categorize Images ({formData.categorizedImages.length})</Label>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {formData.categorizedImages.map((img, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium truncate">
                                {img.file?.name || img.url || 'Image'}
                              </p>
                            </div>
                            <Select
                              value={img.category}
                              onValueChange={(value) => handleImageCategoryChange(index, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {IMAGE_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {saving && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {editingProperty ? 'Updating property...' : 'Saving property...'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-accent hover:bg-accent/90" 
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingProperty ? 'Updating...' : 'Saving...'}
                        </>
                      ) : (
                        editingProperty ? 'Update Property' : 'Add Property'
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleDialogClose} disabled={saving}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xl text-muted-foreground">No properties yet. Add your first property!</p>
              <Button
                className="mt-4 bg-accent hover:bg-accent/90"
                onClick={handleSeedProperties}
              >
                <Database className="w-4 h-4 mr-2" />
                Seed Sample Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Beds/Baths</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.location}</TableCell>
                    <TableCell>{property.type}</TableCell>
                    <TableCell>Ksh {property.price.toLocaleString()}</TableCell>
                    <TableCell>{property.bedrooms}BD / {property.bathrooms}BA</TableCell>
                    <TableCell>
                      <Badge variant={property.available ? 'default' : 'secondary'}>
                        {property.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(property)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(property.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </Layout>
  );
}