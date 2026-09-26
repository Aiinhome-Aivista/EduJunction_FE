import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  ExternalLink,
  Tag,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import ApiServices from '../../services/ApiServices';

export interface SeoItem {
  id: number;
  page_route: string;
  page_name: string;
  title: string;
  description?: string;
  keywords?: string;
  og_image?: string;
  canonical_url?: string;
  is_active: boolean;
}

export const SeoAdminManager: React.FC = () => {
  const [seoList, setSeoList] = useState<SeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeoItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formRoute, setFormRoute] = useState('');
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formOgImage, setFormOgImage] = useState('');
  const [formCanonicalUrl, setFormCanonicalUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<SeoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSeoItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiServices.listSeoMetadata();
      const list = Array.isArray(res) ? res : res?.items || res?.data || [];
      setSeoList(list);
    } catch (err: any) {
      console.error('Failed to load SEO metadata:', err);
      showToast('error', 'Failed to fetch SEO metadata.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeoItems();
  }, [fetchSeoItems]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormRoute('/');
    setFormName('');
    setFormTitle('');
    setFormDescription('');
    setFormKeywords('');
    setFormOgImage('');
    setFormCanonicalUrl('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SeoItem) => {
    setEditingItem(item);
    setFormRoute(item.page_route);
    setFormName(item.page_name);
    setFormTitle(item.title);
    setFormDescription(item.description || '');
    setFormKeywords(item.keywords || '');
    setFormOgImage(item.og_image || '');
    setFormCanonicalUrl(item.canonical_url || '');
    setFormIsActive(item.is_active !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoute.trim() || !formName.trim() || !formTitle.trim()) {
      showToast('error', 'Page Route, Page Name, and Meta Title are required.');
      return;
    }

    setIsSaving(true);
    try {
      await ApiServices.saveSeoMetadata({
        id: editingItem?.id,
        page_route: formRoute.trim(),
        page_name: formName.trim(),
        title: formTitle.trim(),
        description: formDescription.trim(),
        keywords: formKeywords.trim(),
        og_image: formOgImage.trim(),
        canonical_url: formCanonicalUrl.trim(),
        is_active: formIsActive,
      });

      showToast('success', `SEO meta tags for "${formName}" saved successfully!`);
      setIsModalOpen(false);
      fetchSeoItems();
    } catch (err: any) {
      console.error('Failed to save SEO item:', err);
      showToast('error', err?.response?.data?.message || 'Failed to save SEO meta tags.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await ApiServices.deleteSeoMetadata(itemToDelete.id);
      showToast('success', `SEO item "${itemToDelete.page_name}" deleted.`);
      setItemToDelete(null);
      fetchSeoItems();
    } catch (err: any) {
      console.error('Failed to delete SEO item:', err);
      showToast('error', 'Failed to delete SEO item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = seoList.filter((item) =>
    item.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.page_route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xl border backdrop-blur-md animate-in fade-in duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400'
              : 'bg-rose-500/95 text-white border-rose-400'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-black text-stone-900">SEO & Meta Tags Manager</h1>
          </div>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Manage dynamic Page Titles, Meta Descriptions, OpenGraph images, and Canonical URLs across pages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by route or title..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add New SEO Route
          </button>
        </div>
      </div>

      {/* SEO Items Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Page Route & Name</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">SEO Title & Meta Description</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Status</th>
                <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      <span>Loading SEO metadata...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400 font-medium">
                    No SEO metadata records found. Click <strong>+ Add New SEO Route</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-stone-900 border border-yellow-200">
                          {item.page_route}
                        </span>
                        <span className="font-bold text-stone-900 text-xs">{item.page_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="font-bold text-stone-900 text-xs truncate">{item.title}</p>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{item.description || 'No description provided.'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          item.is_active !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_active !== false ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                        {item.is_active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition-all cursor-pointer"
                          title="Edit SEO Tags"
                        >
                          <Edit2 className="w-4 h-4 stroke-[2.2]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all cursor-pointer"
                          title="Delete SEO Route"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit SEO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-100 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    {editingItem ? 'Edit SEO Meta Tags' : 'Add New SEO Route'}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">Configure page title, meta description, and social share metadata.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Page Route *</label>
                  <input
                    type="text"
                    value={formRoute}
                    onChange={(e) => setFormRoute(e.target.value)}
                    placeholder="e.g. /about or /blog"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Page Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. About Us"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">SEO Meta Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. About Us – EduJunction | Next-Gen AI Learning"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Meta Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the page content for search engines (150-160 characters recommended)..."
                  rows={3}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="e.g. EduJunction, CBSE model papers, AI exam evaluation"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">OpenGraph Image URL</label>
                  <input
                    type="text"
                    value={formOgImage}
                    onChange={(e) => setFormOgImage(e.target.value)}
                    placeholder="https://www.edujunction.co.in/og-banner.png"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={formCanonicalUrl}
                    onChange={(e) => setFormCanonicalUrl(e.target.value)}
                    placeholder="https://www.edujunction.co.in/about"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="seo-is-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-yellow-500 rounded-md border-stone-300 focus:ring-yellow-400 cursor-pointer"
                />
                <label htmlFor="seo-is-active" className="text-xs font-bold text-stone-700 cursor-pointer">
                  Enable active SEO rendering for this route
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-black shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save SEO Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900">Delete SEO Route?</h3>
            <p className="text-xs text-stone-500 font-medium">
              Are you sure you want to delete the SEO meta tags for <strong>{itemToDelete.page_name}</strong> ({itemToDelete.page_route})?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete SEO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
