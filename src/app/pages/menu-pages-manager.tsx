import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  FileText,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Header } from '../components/header';
import { RichTextEditor } from '../components/rich-text-editor';
import { getCurrentUser } from '../lib/auth';
import { CustomModal } from '../components/custom-modal';
import { 
  fetchMenuPages, 
  createMenuPage, 
  updateMenuPage, 
  deleteMenuPage 
} from '../../lib/supabaseData';

type MenuItemType = 'custom' | 'internal' | 'external';

interface MenuItem {
  id: number;
  type: MenuItemType;
  title: string;
  url?: string;
  slug?: string;
  content?: string;
  showInMenu: boolean;
  order: number;
  createdAt: string;
}

export function MenuPagesManager() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeModal, setActiveModal] = useState<'create' | 'link' | 'external' | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for Create Page
  const [createPageForm, setCreatePageForm] = useState({
    title: '',
    slug: '',
    content: ''
  });

  // Form states for Link Page
  const [linkPageForm, setLinkPageForm] = useState({
    title: '',
    url: '/'
  });

  // Form states for External Link
  const [externalLinkForm, setExternalLinkForm] = useState({
    title: '',
    url: 'https://'
  });

  // Modal States
  const [modalState, setModalState] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'confirm' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Show Modal Helper
  const showModal = (
    type: 'success' | 'error' | 'confirm' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText = 'OK',
    cancelText = 'Cancel'
  ) => {
    setModalState({
      show: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      onCancel: () => setModalState({ ...modalState, show: false })
    });
  };

  // Close modal
  const closeModal = () => {
    setActiveModal(null);
    setEditingItem(null);
    setCreatePageForm({ title: '', slug: '', content: '' });
    setLinkPageForm({ title: '', url: '/' });
    setExternalLinkForm({ title: '', url: 'https://' });
    setModalState({ ...modalState, show: false });
  };

  // Handle Modal Confirm
  const handleModalConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    closeModal();
  };

  // Load menu items
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const pages = await fetchMenuPages();
        // Convert Supabase format to local format
        const items = pages.map(page => ({
          id: page.page_id,
          type: (page.page_slug.startsWith('/') ? 'internal' : 'custom') as MenuItemType,
          title: page.page_name,
          url: page.page_slug.startsWith('/') ? page.page_slug : undefined,
          slug: !page.page_slug.startsWith('/') ? page.page_slug : undefined,
          content: page.page_content || '',
          showInMenu: page.is_published,
          order: page.display_order,
          createdAt: page.created_at
        }));
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to load menu pages:', error);
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadMenuItems();
  }, []);

  // Reload menu items and trigger header update
  const reloadMenuItems = async () => {
    try {
      const pages = await fetchMenuPages();
      const items = pages.map(page => ({
        id: page.page_id,
        type: (page.page_slug.startsWith('/') ? 'internal' : 'custom') as MenuItemType,
        title: page.page_name,
        url: page.page_slug.startsWith('/') ? page.page_slug : undefined,
        slug: !page.page_slug.startsWith('/') ? page.page_slug : undefined,
        content: page.page_content || '',
        showInMenu: page.is_published,
        order: page.display_order,
        createdAt: page.created_at
      }));
      setMenuItems(items);
      window.dispatchEvent(new Event('menuItemsUpdated'));
    } catch (error) {
      console.error('Failed to reload menu pages:', error);
    }
  };

  // Save menu items
  const saveMenuItems = (items: MenuItem[]) => {
    localStorage.setItem('skyway_menu_items', JSON.stringify(items));
    setMenuItems(items);
    // Trigger event to update header
    window.dispatchEvent(new Event('menuItemsUpdated'));
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle Create Page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = createPageForm.slug || generateSlug(createPageForm.title);
    
    // Check if slug already exists
    if (menuItems.some(item => item.type === 'custom' && item.slug === slug)) {
      showModal('error', 'Error', 'A page with this URL slug already exists!');
      return;
    }

    const newItem: MenuItem = {
      id: Date.now(),
      type: 'custom',
      title: createPageForm.title,
      slug: slug,
      content: createPageForm.content,
      showInMenu: true,
      order: menuItems.length,
      createdAt: new Date().toISOString()
    };

    const createdItem = await createMenuPage(newItem);
    if (createdItem) {
      setMenuItems([...menuItems, createdItem]);
      setCreatePageForm({ title: '', slug: '', content: '' });
      setActiveModal(null);
      showModal('success', 'Success', 'Page created successfully!');
    } else {
      showModal('error', 'Error', 'Failed to create page!');
    }
  };

  // Handle Link Internal Page
  const handleLinkPage = async (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: MenuItem = {
      id: Date.now(),
      type: 'internal',
      title: linkPageForm.title,
      url: linkPageForm.url,
      showInMenu: true,
      order: menuItems.length,
      createdAt: new Date().toISOString()
    };

    const createdItem = await createMenuPage(newItem);
    if (createdItem) {
      setMenuItems([...menuItems, createdItem]);
      setLinkPageForm({ title: '', url: '/' });
      setActiveModal(null);
      showModal('success', 'Success', 'Internal link added successfully!');
    } else {
      showModal('error', 'Error', 'Failed to add internal link!');
    }
  };

  // Handle Add External Link
  const handleAddExternal = async (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: MenuItem = {
      id: Date.now(),
      type: 'external',
      title: externalLinkForm.title,
      url: externalLinkForm.url,
      showInMenu: true,
      order: menuItems.length,
      createdAt: new Date().toISOString()
    };

    const createdItem = await createMenuPage(newItem);
    if (createdItem) {
      setMenuItems([...menuItems, createdItem]);
      setExternalLinkForm({ title: '', url: 'https://' });
      setActiveModal(null);
      showModal('success', 'Success', 'External link added successfully!');
    } else {
      showModal('error', 'Error', 'Failed to add external link!');
    }
  };

  // Toggle visibility
  const toggleVisibility = (id: number) => {
    const updatedItems = menuItems.map(item =>
      item.id === id ? { ...item, showInMenu: !item.showInMenu } : item
    );
    saveMenuItems(updatedItems);
  };

  // Delete item
  const handleDelete = (id: number) => {
    showModal(
      'confirm',
      'Confirm Delete',
      'Are you sure you want to delete this menu item?',
      () => {
        const updatedItems = menuItems.filter(item => item.id !== id);
        deleteMenuPage(id);
        saveMenuItems(updatedItems);
      }
    );
  };

  // Edit item
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    if (item.type === 'custom') {
      setCreatePageForm({
        title: item.title,
        slug: item.slug || '',
        content: item.content || ''
      });
      setActiveModal('create');
    } else if (item.type === 'internal') {
      setLinkPageForm({
        title: item.title,
        url: item.url || '/'
      });
      setActiveModal('link');
    } else if (item.type === 'external') {
      setExternalLinkForm({
        title: item.title,
        url: item.url || 'https://'
      });
      setActiveModal('external');
    }
  };

  // Update existing item
  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const slug = createPageForm.slug || generateSlug(createPageForm.title);
    
    // Check if slug already exists (excluding current item)
    if (menuItems.some(item => 
      item.type === 'custom' && 
      item.slug === slug && 
      item.id !== editingItem.id
    )) {
      showModal('error', 'Error', 'A page with this URL slug already exists!');
      return;
    }

    const updatedItems = menuItems.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            title: createPageForm.title,
            slug: slug,
            content: createPageForm.content
          }
        : item
    );

    const updatedItem = await updateMenuPage(editingItem.id, {
      title: createPageForm.title,
      slug: slug,
      content: createPageForm.content
    });

    if (updatedItem) {
      saveMenuItems(updatedItems);
      setCreatePageForm({ title: '', slug: '', content: '' });
      setEditingItem(null);
      setActiveModal(null);
      showModal('success', 'Success', 'Page updated successfully!');
    } else {
      showModal('error', 'Error', 'Failed to update page!');
    }
  };

  const handleUpdateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedItems = menuItems.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            title: linkPageForm.title,
            url: linkPageForm.url
          }
        : item
    );

    const updatedItem = await updateMenuPage(editingItem.id, {
      title: linkPageForm.title,
      url: linkPageForm.url
    });

    if (updatedItem) {
      saveMenuItems(updatedItems);
      setLinkPageForm({ title: '', url: '/' });
      setEditingItem(null);
      setActiveModal(null);
      showModal('success', 'Success', 'Link updated successfully!');
    } else {
      showModal('error', 'Error', 'Failed to update link!');
    }
  };

  const handleUpdateExternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedItems = menuItems.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            title: externalLinkForm.title,
            url: externalLinkForm.url
          }
        : item
    );

    const updatedItem = await updateMenuPage(editingItem.id, {
      title: externalLinkForm.title,
      url: externalLinkForm.url
    });

    if (updatedItem) {
      saveMenuItems(updatedItems);
      setExternalLinkForm({ title: '', url: 'https://' });
      setEditingItem(null);
      setActiveModal(null);
      showModal('success', 'Success', 'External link updated successfully!');
    } else {
      showModal('error', 'Error', 'Failed to update external link!');
    }
  };

  // Preview page
  const handlePreview = (item: MenuItem) => {
    if (item.type === 'custom') {
      window.open(`/page/${item.slug}`, '_blank');
    } else if (item.type === 'internal') {
      window.open(item.url, '_blank');
    } else if (item.type === 'external') {
      window.open(item.url, '_blank');
    }
  };

  const internalPages = [
    { label: 'Home', value: '/' },
    { label: 'Properties', value: '/properties' },
    { label: 'Login', value: '/login' },
    { label: 'Sign Up', value: '/signup' },
    { label: 'Admin Dashboard', value: '/admin/dashboard' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF4EC]">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6 text-[#36454F] hover:text-[#6B7F39]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#36454F] mb-2">Menu Pages Manager</h1>
          <p className="text-gray-600">Add pages and links to your site's main navigation</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => setActiveModal('create')}
            className="bg-[#6B7F39] hover:bg-[#5a6930] h-auto py-6 flex-col gap-2"
          >
            <FileText className="w-8 h-8" />
            <div>
              <div className="font-bold">Create Page</div>
              <div className="text-xs opacity-90">WordPress-style page with rich editor</div>
            </div>
          </Button>

          <Button
            onClick={() => setActiveModal('link')}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50 h-auto py-6 flex-col gap-2"
          >
            <LinkIcon className="w-8 h-8" />
            <div>
              <div className="font-bold">Link Page</div>
              <div className="text-xs opacity-90">Link to internal pages in app</div>
            </div>
          </Button>

          <Button
            onClick={() => setActiveModal('external')}
            variant="outline"
            className="border-orange-500 text-orange-600 hover:bg-orange-50 h-auto py-6 flex-col gap-2"
          >
            <ExternalLink className="w-8 h-8" />
            <div>
              <div className="font-bold">Add External</div>
              <div className="text-xs opacity-90">Link to external websites</div>
            </div>
          </Button>
        </div>

        {/* Menu Items List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#36454F]">Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Loading menu items...</p>
              </div>
            ) : menuItems.length > 0 ? (
              <div className="space-y-3">
                {menuItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-[#FAF4EC] rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#36454F]">{item.title}</h3>
                            {item.type === 'custom' && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Custom Page
                              </span>
                            )}
                            {item.type === 'internal' && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Internal Link
                              </span>
                            )}
                            {item.type === 'external' && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                External Link
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {item.type === 'custom' && `/page/${item.slug}`}
                            {item.type === 'internal' && item.url}
                            {item.type === 'external' && item.url}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleVisibility(item.id)}
                          className={item.showInMenu ? 'text-green-600' : 'text-gray-400'}
                        >
                          {item.showInMenu ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePreview(item)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          className="text-[#6B7F39] hover:text-[#5a6930]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No menu items yet</p>
                <p className="text-sm">Create your first page or link using the buttons above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Page Modal */}
      {activeModal === 'create' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#36454F]">
                  {editingItem ? 'Edit Page' : 'Create New Page'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editingItem ? handleUpdatePage : handleCreatePage} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title *
                    </label>
                    <Input
                      value={createPageForm.title}
                      onChange={(e) => {
                        setCreatePageForm({
                          ...createPageForm,
                          title: e.target.value,
                          slug: createPageForm.slug || generateSlug(e.target.value)
                        });
                      }}
                      placeholder="About Us"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <Input
                      value={createPageForm.slug}
                      onChange={(e) => setCreatePageForm({ ...createPageForm, slug: e.target.value })}
                      placeholder="about-us"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Page will be available at: /page/{createPageForm.slug || 'your-slug'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Content *
                  </label>
                  <RichTextEditor
                    value={createPageForm.content}
                    onChange={(value) => setCreatePageForm({ ...createPageForm, content: value })}
                    placeholder="Start writing your page content here..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingItem ? 'Update Page' : 'Create Page'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Link Internal Page Modal */}
      {activeModal === 'link' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#36454F]">
                  {editingItem ? 'Edit Internal Link' : 'Link Internal Page'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editingItem ? handleUpdateLink : handleLinkPage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Title *
                  </label>
                  <Input
                    value={linkPageForm.title}
                    onChange={(e) => setLinkPageForm({ ...linkPageForm, title: e.target.value })}
                    placeholder="Home"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Page *
                  </label>
                  <Select
                    value={linkPageForm.url}
                    onValueChange={(value) => setLinkPageForm({ ...linkPageForm, url: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {internalPages.map((page) => (
                        <SelectItem key={page.value} value={page.value}>
                          {page.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingItem ? 'Update Link' : 'Add Link'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add External Link Modal */}
      {activeModal === 'external' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#36454F]">
                  {editingItem ? 'Edit External Link' : 'Add External Link'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={editingItem ? handleUpdateExternal : handleAddExternal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menu Title *
                  </label>
                  <Input
                    value={externalLinkForm.title}
                    onChange={(e) => setExternalLinkForm({ ...externalLinkForm, title: e.target.value })}
                    placeholder="Google"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External URL *
                  </label>
                  <Input
                    type="url"
                    value={externalLinkForm.url}
                    onChange={(e) => setExternalLinkForm({ ...externalLinkForm, url: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingItem ? 'Update Link' : 'Add Link'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      <CustomModal
        show={modalState.show}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </div>
  );
}