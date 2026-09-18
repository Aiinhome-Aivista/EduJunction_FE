import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Menu,
  X,
  Bell,
  TrendingUp,
  UserCheck,
  BookMarked,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  Activity,
  GraduationCap,
  CheckCircle2,
  Play,
  Bot,
  FileText,
  Trophy,
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  Globe,
  Tag as TagIcon,
  Pin,
  Filter,
  Image as ImageIcon,
} from 'lucide-react';
import ApiServices, {
  storeTokens,
  decodeTokenPayload,
  clearTokens,
  getStoredTokens,
} from '../../services/ApiServices';
import { BASE_URL } from '../../connection';
import { BOARD_CLASSES_MAP, CLASS_SUBJECTS_MAP } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import 'jodit/es2021/jodit.min.css';
import { lazy, Suspense } from 'react';
import { AcademicsHub } from './AcademicsHub';
import { AiRagHub } from './AiRagHub';

const JoditEditor = lazy(() => import('jodit-react'));

const BLOG_EDITOR_CONFIG = {
  readonly: false,
  enter: 'p',
  toolbarAdaptive: false,
  toolbarSticky: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  cleanHTML: {
    safeJavaScriptLink: true,
    safeLinksTarget: true,
  },
  link: {
    followOnDblClick: true,
    openInNewTabCheckbox: true,
    openInNewTabCheckboxDefaultChecked: true,
    noFollowCheckbox: true,
    processVideoLink: false,
  },
  buttons: 'bold,italic,underline,|,paragraph,|,ul,ol,|,align,|,link,|,undo,redo,|,source',
  buttonsXS: 'bold,italic,underline,|,paragraph,|,ul,ol,|,align,|,link,|,undo,redo',
};

const INTRODUCTION_EDITOR_CONFIG = {
  ...BLOG_EDITOR_CONFIG,
  height: 240,
  placeholder: 'Write the introduction...',
};

const BLOG_CONTENT_EDITOR_CONFIG = {
  ...BLOG_EDITOR_CONFIG,
  minHeight: 380,
  height: 420,
  placeholder: 'Write the blog content here...',
};

const BlogEditPage: React.FC<{ blogId: string; onBack: () => void; onSaved: () => void }> = ({ blogId, onBack, onSaved }) => {
  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiServices.listBlogs({ status: 'all' })
      .then((response: any) => {
        const records = Array.isArray(response) ? response : response?.items || response?.data || [];
        setBlog(records.find((item: any) => String(item.id) === String(blogId)) || null);
      })
      .catch((err: any) => setError(err?.message || 'Failed to load blog'))
      .finally(() => setLoading(false));
  }, [blogId]);

  if (loading) return <div className="py-24 text-center text-stone-500 font-medium">Loading blog editor...</div>;
  if (!blog) return <div className="py-24 text-center text-rose-600 font-semibold">{error || 'Blog not found'}</div>;

  return (
    <div className="w-full">
      <BlogFormModal
        isOpen
        fullPage
        initialBlog={blog}
        onClose={onBack}
        onSuccess={() => { onSaved(); onBack(); }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type AdminView = string;

// ─────────────────────────────────────────────────────────────
// Stat Card Component
// ─────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  subText?: string;
  theme?: 'yellow' | 'emerald' | 'blue' | 'rose';
  positive?: boolean;
  accent?: string;
}

const themeStyles = {
  yellow: {
    gradient: 'from-yellow-50 to-orange-50',
    border: 'border-yellow-200/80 hover:border-yellow-400',
    glow: 'bg-yellow-400',
    title: 'text-yellow-900',
    badge: 'bg-yellow-200/70 text-yellow-900 border-yellow-300/60',
    subText: 'text-yellow-800',
  },
  emerald: {
    gradient: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200/80 hover:border-emerald-400',
    glow: 'bg-emerald-400',
    title: 'text-emerald-900',
    badge: 'bg-emerald-200/70 text-emerald-900 border-emerald-300/60',
    subText: 'text-emerald-700',
  },
  blue: {
    gradient: 'from-blue-50 to-indigo-50',
    border: 'border-blue-200/80 hover:border-blue-400',
    glow: 'bg-blue-400',
    title: 'text-blue-900',
    badge: 'bg-blue-200/70 text-blue-900 border-blue-300/60',
    subText: 'text-blue-700',
  },
  rose: {
    gradient: 'from-rose-50 to-pink-50',
    border: 'border-rose-200/80 hover:border-rose-400',
    glow: 'bg-rose-400',
    title: 'text-rose-900',
    badge: 'bg-rose-200/70 text-rose-900 border-rose-300/60',
    subText: 'text-rose-700',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  change,
  subText,
  theme = 'yellow',
}) => {
  const t = themeStyles[theme] || themeStyles.yellow;

  return (
    <div className={`bg-gradient-to-br ${t.gradient} p-4 rounded-2xl border ${t.border} shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-md hover:scale-[1.01] transition-all`}>
      <div className={`absolute -right-4 -top-4 w-20 h-20 ${t.glow} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-white shadow-xs flex items-center justify-center">
            {icon}
          </div>
          <span className={`text-xs font-bold ${t.title} uppercase tracking-wider`}>{label}</span>
        </div>
        <span className={`text-[10px] font-bold ${t.badge} px-2 py-0.5 rounded-full border shadow-2xs`}>
          {change}
        </span>
      </div>
      <div className="flex items-end justify-between relative z-10 mt-1">
        <div>
          <p className="text-2xl font-black text-stone-900">{value}</p>
          <p className={`text-[10px] ${t.subText} font-semibold mt-0.5`}>
            {subText || label}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Sidebar Nav Item
// ─────────────────────────────────────────────────────────────
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  id: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick, id }) => (
  <button
    id={id}
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`group w-full flex items-center py-2.5 rounded-xl text-sm transition-all relative overflow-hidden
      ${collapsed ? 'justify-center px-0 gap-3' : 'gap-3 px-3'}
      ${active
        ? 'text-yellow-700 font-bold bg-gradient-to-r from-yellow-50 to-white shadow-sm border border-yellow-100/50'
        : 'text-stone-500 font-medium hover:text-stone-900 hover:bg-stone-50 border border-transparent'
      }
    `}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-yellow-400 rounded-r-full"></div>}
    <div className={`w-4 h-4 flex-shrink-0 transition-colors relative z-10 ${active ? 'text-yellow-600' : 'text-stone-400 group-hover:text-stone-500'}`}>
      {icon}
    </div>
    {!collapsed && <span className="truncate relative z-10">{label}</span>}
  </button>
);

// ─────────────────────────────────────────────────────────────
// Shared Full-Featured Blog Editor Modal
// ─────────────────────────────────────────────────────────────
interface BlogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBlog?: any | null;
  onSuccess: () => void;
  fullPage?: boolean;
}

const BlogFormModal: React.FC<BlogFormModalProps> = ({
  isOpen,
  onClose,
  initialBlog,
  onSuccess,
  fullPage = false,
}) => {
  const [title, setTitle] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [author, setAuthor] = useState('Admin User');
  const [category, setCategory] = useState('Education');
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [blogDate, setBlogDate] = useState('');

  // SEO Accordion
  const [showSeo, setShowSeo] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // State & Loading
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [categories, setCategories] = useState<string[]>([
    'Education',
    'Technology',
    'Engineering',
    'Parenting',
    'Platform News',
  ]);
  const [authors, setAuthors] = useState<string[]>([
    'Admin User',
    'Sonia Khatun',
    'Tech Team',
  ]);

  useEffect(() => {
    if (!isOpen) return;
    ApiServices.listBlogCategories()
      .then((res: any) => {
        const catList = Array.isArray(res) ? res : res?.data || [];
        if (Array.isArray(catList) && catList.length > 0) {
          const names = catList.map((c: any) => c.name);
          setCategories(prev => Array.from(new Set([...names, ...prev])));
        }
      })
      .catch(() => { });

    ApiServices.listBlogAuthors()
      .then((res: any) => {
        const authList = Array.isArray(res) ? res : res?.data || [];
        if (Array.isArray(authList) && authList.length > 0) {
          const names = authList.map((a: any) => a.name);
          setAuthors(prev => Array.from(new Set([...names, ...prev])));
        }
      })
      .catch(() => { });
  }, [isOpen]);

  useEffect(() => {
    if (initialBlog) {
      setTitle(initialBlog.title || '');
      setIntroduction(initialBlog.introduction || '');
      setContent(initialBlog.content || '');
      setCoverImage(initialBlog.imageUrl || initialBlog.image_url || initialBlog.image || '');
      setTags(
        Array.isArray(initialBlog.tags)
          ? initialBlog.tags
          : typeof initialBlog.tags === 'string'
            ? initialBlog.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : []
      );
      setMetaTitle(initialBlog.metaTitle || initialBlog.meta_title || '');
      setMetaDescription(initialBlog.metaDescription || initialBlog.meta_description || '');
      setMetaKeywords(initialBlog.metaKeywords || initialBlog.meta_keywords || '');
      setCanonicalUrl(initialBlog.canonicalUrl || initialBlog.canonical_url || '');
      setIsPinned(Boolean(initialBlog.isPinned ?? initialBlog.is_pinned));
      setAuthor(initialBlog.author || 'Admin User');
      setCategory(initialBlog.category || 'Education');
      setStatus(initialBlog.status === 'Draft' ? 'Draft' : 'Published');
      setBlogDate(
        initialBlog.isoDate
          ? initialBlog.isoDate.slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
    } else {
      setTitle('');
      setIntroduction('');
      setContent('');
      setCoverImage('');
      setTags([]);
      setTagInput('');
      setMetaTitle('');
      setMetaDescription('');
      setMetaKeywords('');
      setCanonicalUrl('');
      setIsPinned(false);
      setAuthor('Admin User');
      setCategory('Education');
      setStatus('Published');
      setBlogDate(new Date().toISOString().slice(0, 10));
    }
    setError(null);
    setFieldErrors({});
  }, [initialBlog, isOpen]);

  if (!isOpen) return null;

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const result = await ApiServices.uploadBlogImage(file);
      const url = result.url?.startsWith('http') ? result.url : `${BASE_URL || ''}${result.url}`;
      return url;
    } finally {
      setUploading(false);
    }
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Maximum allowed size is 5MB.');
      return;
    }
    try {
      const url = await uploadImage(file);
      setCoverImage(url);
      setFieldErrors(prev => ({ ...prev, coverImage: '' }));
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload cover image');
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^,+|,+$/g, '');
      if (clean && !tags.includes(clean)) {
        if (tags.length >= 5) {
          setError('You can add up to 5 tags maximum.');
          return;
        }
        setTags([...tags, clean]);
        setTagInput('');
        setError(null);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const nextStatus =
      submitter?.value === 'Draft' || submitter?.value === 'Published'
        ? (submitter.value as 'Published' | 'Draft')
        : status;

    // Field-level validation
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Blog title is required.';
    if (!content.trim() || content === '<p><br></p>') errors.content = 'Blog content body is required.';
    if (!coverImage) errors.coverImage = 'Cover image is required for publishing.';
    if (!category) errors.category = 'Please select a category.';
    if (!author) errors.author = 'Please select an author.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please provide all mandatory fields marked in red.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        introduction: introduction.trim(),
        content: content.trim(),
        image_url: coverImage,
        is_pinned: isPinned,
        tags: tags,
        meta_title: metaTitle.trim() || title.trim(),
        meta_description: metaDescription.trim() || introduction.trim(),
        meta_keywords: metaKeywords.trim() || tags.join(', '),
        canonical_url: canonicalUrl.trim(),
        author: author.trim(),
        category: category.trim(),
        status: nextStatus,
        date: blogDate || new Date().toISOString().slice(0, 10),
      };

      if (initialBlog?.id) {
        await ApiServices.updateBlog(initialBlog.id, payload);
      } else {
        await ApiServices.createBlog(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to save blog post'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        fullPage
          ? 'w-full pb-10'
          : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200'
      }
    >
      <div
        className={
          fullPage
            ? 'bg-white rounded-3xl border border-stone-200/90 shadow-xs w-full overflow-hidden flex flex-col'
            : 'bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[92vh]'
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3.5">
            {fullPage && (
              <button
                type="button"
                onClick={() => {
                  if (title || content) {
                    if (!confirm('You may have unsaved changes. Are you sure you want to go back?')) return;
                  }
                  onClose();
                }}
                className="p-2 -ml-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
                title="Back to Blog List"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900">
                {initialBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {initialBlog ? 'Update article details, rich content and search metadata' : 'Publish a new curriculum blog post to EduJunction Journal'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (title || content) {
                if (!confirm('You may have unsaved changes. Are you sure you want to close?')) return;
              }
              onClose();
            }}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2.5 animate-in fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Main Column: Title, Excerpt, Content Editor */}
            <div className="xl:col-span-8 space-y-6">
              {/* Blog Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Blog Title <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium">{title.length} chars</span>
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g. 10 Essential Tips for Effective Diagnostic Exam Preparation"
                  className={`w-full px-4 py-3 bg-stone-50 border rounded-2xl text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:bg-white transition-all ${fieldErrors.title
                    ? 'border-rose-400 focus:ring-rose-300 bg-rose-50/30'
                    : 'border-stone-200 focus:ring-amber-400'
                    }`}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.title}</p>
                )}
              </div>

              {/* Short Summary / Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Short Summary / Excerpt
                  </label>
                  <span className={`text-[11px] font-medium ${introduction.length > 250 ? 'text-rose-600 font-bold' : 'text-stone-400'}`}>
                    {introduction.length}/250 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={250}
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="A concise 2-3 line overview shown on blog cards, search snippet previews, and social cards..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none transition-all leading-relaxed"
                />
              </div>

              {/* Main Article Content */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Blog Article Content <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-400 font-medium">Rich Text Body</span>
                </div>
                <div
                  className={`rounded-2xl overflow-hidden border transition-all ${fieldErrors.content ? 'border-rose-400 ring-2 ring-rose-200' : 'border-stone-200'
                    }`}
                >
                  <Suspense
                    fallback={
                      <div className="h-80 flex items-center justify-center text-xs text-stone-400 font-medium">
                        <Loader2 className="w-5 h-5 animate-spin mr-2 text-amber-500" />
                        Loading Rich Text Editor...
                      </div>
                    }
                  >
                    <JoditEditor
                      key={`blog-content-editor-${initialBlog?.id ?? 'new'}`}
                      value={content}
                      onChange={(value: string) => {
                        setContent(value);
                        if (fieldErrors.content) setFieldErrors(prev => ({ ...prev, content: '' }));
                      }}
                      config={BLOG_CONTENT_EDITOR_CONFIG}
                    />
                  </Suspense>
                </div>
                {fieldErrors.content && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.content}</p>
                )}
              </div>
            </div>

            {/* Right Sidebar Column: Cover Image, Taxonomy, Tags, SEO */}
            <div className="xl:col-span-4 space-y-5">
              {/* Cover Image Upload Card */}
              <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Featured Cover Image <span className="text-rose-500">*</span>
                  </label>
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />}
                </div>

                {coverImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 group bg-white shadow-2xs">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-36 object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label
                        htmlFor="replace-cover-input"
                        className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-stone-800 text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="file"
                      id="replace-cover-input"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${isDragging
                      ? 'border-amber-500 bg-amber-50/50'
                      : fieldErrors.coverImage
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-stone-300 hover:border-amber-400 bg-white'
                      }`}
                  >
                    <input
                      type="file"
                      id="cover-upload-input"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <label htmlFor="cover-upload-input" className="cursor-pointer space-y-1.5 block">
                      <Upload className="w-7 h-7 mx-auto text-amber-600" />
                      <p className="text-xs font-bold text-stone-800">
                        {uploading ? 'Uploading image...' : 'Click or Drag & Drop Cover Image'}
                      </p>
                      <p className="text-[10px] text-stone-400 font-medium">JPG, PNG, WebP (Max 5MB)</p>
                    </label>
                  </div>
                )}
                {fieldErrors.coverImage && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.coverImage}</p>
                )}
              </div>

              {/* Taxonomy: Category & Author */}
              <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (fieldErrors.category) setFieldErrors(prev => ({ ...prev, category: '' }));
                    }}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Author <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={author}
                    onChange={(e) => {
                      setAuthor(e.target.value);
                      if (fieldErrors.author) setFieldErrors(prev => ({ ...prev, author: '' }));
                    }}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    {authors.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive Tags Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                      Tags (Max 5)
                    </label>
                    <span className="text-[10px] text-stone-400 font-medium">{tags.length}/5</span>
                  </div>
                  <div className="p-2 bg-white border border-stone-200 rounded-xl space-y-2">
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold"
                          >
                            #{t}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="hover:text-rose-600 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      disabled={tags.length >= 5}
                      placeholder={tags.length >= 5 ? 'Max 5 tags reached' : 'Type tag & press Enter...'}
                      className="w-full text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Pin to Top Checkbox */}
                <div className="pt-2 border-t border-stone-200/60">
                  <label className="inline-flex items-center gap-2.5 text-xs font-bold text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                    />
                    <Pin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pin this blog to featured header</span>
                  </label>
                </div>
              </div>

              {/* Collapsible SEO Metadata Accordion */}
              <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSeo(!showSeo)}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-700 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    <span>Search Engine Optimization (SEO)</span>
                  </div>
                  {showSeo ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </button>

                {showSeo && (
                  <div className="space-y-3 pt-2 border-t border-stone-200/60 animate-in fade-in">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-stone-600">Meta Title</label>
                        <span className="text-[10px] text-stone-400">{metaTitle.length || title.length}/60</span>
                      </div>
                      <input
                        type="text"
                        maxLength={60}
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder={title || 'Custom SEO Title...'}
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-stone-600">Meta Description</label>
                        <span className="text-[10px] text-stone-400">{metaDescription.length || introduction.length}/160</span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={160}
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder={introduction || 'Custom search engine summary...'}
                        className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:ring-2 focus:ring-amber-400 resize-none"
                      />
                    </div>

                    {/* Google SERP Snippet Preview */}
                    <div className="p-3 rounded-xl bg-white border border-stone-200/80 space-y-1">
                      <p className="text-[10px] font-extrabold uppercase text-stone-400">Google Search Preview</p>
                      <p className="text-[11px] text-emerald-800 truncate">
                        EduJunction.in/blog/{title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) || 'article-slug'}
                      </p>
                      <p className="text-xs font-bold text-blue-700 line-clamp-1">
                        {metaTitle || title || 'Your Article Title Appears Here'}
                      </p>
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-tight">
                        {metaDescription || introduction || 'Your article description appears in search results to attract readers...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="pt-6 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (title || content) {
                  if (!confirm('You may have unsaved changes. Are you sure you want to cancel?')) return;
                }
                onClose();
              }}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 border border-stone-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              value="Draft"
              disabled={loading || uploading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 border border-stone-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="submit"
              value="Published"
              disabled={loading || uploading}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-7 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-400" />}
              <span>{initialBlog ? 'Update Blog' : 'Publish Blog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Dashboard View
// ─────────────────────────────────────────────────────────────
const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardUsers, setDashboardUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const pageSize = 5;

  // Platform dynamic stats & audit logs state
  const [stats, setStats] = useState<{
    totalUsers?: number;
    totalStudents?: number;
    totalExamsGenerated?: number;
    totalExamsCompleted?: number;
    totalRunbooks?: number;
    averagePlatformScore?: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchStatsAndLogs = useCallback(async () => {
    setStatsLoading(true);
    setLogsLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.allSettled([
        ApiServices.adminDashboard(),
        ApiServices.adminAuditLogs({ limit: 10 }),
      ]);

      if (statsRes.status === 'fulfilled') {
        const d = statsRes.value;
        const data = d?.data || d;
        setStats(data || null);
      }

      if (logsRes.status === 'fulfilled') {
        const d = logsRes.value;
        const items = Array.isArray(d)
          ? d
          : Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d?.data?.items)
              ? d.data.items
              : Array.isArray(d?.data)
                ? d.data
                : [];
        setAuditLogs(items);
      }
    } catch (err) {
      console.error('Failed to load admin stats or logs:', err);
    } finally {
      setStatsLoading(false);
      setLogsLoading(false);
    }
  }, []);

  const fetchDashboardUsers = useCallback(async (page: number) => {
    setUsersLoading(true);
    try {
      const res = await ApiServices.listAdminUsers({ page, limit: pageSize, flat: 'true' });
      const data = res?.data || res;
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setDashboardUsers(items);
      setUsersTotalCount(data?.pagination?.total ?? data?.total ?? items.length);
    } catch (err) {
      console.error('Failed to fetch dashboard users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchDashboardUsers(usersCurrentPage);
  }, [usersCurrentPage, fetchDashboardUsers]);

  useEffect(() => {
    fetchStatsAndLogs();
  }, [fetchStatsAndLogs]);

  const formatJoinedDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    const r = (role || '').toUpperCase();
    if (r === 'PARENT') return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (r === 'STUDENT') return 'bg-pink-100 text-pink-800 border border-pink-200';
    if (r === 'TEACHER') return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 'bg-purple-100 text-purple-800 border border-purple-200';
    return 'bg-stone-100 text-stone-700 border border-stone-200';
  };

  const formatRelativeTime = (isoString?: string): string => {
    if (!isoString) return 'Recently';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return 'Just now';
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} min ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const formatIndianDateTime = (isoString?: string, formattedFallback?: string): string => {
    if (formattedFallback) return formattedFallback;
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const getAuditLogDisplay = (log: any) => {
    const action = log?.action || '';
    const name = log?.userName || (log?.entityId && isNaN(Number(log.entityId)) ? log.entityId : null);

    if (action === 'USER_REGISTER') {
      return {
        icon: <UserCheck className="w-4 h-4 text-amber-600" />,
        text: name ? `New user registered: ${name}` : 'New user registered',
        bg: 'bg-amber-50',
      };
    }
    if (action === 'LOGIN_SUCCESS') {
      return {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        text: name ? `User signed in: ${name}` : 'User signed in successfully',
        bg: 'bg-emerald-50',
      };
    }
    if (action === 'LOGIN_FAILED') {
      return {
        icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
        text: `Failed login attempt ${log.ipAddress ? `(IP: ${log.ipAddress})` : ''}`,
        bg: 'bg-rose-50',
      };
    }
    if (action === 'ADMIN_LOGIN_SUCCESS') {
      return {
        icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
        text: name ? `Admin signed in: ${name}` : 'Admin signed in successfully',
        bg: 'bg-blue-50',
      };
    }
    if (action === 'ADMIN_LOGIN_FAILED') {
      return {
        icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
        text: `Failed admin login attempt ${log.ipAddress ? `(IP: ${log.ipAddress})` : ''}`,
        bg: 'bg-rose-50',
      };
    }
    if (action === 'CHILD_CREATED') {
      return {
        icon: <Users className="w-4 h-4 text-amber-600" />,
        text: name ? `New student profile created: ${name}` : 'New student enrolled',
        bg: 'bg-amber-50',
      };
    }
    if (action === 'CHILD_UPDATED') {
      return {
        icon: <Edit className="w-4 h-4 text-indigo-600" />,
        text: name ? `Student profile updated: ${name}` : 'Student profile updated',
        bg: 'bg-indigo-50',
      };
    }
    if (action === 'EXAM_GENERATED' || action === 'QUICK_EXAM_GENERATED') {
      return {
        icon: <FileText className="w-4 h-4 text-violet-600" />,
        text: log.entityId ? `AI practice test generated (${log.entityId})` : 'New AI assessment generated',
        bg: 'bg-violet-50',
      };
    }
    if (action === 'EXAM_SUBMITTED') {
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        text: name ? `Test evaluated & completed: ${name}` : 'Exam evaluated and submitted',
        bg: 'bg-emerald-50',
      };
    }
    if (action === 'BLOG_CREATED') {
      return {
        icon: <BookOpen className="w-4 h-4 text-yellow-600" />,
        text: log.entityId ? `Curriculum blog published: "${log.entityId}"` : 'Curriculum blog published',
        bg: 'bg-yellow-50',
      };
    }
    if (action === 'BLOG_UPDATED') {
      return {
        icon: <Edit className="w-4 h-4 text-amber-600" />,
        text: log.entityId ? `Curriculum blog updated: "${log.entityId}"` : 'Curriculum blog updated',
        bg: 'bg-amber-50',
      };
    }
    if (action === 'BLOG_DELETED') {
      return {
        icon: <Trash2 className="w-4 h-4 text-stone-500" />,
        text: 'Blog post deleted from database',
        bg: 'bg-stone-50',
      };
    }
    return {
      icon: <Activity className="w-4 h-4 text-stone-600" />,
      text: `${action.replace(/_/g, ' ')}${name ? `: ${name}` : ''}`,
      bg: 'bg-stone-50',
    };
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-3.5 h-3.5 text-yellow-600" />}
            label="Total Users"
            value={statsLoading ? '...' : (stats?.totalUsers ?? 0).toLocaleString()}
            change="Registered"
            subText="Parents & Students"
            theme="yellow"
          />
          <StatCard
            icon={<GraduationCap className="w-3.5 h-3.5 text-emerald-600" />}
            label="Exams Generated"
            value={statsLoading ? '...' : (stats?.totalExamsGenerated ?? 0).toLocaleString()}
            change="Smart Exams"
            subText="AI Curriculum Tests"
            theme="emerald"
          />
          <StatCard
            icon={<Activity className="w-3.5 h-3.5 text-blue-600" />}
            label="Tests Evaluated"
            value={statsLoading ? '...' : (stats?.totalExamsCompleted ?? 0).toLocaleString()}
            change="Completed"
            subText="Scored Submissions"
            theme="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-3.5 h-3.5 text-rose-500" />}
            label="Platform Accuracy"
            value={statsLoading ? '...' : `${stats?.averagePlatformScore ?? 0}%`}
            change="Avg Score"
            subText="Diagnostic Mastery"
            theme="rose"
          />
        </div>
      </div>

      {/* ── Dynamic Registered Users Section (Flat table with 5 per page pagination, no actions column) ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-black text-stone-900">Registered Users</h2>
            </div>
            <p className="text-sm text-stone-500 font-medium mt-0.5">
              Live overview of all registered students, parents.
            </p>
          </div>
        </div>

        <div className="admin-card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/60">
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Name</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Role</th>
                  <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400 hidden sm:table-cell">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {usersLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-stone-400 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                        <span>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : dashboardUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-stone-400 font-medium">
                      <p className="font-semibold text-stone-600 mb-1">No users found</p>
                      <p className="text-xs">Registered platform users will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  dashboardUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-white font-black text-sm shadow-2xs flex-shrink-0">
                            {u.avatar || (u.name || u.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-800 truncate">{u.name || u.username}</p>
                            <p className="text-xs text-stone-400 truncate">
                              {u.classGrade ? `${u.classGrade} • ${u.targetBoard || ''}` : (u.email || u.username)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleBadgeStyle(u.roleName || u.role)}`}>
                          {u.role || u.roleName || 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 hidden sm:table-cell">
                        <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-full ${u.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-stone-500 text-xs text-right">
                        {formatJoinedDate(u.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {usersTotalCount > 0 && (
            <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-stone-500 font-medium">
                Showing <span className="font-bold text-stone-800">{(usersCurrentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-bold text-stone-800">{Math.min(usersCurrentPage * pageSize, usersTotalCount)}</span> of{' '}
                <span className="font-bold text-stone-800">{usersTotalCount}</span> users
              </span>

              {Math.ceil(usersTotalCount / pageSize) > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUsersCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={usersCurrentPage === 1 || usersLoading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(usersTotalCount / pageSize) }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setUsersCurrentPage(pageNum)}
                        disabled={usersLoading}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${usersCurrentPage === pageNum
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setUsersCurrentPage((p) => Math.min(Math.ceil(usersTotalCount / pageSize), p + 1))}
                    disabled={usersCurrentPage === Math.ceil(usersTotalCount / pageSize) || usersLoading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400">Recent Activity</h2>
          <span className="text-xs text-stone-400 font-medium">Live Audit Logs</span>
        </div>
        <div className="admin-card space-y-4">
          {logsLoading ? (
            <div className="flex items-center justify-center py-6 text-stone-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              <span>Loading recent activities from audit logs...</span>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-8 text-center text-stone-400 text-sm">
              <Activity className="w-6 h-6 text-stone-300 mx-auto mb-2" />
              <p className="font-semibold text-stone-600 mb-1">No audit activities recorded yet</p>
              <p className="text-xs">User signups, logins, and exams will appear here in real time.</p>
            </div>
          ) : (
            auditLogs.slice(0, 6).map((log: any, i: number) => {
              const display = getAuditLogDisplay(log);
              return (
                <div key={log.id || i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${display.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    {display.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{display.text}</p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-stone-400 font-medium">{formatRelativeTime(log.createdAt || log.created_at)}</p>
                      <span className="text-[11px] font-medium text-stone-400">
                        {log.createdAtFormatted || formatIndianDateTime(log.createdAt || log.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Platform Analytics & Trends ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Assessment Activity */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Weekly Assessment Activity</h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">Tests Generated vs. Completed (Mon–Sun)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-stone-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Generated
              </span>
              <span className="flex items-center gap-1.5 text-stone-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
              </span>
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading activity trend...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weeklyActivity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: '#e7e5e4' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px' }}
                  />
                  <Bar dataKey="generated" name="Generated" fill="#fbbf24" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Subject Performance Breakdown */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Subject Accuracy & Volume</h3>
              <p className="text-xs text-stone-400 font-medium mt-0.5">Average accuracy score % by curriculum subject</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Avg Score %
            </div>
          </div>

          <div className="h-56 w-full mt-2">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center text-stone-400 text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Loading subject performance...</span>
              </div>
            ) : (!stats?.subjectBreakdown || stats.subjectBreakdown.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-xs">
                <Activity className="w-5 h-5 text-stone-300 mb-1" />
                <span>No subject assessment data available yet</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectBreakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: '#e7e5e4' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Accuracy']}
                    labelFormatter={(label: any) => `Subject: ${label}`}
                    contentStyle={{ backgroundColor: '#1c1917', borderRadius: '0.75rem', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 600 }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#818cf8', fontWeight: 700, marginBottom: '4px' }}
                  />
                  <Bar dataKey="averageAccuracy" name="Avg Accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

// // ─────────────────────────────────────────────────────────────
// // Users View
// // ─────────────────────────────────────────────────────────────
// const UsersView: React.FC = () => {
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalCount, setTotalCount] = useState(0);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [userToDelete, setUserToDelete] = useState<any | null>(null);
//   const [userToEdit, setUserToEdit] = useState<any | null>(null);
//   const [editName, setEditName] = useState('');
//   const [editEmail, setEditEmail] = useState('');
//   const [actionLoading, setActionLoading] = useState(false);
//   const [actionError, setActionError] = useState('');
//   const pageSize = 5;

//   const fetchUsers = useCallback(async (page: number, search: string) => {
//     setLoading(true);
//     try {
//       const res = await ApiServices.listAdminUsers({ page, limit: pageSize, search: search.trim() });
//       const data = res?.data || res;
//       const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
//       setUsers(items);
//       setTotalCount(data?.pagination?.total ?? data?.total ?? items.length);
//     } catch (err) {
//       console.error('Failed to fetch admin users:', err);
//     } finally {
//       setLoading(false);
//     }
//   }, [pageSize]);

//   useEffect(() => {
//     fetchUsers(currentPage, searchQuery);
//   }, [currentPage, searchQuery, fetchUsers]);

//   const openEditModal = (user: any) => {
//     setUserToEdit(user);
//     setEditName(user.name || user.username || '');
//     setEditEmail(user.email || '');
//     setActionError('');
//   };

//   const closeActionModal = () => {
//     if (actionLoading) return;
//     setUserToDelete(null);
//     setUserToEdit(null);
//     setActionError('');
//   };

//   const handleDeleteUser = async () => {
//     if (!userToDelete) return;
//     setActionLoading(true);
//     setActionError('');
//     try {
//       await ApiServices.deleteAdminUser(userToDelete.id);
//       setUserToDelete(null);
//       const nextTotal = Math.max(0, totalCount - 1);
//       setTotalCount(nextTotal);
//       const nextTotalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
//       const targetPage = currentPage > nextTotalPages ? nextTotalPages : currentPage;
//       if (targetPage !== currentPage) {
//         setCurrentPage(targetPage);
//       } else {
//         await fetchUsers(currentPage, searchQuery);
//       }
//     } catch (err: any) {
//       setActionError(err?.message || 'Failed to delete user. Please try again.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleEditUser = async (event: React.FormEvent) => {
//     event.preventDefault();
//     if (!userToEdit) return;
//     setActionLoading(true);
//     setActionError('');
//     try {
//       await ApiServices.updateAdminUser(userToEdit.id, {
//         name: editName.trim(),
//         email: editEmail.trim(),
//       });
//       setUserToEdit(null);
//       await fetchUsers(currentPage, searchQuery);
//     } catch (err: any) {
//       setActionError(err?.message || 'Failed to update user. Please try again.');
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

//   const formatJoinedDate = (isoString?: string) => {
//     if (!isoString) return '—';
//     try {
//       return new Date(isoString).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric',
//       });
//     } catch {
//       return '—';
//     }
//   };

//   const getRoleBadgeStyle = (role?: string) => {
//     const r = (role || '').toUpperCase();
//     if (r === 'PARENT') return 'bg-amber-100 text-amber-800 border border-amber-200';
//     if (r === 'STUDENT') return 'bg-pink-100 text-pink-800 border border-pink-200';
//     if (r === 'TEACHER') return 'bg-blue-100 text-blue-800 border border-blue-200';
//     if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 'bg-purple-100 text-purple-800 border border-purple-200';
//     return 'bg-stone-100 text-stone-700 border border-stone-200';
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-black text-stone-900">Users</h1>
//           <p className="text-sm text-stone-500 font-medium mt-1">Manage all registered platform users and their access.</p>
//         </div>

//         {/* Search input */}
//         <div className="relative w-full sm:w-72">
//           <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => {
//               setSearchQuery(e.target.value);
//               setCurrentPage(1);
//             }}
//             placeholder="Search users by name, email..."
//             className="w-full h-10 pl-10 pr-4 rounded-xl text-xs font-semibold text-stone-900 bg-white border border-stone-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all placeholder:text-stone-400"
//           />
//         </div>
//       </div>

//       <div className="admin-card overflow-hidden !p-0">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-stone-100 bg-stone-50/60">
//                 <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Name</th>
//                 <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Role</th>
//                 <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400 hidden sm:table-cell">Status</th>
//                 <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400 hidden md:table-cell">Joined</th>
//                 <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-stone-50">
//               {loading ? (
//                 <tr>
//                   <td colSpan={5} className="h-40 p-0 align-middle text-center">
//                     <div className="flex h-full items-center justify-center">
//                       <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
//                     </div>
//                   </td>
//                 </tr>
//               ) : users.length === 0 ? (
//                 <tr>
//                   <td colSpan={5} className="px-6 py-12 text-center text-stone-400 font-medium">
//                     <Users className="w-6 h-6 text-stone-300 mx-auto mb-2" />
//                     <p className="font-semibold text-stone-600 mb-1">No users found</p>
//                     <p className="text-xs">{searchQuery ? 'Try changing your search keywords.' : 'No registered users in database.'}</p>
//                   </td>
//                 </tr>
//               ) : (
//                 users.map((u) => (
//                   <React.Fragment key={u.id}>
//                     <tr className="hover:bg-amber-50/40 transition-colors group">
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0">
//                             {(u.name || u.username || 'U').charAt(0).toUpperCase()}
//                           </div>
//                           <div className="min-w-0">
//                             <p className="font-semibold text-stone-800 truncate">{u.name || u.username}</p>
//                             <p className="text-xs text-stone-400 truncate">{u.email || `@${u.username}`}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleBadgeStyle(u.roleName || u.role)}`}>
//                           {u.role || u.roleName || 'User'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 hidden sm:table-cell">
//                         <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-full ${u.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>
//                           <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-stone-400'}`} />
//                           {u.isActive !== false ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-stone-500 text-xs hidden md:table-cell">
//                         {formatJoinedDate(u.createdAt)}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center justify-end gap-2">
//                           {/* Soft Blue Edit Button */}
//                           <button
//                             type="button"
//                             onClick={() => openEditModal(u)}
//                             title="Edit User"
//                             className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>

//                           {/* Soft Red Delete Button */}
//                           <button
//                             type="button"
//                             onClick={() => { setUserToDelete(u); setActionError(''); }}
//                             disabled={actionLoading && userToDelete?.id === u.id}
//                             title="Delete User"
//                             className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                     {u.linkedStudents?.map((student: { id: string | number; name: string }, index: number) => (
//                       <tr key={student.id} className="bg-pink-50/30 hover:bg-pink-50/60 transition-colors">
//                         <td className="px-6 py-3">
//                           <div className="relative flex items-center gap-3 pl-10 sm:pl-12">
//                             <span
//                               aria-hidden="true"
//                               className={`absolute left-3 top-0 w-px bg-pink-200 sm:left-4 ${index === u.linkedStudents.length - 1 ? 'h-1/2' : 'h-full'}`}
//                             />
//                             <span aria-hidden="true" className="absolute left-3 top-1/2 h-px w-5 bg-pink-200 sm:left-4 sm:w-6" />
//                             <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-700 font-black text-xs shadow-sm flex-shrink-0">
//                               {student.name.charAt(0).toUpperCase()}
//                             </div>
//                             <p className="min-w-0 truncate text-sm font-semibold text-stone-700">{student.name}</p>
//                           </div>
//                         </td>
//                         <td className="px-6 py-3">
//                           <span className="rounded-lg border border-pink-200 bg-pink-100 px-2.5 py-1 text-xs font-bold text-pink-800">Student</span>
//                         </td>
//                         <td className="px-6 py-3 text-xs font-medium text-stone-400 hidden sm:table-cell">—</td>
//                         <td className="px-6 py-3 text-xs font-medium text-stone-400 hidden md:table-cell">—</td>
//                         <td className="px-6 py-3 text-right text-xs font-medium text-stone-400">—</td>
//                       </tr>
//                     ))}
//                   </React.Fragment>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Section */}
//         {totalCount > 0 && (
//           <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
//             <span className="text-stone-500 font-medium">
//               Showing <span className="font-bold text-stone-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
//               <span className="font-bold text-stone-800">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
//               <span className="font-bold text-stone-800">{totalCount}</span> users
//             </span>

//             {totalPages > 1 && (
//               <div className="flex items-center gap-1.5">
//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={currentPage === 1 || loading}
//                   className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
//                 >
//                   <ChevronLeft className="w-3.5 h-3.5" />
//                   <span>Prev</span>
//                 </button>

//                 <div className="flex items-center gap-1">
//                   {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
//                     <button
//                       key={pageNum}
//                       type="button"
//                       onClick={() => setCurrentPage(pageNum)}
//                       disabled={loading}
//                       className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
//                         ? 'bg-stone-900 text-white shadow-xs'
//                         : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
//                         }`}
//                     >
//                       {pageNum}
//                     </button>
//                   ))}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={currentPage === totalPages || loading}
//                   className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
//                 >
//                   <span>Next</span>
//                   <ChevronRight className="w-3.5 h-3.5" />
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Delete Confirmation Modal */}
//       {userToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
//           <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-100 animate-in zoom-in-95 duration-200">
//             <div className="flex flex-col items-center text-center">
//               <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
//                 <Trash2 className="w-6 h-6 text-rose-400" />
//               </div>
//               <h3 className="text-lg font-bold text-stone-900 mb-1">Delete User?</h3>
//               <p className="text-xs text-stone-500 font-medium mb-5">
//                 Are you sure you want to delete <span className="font-semibold text-stone-800">"{userToDelete.name || userToDelete.username || 'this user'}"</span>? This action cannot be undone.
//               </p>
//               {actionError && (
//                 <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 w-full text-center">
//                   {actionError}
//                 </div>
//               )}
//               <div className="flex items-center gap-3 w-full">
//                 <button
//                   type="button"
//                   onClick={closeActionModal}
//                   disabled={actionLoading}
//                   className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleDeleteUser}
//                   disabled={actionLoading}
//                   className="flex-1 py-2.5 px-4 bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
//                 >
//                   {actionLoading ? (
//                     <>
//                       <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                       <span>Deleting...</span>
//                     </>
//                   ) : (
//                     <span>Delete</span>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit User Modal */}
//       {userToEdit && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200" role="dialog" aria-modal="true">
//           <form onSubmit={handleEditUser} className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-100 animate-in zoom-in-95 duration-200">
//             <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
//               <div className="flex items-center gap-2.5">
//                 <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//                   <Edit className="w-4 h-4" />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-black text-stone-900">Edit User</h3>
//                   <p className="text-xs text-stone-400 font-medium">Update user details</p>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={closeActionModal}
//                 className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Name</label>
//                 <input
//                   value={editName}
//                   onChange={(event) => setEditName(event.target.value)}
//                   required
//                   placeholder="Full name"
//                   className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Email</label>
//                 <input
//                   type="email"
//                   value={editEmail}
//                   onChange={(event) => setEditEmail(event.target.value)}
//                   required
//                   placeholder="Email address"
//                   className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
//                 />
//               </div>
//             </div>

//             {actionError && (
//               <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
//                 {actionError}
//               </div>
//             )}

//             <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
//               <button
//                 type="button"
//                 onClick={closeActionModal}
//                 disabled={actionLoading}
//                 className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={actionLoading || !editName.trim() || !editEmail.trim()}
//                 className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
//               >
//                 {actionLoading ? (
//                   <>
//                     <Loader2 className="w-3.5 h-3.5 animate-spin" />
//                     <span>Saving...</span>
//                   </>
//                 ) : (
//                   <span>Save changes</span>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// ─────────────────────────────────────────────────────────────
// Users View (Zero Unnecessary Scrolling)
// ─────────────────────────────────────────────────────────────
const UsersView: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string | number>>(new Set());
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editClassGrade, setEditClassGrade] = useState('Class 10');
  const [editTargetBoard, setEditTargetBoard] = useState('CBSE');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const pageSize = 5;

  const toggleParentExpand = (parentId: string | number) => {
    setExpandedParentIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  const fetchUsers = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const res = await ApiServices.listAdminUsers({ page, limit: pageSize, search: search.trim() });
      const data = res?.data || res;
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setUsers(items);
      setTotalCount(data?.pagination?.total ?? data?.total ?? items.length);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage, searchQuery, fetchUsers]);

  const openEditModal = (user: any) => {
    setUserToEdit(user);
    setEditName(user.name || user.username || '');
    setEditEmail(user.email && user.email !== '—' ? user.email : '');
    setEditIsActive(user.isActive !== false);
    setEditClassGrade(user.classGrade || 'Class 10');
    setEditTargetBoard(user.targetBoard || 'CBSE');
    setActionError('');
  };

  const closeActionModal = () => {
    if (actionLoading) return;
    setUserToDelete(null);
    setUserToEdit(null);
    setActionError('');
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    setActionError('');
    try {
      await ApiServices.deleteAdminUser(userToDelete.id);
      setUserToDelete(null);
      await fetchUsers(currentPage, searchQuery);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to delete user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userToEdit) return;
    setActionLoading(true);
    setActionError('');
    try {
      const isStudent = (userToEdit.roleName || userToEdit.role || '').toUpperCase() === 'STUDENT';
      await ApiServices.updateAdminUser(userToEdit.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        isActive: editIsActive,
        ...(isStudent ? { classGrade: editClassGrade, targetBoard: editTargetBoard } : {})
      });
      setUserToEdit(null);
      await fetchUsers(currentPage, searchQuery);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const formatJoinedDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    const r = (role || '').toUpperCase();
    if (r === 'PARENT') return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (r === 'STUDENT') return 'bg-pink-100 text-pink-800 border border-pink-200';
    if (r === 'TEACHER') return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (r === 'ADMIN' || r === 'SUPER_ADMIN') return 'bg-purple-100 text-purple-800 border border-purple-200';
    return 'bg-stone-100 text-stone-700 border border-stone-200';
  };

  return (
    <div className="w-full flex flex-col space-y-5 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Users</h1>
          <p className="text-sm text-stone-500 font-medium mt-0.5">Manage all registered platform users and their access.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search users by name, email..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-xs font-semibold text-stone-900 bg-white border border-stone-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Main Table Card (Non-overflowing wrapper) */}
      <div className="border border-stone-200 rounded-2xl bg-white shadow-xs overflow-hidden flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="text-left px-6 py-3.5 text-xs font-black uppercase tracking-widest text-stone-400">Name</th>
                <th className="text-left px-6 py-3.5 text-xs font-black uppercase tracking-widest text-stone-400">Role</th>
                <th className="text-left px-6 py-3.5 text-xs font-black uppercase tracking-widest text-stone-400 hidden sm:table-cell">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-black uppercase tracking-widest text-stone-400 hidden md:table-cell">Joined</th>
                <th className="text-right px-6 py-3.5 text-xs font-black uppercase tracking-widest text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 align-middle text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-400 font-medium">
                    <Users className="w-6 h-6 text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-600 mb-1">No users found</p>
                    <p className="text-xs">{searchQuery ? 'Try changing your search keywords.' : 'No registered users in database.'}</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const hasLinkedStudents = Boolean(u.linkedStudents && u.linkedStudents.length > 0);
                  const isExpanded = expandedParentIds.has(u.id);

                  return (
                    <React.Fragment key={u.id}>
                      <tr
                        onClick={() => hasLinkedStudents && toggleParentExpand(u.id)}
                        className={`transition-colors ${hasLinkedStudents ? 'cursor-pointer hover:bg-amber-50/40' : 'hover:bg-amber-50/20'}`}
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {hasLinkedStudents ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleParentExpand(u.id);
                                }}
                                title={isExpanded ? 'Collapse children' : 'Expand children'}
                                className="p-1 -ml-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-100/60 transition-all cursor-pointer"
                              >
                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-amber-600' : 'text-stone-400'}`} />
                              </button>
                            ) : (
                              <div className="w-2.5" />
                            )}
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-white font-black text-sm shadow-xs flex-shrink-0">
                              {(u.name || u.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-stone-800 truncate">{u.name || u.username}</p>
                                {hasLinkedStudents && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/80 text-amber-800 border border-amber-200/70">
                                    {u.linkedStudents.length} {u.linkedStudents.length === 1 ? 'child' : 'children'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-400 truncate">{u.email || u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getRoleBadgeStyle(u.roleName || u.role)}`}>
                            {u.role || u.roleName || 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 hidden sm:table-cell">
                          <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-1 rounded-full ${u.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                            {u.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-stone-500 text-xs hidden md:table-cell">
                          {formatJoinedDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              title="Edit user"
                              aria-label="Edit user"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setUserToDelete(u); setActionError(''); }}
                              title="Delete user"
                              aria-label="Delete user"
                              className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && u.linkedStudents?.map((student: any, index: number) => (
                        <tr key={student.id} className="bg-pink-50/25 hover:bg-pink-50/45 transition-colors">
                          <td className="px-6 py-2.5">
                            <div className="relative flex items-center gap-3 pl-10 sm:pl-12">
                              <span
                                aria-hidden="true"
                                className={`absolute left-3 top-0 w-px bg-pink-200 sm:left-4 ${index === u.linkedStudents.length - 1 ? 'h-1/2' : 'h-full'}`}
                              />
                              <span aria-hidden="true" className="absolute left-3 top-1/2 h-px w-5 bg-pink-200 sm:left-4 sm:w-6" />
                              <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-700 font-black text-xs shadow-xs flex-shrink-0">
                                {student.avatar || (student.name ? student.name.charAt(0).toUpperCase() : 'S')}
                              </div>
                              <div className="min-w-0">
                                <p className="min-w-0 truncate text-xs font-semibold text-stone-700">{student.name}</p>
                                <p className="text-[10px] text-stone-400 truncate">
                                  {student.classGrade ? `${student.classGrade} • ` : ''}{student.targetBoard || student.username || ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-2.5">
                            <span className="rounded-lg border border-pink-200 bg-pink-100 px-2.5 py-0.5 text-[11px] font-bold text-pink-800">Student</span>
                          </td>
                          <td className="px-6 py-2.5 hidden sm:table-cell">
                            <span className={`flex items-center gap-1.5 text-xs font-bold w-fit px-2.5 py-0.5 rounded-full ${student.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${student.isActive !== false ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                              {student.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-2.5 text-stone-500 text-xs hidden md:table-cell">
                            {formatJoinedDate(student.createdAt)}
                          </td>
                          <td className="px-6 py-2.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal({ ...student, role: 'Student', roleName: 'STUDENT', parentId: u.id })}
                                title="Edit student"
                                aria-label="Edit student"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => { setUserToDelete({ ...student, role: 'Student', roleName: 'STUDENT', parentId: u.id }); setActionError(''); }}
                                title="Delete student"
                                aria-label="Delete student"
                                className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {totalCount > 0 && (
          <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs flex-shrink-0">
            <span className="text-stone-500 font-medium">
              Showing <span className="font-bold text-stone-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-stone-800">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
              <span className="font-bold text-stone-800">{totalCount}</span> users
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPaginationPages().map((pageNum, idx) => (
                    typeof pageNum === 'number' ? (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-stone-400 text-xs font-bold">
                        {pageNum}
                      </span>
                    )
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-black text-stone-900">
              Delete {(userToDelete.roleName || userToDelete.role || '').toUpperCase() === 'STUDENT' ? 'Student' : 'User'}
            </h2>
            <p className="mt-3 text-sm font-medium text-stone-600">
              Are you sure you want to delete <span className="font-bold text-stone-800">"{userToDelete.name || userToDelete.username}"</span>?
            </p>
            {userToDelete.linkedStudents && userToDelete.linkedStudents.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This parent account is mapped to <strong className="font-bold">{userToDelete.linkedStudents.length} student(s)</strong>. Deleting this parent will permanently delete all associated student profiles and their exam data from the database.
                </span>
              </div>
            )}
            {actionError && <p className="mt-3 text-xs font-semibold text-red-600">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={actionLoading}
                className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 px-4" role="dialog" aria-modal="true">
          <form onSubmit={handleEditUser} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-black text-stone-900">
                Edit {(userToEdit.roleName || userToEdit.role || '').toUpperCase() === 'STUDENT' ? 'Student Profile' : 'User Account'}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${getRoleBadgeStyle(userToEdit.roleName || userToEdit.role)}`}>
                {userToEdit.role || userToEdit.roleName || 'User'}
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Full Name</span>
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  required
                  placeholder="Enter full name"
                  className="h-10 w-full rounded-xl border border-stone-200 px-3 text-sm font-medium text-stone-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                />
              </label>

              {(userToEdit.roleName || userToEdit.role || '').toUpperCase() !== 'STUDENT' ? (
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Email Address</span>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(event) => setEditEmail(event.target.value)}
                    required
                    placeholder="Enter email address"
                    className="h-10 w-full rounded-xl border border-stone-200 px-3 text-sm font-medium text-stone-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  />
                </label>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Target Board</span>
                    <select
                      value={editTargetBoard}
                      onChange={(e) => setEditTargetBoard(e.target.value)}
                      className="h-10 w-full rounded-xl border border-stone-200 px-3 text-xs font-semibold text-stone-800 bg-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                    >
                      {['CBSE', 'ICSE', 'WBBSE', 'ISC', 'UK-Cambridge', 'NCERT', 'NEET', 'IIT'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Class / Grade</span>
                    <select
                      value={editClassGrade}
                      onChange={(e) => setEditClassGrade(e.target.value)}
                      className="h-10 w-full rounded-xl border border-stone-200 px-3 text-xs font-semibold text-stone-800 bg-white outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                    >
                      {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-stone-500">Account Status</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setEditIsActive(true)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${editIsActive
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${editIsActive ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditIsActive(false)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${!editIsActive
                      ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
                      : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${!editIsActive ? 'bg-rose-500' : 'bg-stone-300'}`} />
                    Inactive
                  </button>
                </div>
              </label>
            </div>

            {actionError && <p className="mt-3 text-xs font-semibold text-red-600">{actionError}</p>}

            <div className="mt-6 pt-3 border-t border-stone-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={actionLoading}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading || !editName.trim()}
                className="rounded-xl bg-yellow-400 px-5 py-2 text-xs font-bold text-stone-900 hover:bg-yellow-500 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {actionLoading ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// Course Form Modal (Add / Edit Academic Chapter)
// ─────────────────────────────────────────────────────────────
interface CourseModalProps {
  initialCourse?: any | null;
  onClose: () => void;
  onSaved: () => void;
}

const CourseFormModal: React.FC<CourseModalProps> = ({ initialCourse, onClose, onSaved }) => {
  const [board, setBoard] = useState(initialCourse?.board || 'CBSE');
  const [classGrade, setClassGrade] = useState(initialCourse?.classGrade || 'Class 8');
  const [subject, setSubject] = useState(initialCourse?.subject || 'Mathematics');
  const [chapterName, setChapterName] = useState(initialCourse?.chapterName || '');
  const [coreConceptsText, setCoreConceptsText] = useState(
    initialCourse?.coreConcepts
      ? Array.isArray(initialCourse.coreConcepts)
        ? initialCourse.coreConcepts.join(', ')
        : typeof initialCourse.coreConcepts === 'object'
          ? Object.keys(initialCourse.coreConcepts).join(', ')
          : String(initialCourse.coreConcepts)
      : ''
  );
  const [keyFormulasText, setKeyFormulasText] = useState(
    initialCourse?.keyFormulasOrRules
      ? Array.isArray(initialCourse.keyFormulasOrRules)
        ? initialCourse.keyFormulasOrRules.join('\n')
        : String(initialCourse.keyFormulasOrRules)
      : ''
  );
  const [commonTrapsText, setCommonTrapsText] = useState(
    initialCourse?.commonTraps
      ? Array.isArray(initialCourse.commonTraps)
        ? initialCourse.commonTraps.join('\n')
        : String(initialCourse.commonTraps)
      : ''
  );
  const [status, setStatus] = useState(initialCourse?.status || 'PUBLISHED');
  const [boardClassesMap, setBoardClassesMap] = useState<Record<string, string[]>>(BOARD_CLASSES_MAP as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch live Board-Class Mapping from API /api/v1/master/board_class_dropdown
  useEffect(() => {
    ApiServices.getBoardClassDropdown()
      .then((res: any) => {
        const fetchedMap = res?.boardClassesMap || res?.data?.boardClassesMap;
        if (fetchedMap) {
          setBoardClassesMap(fetchedMap);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch board class master dropdown:', err);
      });
  }, []);

  // Dynamic allowed classes strictly determined by Board mapping
  const allowedClasses = (boardClassesMap && boardClassesMap[board]) || BOARD_CLASSES_MAP[board] || [
    'Class 1', 'Class 2', 'Class 3', 'Class 4',
    'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ];

  // Dynamic allowed subjects strictly determined by Class Grade mapping (e.g. Class 1 has no Physics/Chem/Bio)
  const availableSubjects = CLASS_SUBJECTS_MAP[classGrade] || [
    'Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'
  ];

  const handleClassGradeChange = (newGrade: string) => {
    setClassGrade(newGrade);
    const newAllowedSubjects = CLASS_SUBJECTS_MAP[newGrade] || [
      'Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'
    ];
    if (!newAllowedSubjects.includes(subject as any)) {
      setSubject(newAllowedSubjects[0]);
    }
  };

  const handleBoardChange = (newBoard: string) => {
    setBoard(newBoard);
    const newAllowed = (boardClassesMap && boardClassesMap[newBoard]) || BOARD_CLASSES_MAP[newBoard] || [
      'Class 1', 'Class 2', 'Class 3', 'Class 4',
      'Class 5', 'Class 6', 'Class 7', 'Class 8',
      'Class 9', 'Class 10', 'Class 11', 'Class 12'
    ];
    const targetGrade = newAllowed.includes(classGrade as any) ? classGrade : newAllowed[0];
    setClassGrade(targetGrade);
    const newAllowedSubjects = CLASS_SUBJECTS_MAP[targetGrade] || [
      'Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science', 'Logical Reasoning'
    ];
    if (!newAllowedSubjects.includes(subject as any)) {
      setSubject(newAllowedSubjects[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim()) {
      setError('Chapter name is required.');
      return;
    }

    const concepts = coreConceptsText
      .split(/[,\n]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    const formulas = keyFormulasText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const traps = commonTrapsText
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      board,
      classGrade,
      subject,
      chapterName: chapterName.trim(),
      coreConcepts: concepts,
      keyFormulasOrRules: formulas,
      commonTraps: traps,
      status,
    };

    setLoading(true);
    setError(null);
    try {
      if (initialCourse?.id) {
        await ApiServices.updateRunbook(initialCourse.id, payload);
      } else {
        await ApiServices.createRunbook(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to save chapter:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to save chapter. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-900 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">
                {initialCourse ? 'Edit Academic Chapter' : 'Add New Academic Chapter'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {initialCourse ? 'Update chapter syllabus and study topics.' : 'Add a new chapter and syllabus topics for students.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Board, Class Grade, Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Board *
              </label>
              <select
                value={board}
                onChange={(e) => handleBoardChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
              >
                <optgroup label="Active Platform Boards">
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE (Class 1-10)</option>
                  <option value="ISC">ISC (Class 11-12)</option>
                  <option value="WBBSE">WBBSE (Madhyamik - Class 1-10)</option>
                  <option value="WBCHSE">WBCHSE (Higher Secondary - Class 11-12)</option>
                </optgroup>
                <optgroup label="Other / Extended Boards">
                  <option value="NCERT">NCERT</option>
                  <option value="UK-Cambridge">UK-Cambridge</option>
                  <option value="NEET">NEET (Competitive - Class 11-12)</option>
                  <option value="IIT">IIT-JEE (Competitive - Class 11-12)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Class Grade *
              </label>
              <select
                value={classGrade}
                onChange={(e) => handleClassGradeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
              >
                {allowedClasses.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Chapter / Unit Name *
            </label>
            <input
              type="text"
              required
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="e.g. Integers, Number Line & Basic Fractions"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>

          {/* Key Topics */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Key Topics Covered
              </label>
              <span className="text-[11px] text-stone-400 font-medium">Separate with commas</span>
            </div>
            <textarea
              rows={2}
              value={coreConceptsText}
              onChange={(e) => setCoreConceptsText(e.target.value)}
              placeholder="e.g. Positive & Negative Integers, Absolute Value, Fractions Comparison"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white resize-none"
            />
          </div>

          {/* Key Formulas / Rules */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Important Formulas & Notes
              </label>
              <span className="text-[11px] text-stone-400 font-medium">One per line (optional)</span>
            </div>
            <textarea
              rows={3}
              value={keyFormulasText}
              onChange={(e) => setKeyFormulasText(e.target.value)}
              placeholder="e.g. (-a) * (-b) = a * b&#10;LCM(a, b) * GCD(a, b) = a * b"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>

          {/* Common Mistakes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Common Student Mistakes
              </label>
              <span className="text-[11px] text-stone-400 font-medium">One mistake per line (optional)</span>
            </div>
            <textarea
              rows={2}
              value={commonTrapsText}
              onChange={(e) => setCommonTrapsText(e.target.value)}
              placeholder="e.g. Confusing (-3) - (-5) with (-3) - 5&#10;Assuming -5 is larger than -2"
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Publishing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
            >
              <option value="PUBLISHED">Published (Active & Live for Students)</option>
              <option value="DRAFT">Draft (Hidden / Under Review)</option>
            </select>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 border border-stone-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {initialCourse ? 'Update Chapter' : 'Save Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Course Deep-Dive Detail Modal
// ─────────────────────────────────────────────────────────────
const CourseDetailModal: React.FC<{
  course: any;
  onClose: () => void;
  onEdit: () => void;
}> = ({ course, onClose, onEdit }) => {
  const concepts = course.coreConcepts
    ? Array.isArray(course.coreConcepts)
      ? course.coreConcepts
      : typeof course.coreConcepts === 'object'
        ? Object.keys(course.coreConcepts)
        : [String(course.coreConcepts)]
    : [];

  const formulas = course.keyFormulasOrRules
    ? Array.isArray(course.keyFormulasOrRules)
      ? course.keyFormulasOrRules
      : [String(course.keyFormulasOrRules)]
    : [];

  const traps = course.commonTraps
    ? Array.isArray(course.commonTraps)
      ? course.commonTraps
      : [String(course.commonTraps)]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900 leading-snug">
                {course.chapterName || `${course.subject} - ${course.classGrade}`}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                  {course.board || 'CBSE'}
                </span>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                  {course.subject}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  {course.classGrade}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {course.status || 'PUBLISHED'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Topics Covered */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2.5 flex items-center gap-1.5">
              <span>🎯</span> Topics Covered ({concepts.length})
            </h3>
            {concepts.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No topics specified.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {concepts.map((concept: any, idx: number) => {
                  const title = typeof concept === 'object' && concept !== null ? concept.title || concept.name || JSON.stringify(concept) : String(concept);
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-amber-50/80 border border-amber-200/70 text-amber-900 rounded-xl text-xs font-semibold shadow-2xs"
                    >
                      {title}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Key Formulas & Notes */}
          {formulas.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <span>📐</span> Important Formulas & Notes ({formulas.length})
              </h3>
              <div className="space-y-1.5">
                {formulas.map((f: string, idx: number) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs font-mono text-stone-800">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {traps.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <span>⚠️</span> Common Student Mistakes ({traps.length})
              </h3>
              <div className="space-y-1.5">
                {traps.map((trap: string, idx: number) => (
                  <div key={idx} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60 text-xs font-medium text-rose-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{trap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Difficulty Guidelines */}
          {course.difficultyCalibration && typeof course.difficultyCalibration === 'object' && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <span>🤖</span> Question Difficulty Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Simple Level</p>
                  <p className="text-xs text-stone-700 mt-1 font-medium leading-relaxed">
                    {course.difficultyCalibration.simple || 'Basic definitions and direct formula applications.'}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Medium Level</p>
                  <p className="text-xs text-stone-700 mt-1 font-medium leading-relaxed">
                    {course.difficultyCalibration.medium || 'Analytical reasoning and multi-step calculations.'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50/60 border border-purple-200/60 rounded-xl">
                  <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Hard Level</p>
                  <p className="text-xs text-stone-700 mt-1 font-medium leading-relaxed">
                    {course.difficultyCalibration.hard || 'Complex problem solving and Olympiad level questions.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50/40">
          <span className="text-[11px] text-stone-400 font-medium">
            Chapter ID: {course.id ? String(course.id).slice(0, 8) : 'N/A'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-stone-900 hover:bg-amber-500 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Chapter</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/60 border border-stone-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Courses View (Academics)
// ─────────────────────────────────────────────────────────────
const CoursesView: React.FC = () => {
  const [runbooks, setRunbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [viewingCourse, setViewingCourse] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRunbooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiServices.listRunbooks();
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.items)
            ? res.items
            : [];
      setRunbooks(list);
    } catch (err) {
      console.error('Failed to load curriculum runbooks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRunbooks();
  }, [fetchRunbooks]);

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete chapter "${name}"? This will remove it from the student practice tests.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await ApiServices.removeRunbook(id);
      setActionSuccess(`Chapter "${name}" deleted successfully.`);
      setTimeout(() => setActionSuccess(null), 3500);
      await fetchRunbooks();
    } catch (err) {
      console.error('Failed to delete chapter:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Distinct boards, subjects, grades
  const distinctBoards = ['ALL', ...Array.from(new Set(runbooks.map((r) => r.board).filter(Boolean)))];
  const distinctSubjects = ['ALL', ...Array.from(new Set(runbooks.map((r) => r.subject).filter(Boolean)))];
  const distinctGrades = ['ALL', ...Array.from(new Set(runbooks.map((r) => r.classGrade).filter(Boolean)))];

  // Calculated Overview Stats
  const totalConceptsCount = runbooks.reduce((acc, rb) => {
    if (!rb.coreConcepts) return acc;
    if (Array.isArray(rb.coreConcepts)) return acc + rb.coreConcepts.length;
    if (typeof rb.coreConcepts === 'object') return acc + Object.keys(rb.coreConcepts).length;
    return acc + 1;
  }, 0);

  // Filter by Board, Grade, Subject, and Search Query
  const filteredCourses = runbooks.filter((rb) => {
    const matchesBoard =
      selectedBoard === 'ALL' ||
      (rb.board && rb.board.toUpperCase() === selectedBoard.toUpperCase());

    if (!matchesBoard) return false;

    const matchesGrade =
      selectedGrade === 'ALL' ||
      (rb.classGrade && rb.classGrade.toLowerCase() === selectedGrade.toLowerCase());

    if (!matchesGrade) return false;

    const matchesSubject =
      selectedSubject === 'ALL' ||
      (rb.subject && rb.subject.toLowerCase() === selectedSubject.toLowerCase());

    if (!matchesSubject) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (rb.chapterName && rb.chapterName.toLowerCase().includes(q)) ||
      (rb.subject && rb.subject.toLowerCase().includes(q)) ||
      (rb.board && rb.board.toLowerCase().includes(q)) ||
      (rb.classGrade && rb.classGrade.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Academics & Courses</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Manage curriculum syllabus, boards, classes, and chapter topics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCourse(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Chapter</span>
          </button>
        </div>
      </div>

      {/* Quick Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="admin-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">{runbooks.length}</p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Total Chapters</p>
          </div>
        </div>

        <div className="admin-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">
              {new Set(runbooks.map((r) => r.board).filter(Boolean)).size}
            </p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Active Boards</p>
          </div>
        </div>

        <div className="admin-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">
              {new Set(runbooks.map((r) => r.subject).filter(Boolean)).size}
            </p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Subjects Covered</p>
          </div>
        </div>

        <div className="admin-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xl font-black text-stone-900">{totalConceptsCount}</p>
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Topics Covered</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card !p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search subject, chapter, grade..."
            className="w-full h-10 pl-10 pr-4 rounded-xl text-xs font-semibold text-stone-900 bg-stone-50 border border-stone-200 focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        {/* Dropdowns for Class & Subject */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Grades</option>
            {distinctGrades.filter((g) => g !== 'ALL').map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white cursor-pointer"
          >
            <option value="ALL">All Subjects</option>
            {distinctSubjects.filter((s) => s !== 'ALL').map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Board Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {distinctBoards.map((b) => (
          <button
            key={b}
            onClick={() => {
              setSelectedBoard(b);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedBoard === b
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
          >
            {b === 'ALL' ? 'All Boards' : b}
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="admin-card py-12 flex flex-col items-center justify-center text-stone-400 text-sm gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Loading curriculum courses from database...</span>
          </div>
        ) : paginatedCourses.length === 0 ? (
          <div className="admin-card py-12 text-center text-stone-400 text-sm">
            <BookOpen className="w-6 h-6 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-600 mb-1">No curriculum chapters found</p>
            <p className="text-xs">
              {searchQuery || selectedBoard !== 'ALL' || selectedGrade !== 'ALL' || selectedSubject !== 'ALL'
                ? 'Try clearing the active filters or search keywords.'
                : 'No published chapters found in database.'}
            </p>
          </div>
        ) : (
          paginatedCourses.map((c, i) => {
            const conceptsCount = c.coreConcepts
              ? Array.isArray(c.coreConcepts)
                ? c.coreConcepts.length
                : typeof c.coreConcepts === 'object'
                  ? Object.keys(c.coreConcepts).length
                  : 1
              : 0;

            return (
              <div
                key={c.id || i}
                className="admin-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 flex items-center justify-center shadow-md flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-stone-900 text-base truncate">
                      {c.chapterName || `${c.subject} - ${c.classGrade}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                        {c.board || 'CBSE'}
                      </span>
                      <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                        {c.subject}
                      </span>
                      <span className="text-xs font-semibold text-stone-500">
                        {c.classGrade || 'Class 8'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-stone-500">
                      <span className="font-medium">
                        🎯 <strong className="text-stone-700">{conceptsCount}</strong> Topics
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {c.status || 'PUBLISHED'}
                      </span>
                      {c.lastUpdated && (
                        <>
                          <span>•</span>
                          <span className="text-stone-400">Updated: {c.lastUpdated}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setViewingCourse(c)}
                    title="View Chapter Details"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-500" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingCourse(c);
                      setIsFormModalOpen(true);
                    }}
                    title="Edit Chapter"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(c.id, c.chapterName || c.subject)}
                    disabled={deletingId === c.id}
                    title="Delete Chapter"
                    className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center"
                  >
                    {deletingId === c.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5 items Pagination Footer */}
      {filteredCourses.length > 0 && (
        <div className="admin-card !p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-stone-500 font-medium">
            Showing <span className="font-bold text-stone-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-stone-800">
              {Math.min(currentPage * pageSize, filteredCourses.length)}
            </span>{' '}
            of <span className="font-bold text-stone-800">{filteredCourses.length}</span> chapters
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isFormModalOpen && (
        <CourseFormModal
          initialCourse={editingCourse}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingCourse(null);
          }}
          onSaved={() => {
            setActionSuccess(
              editingCourse
                ? `Chapter updated successfully!`
                : `New chapter created successfully!`
            );
            setTimeout(() => setActionSuccess(null), 3500);
            fetchRunbooks();
          }}
        />
      )}

      {/* Deep-Dive View Details Modal */}
      {viewingCourse && (
        <CourseDetailModal
          course={viewingCourse}
          onClose={() => setViewingCourse(null)}
          onEdit={() => {
            setEditingCourse(viewingCourse);
            setViewingCourse(null);
            setIsFormModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Reports View
// ─────────────────────────────────────────────────────────────
const ReportsView: React.FC = () => {
  const reports = [
    { title: 'Monthly Platform Report', period: 'August 2026', type: 'PDF', size: '2.4 MB', status: 'Ready' },
    { title: 'User Growth Analytics', period: 'Q3 2026', type: 'CSV', size: '1.1 MB', status: 'Ready' },
    { title: 'Course Completion Summary', period: 'August 2026', type: 'PDF', size: '890 KB', status: 'Processing' },
    { title: 'Revenue & Subscription Report', period: 'August 2026', type: 'XLSX', size: '3.2 MB', status: 'Ready' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900">Reports</h1>
        <p className="text-sm text-stone-500 font-medium mt-1">Download and view platform analytics reports.</p>
      </div>
      <div className="grid gap-4">
        {reports.map((r, i) => (
          <div key={i} className="admin-card flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0
              ${r.type === 'PDF' ? 'bg-red-100' : r.type === 'CSV' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
              <BarChart3 className={`w-6 h-6 ${r.type === 'PDF' ? 'text-red-500' : r.type === 'CSV' ? 'text-emerald-600' : 'text-blue-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-stone-900 truncate">{r.title}</p>
              <p className="text-xs text-stone-400 mt-0.5">{r.period} · {r.size}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.status === 'Ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {r.status}
              </span>
              {r.status === 'Ready' && (
                <button className="text-xs font-black text-amber-600 hover:text-amber-800 border border-amber-200 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-all hover:bg-amber-50 hidden sm:block">
                  Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Manage Blogs View (With Edit/Delete Colors, Pagination & Custom Modal)
// ─────────────────────────────────────────────────────────────
const ManageBlogsView: React.FC<{ setActiveView: (v: AdminView) => void }> = ({ setActiveView }) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Custom Delete Modal State
  const [blogToDelete, setBlogToDelete] = useState<{ id: number; title: string } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Fetch categories directly from database
  useEffect(() => {
    ApiServices.listBlogCategories()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        setCategories(list);
      })
      .catch((err: any) => console.error('Failed to fetch categories:', err));
  }, []);

  const fetchBlogs = useCallback(async (query?: string, categoryFilter?: string) => {
    setLoading(true);
    try {
      const activeCat = categoryFilter !== undefined ? categoryFilter : selectedCategory;
      const filters: any = { status: 'all' };
      if (query && query.trim()) filters.search = query.trim();
      if (activeCat && activeCat !== 'all') filters.category = activeCat;

      const res = await ApiServices.listBlogs(filters);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
            ? res.data
            : [];
      setBlogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setCurrentPage(1);
    fetchBlogs(val, selectedCategory);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCategory(val);
    setCurrentPage(1);
    fetchBlogs(searchQuery, val);
  };

  const handleCreateBlog = () => {
    navigate('/add-blogs');
  };

  const handleEditBlog = (b: any) => {
    navigate(`/edit-blog/${b.id}`);
  };

  // Open delete modal
  const promptDeleteBlog = (blog: any) => {
    setBlogToDelete({ id: blog.id, title: blog.title });
  };

  // Execute actual API deletion
  const handleExecuteDelete = async () => {
    if (!blogToDelete) return;
    const id = blogToDelete.id;
    setDeletingId(id);
    try {
      await ApiServices.deleteBlog(id);
      setToast('Blog deleted successfully');
      setTimeout(() => setToast(null), 3500);
      await fetchBlogs(searchQuery, selectedCategory);
    } catch (err) {
      console.error('Failed to delete blog:', err);
    } finally {
      setDeletingId(null);
      setBlogToDelete(null);
    }
  };

  const totalPages = Math.ceil(blogs.length / pageSize);
  const paginatedBlogs = blogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold shadow-sm animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Manage Blogs</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">Create and manage content for your platform.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter Dropdown (Direct from DB) */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="pl-9 pr-9 py-2 bg-white border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all cursor-pointer appearance-none shadow-2xs"
            >
              <option value="all">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search blogs..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-2xs"
            />
          </div>

          {/* Add Blog Button */}
          <button
            onClick={handleCreateBlog}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Blog
          </button>
        </div>
      </div>

      <div className="admin-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Title</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Author</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Category</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Status</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Views</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Date</th>
                <th className="text-right px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-stone-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                      <span> </span>
                    </div>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-stone-400 font-medium">
                    <p className="font-semibold text-stone-600 mb-1">No blogs found in MySQL</p>
                    <p className="text-xs">Click "Add Blog" above to create and publish your first post.</p>
                  </td>
                </tr>
              ) : (
                paginatedBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-800">{b.title}</p>
                    </td>
                    <td className="px-6 py-4 text-stone-600 font-medium">{b.author || 'Admin User'}</td>
                    <td className="px-6 py-4 text-stone-600">{b.category || 'General'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${b.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200/80">
                        <Eye className="w-3.5 h-3.5 text-stone-400" />
                        {Number(b.sharesCount ?? b.shares_count ?? 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs">{b.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button - Blue Background */}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleEditBlog(b);
                          }}
                          title="Edit Blog"
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button - Red/Rose Background */}
                        <button
                          type="button"
                          onClick={() => promptDeleteBlog(b)}
                          disabled={deletingId === b.id}
                          title="Delete Blog"
                          className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {blogs.length > 0 && (
          <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-stone-500 font-medium">
              Showing <span className="font-bold text-stone-800">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-stone-800">{Math.min(currentPage * pageSize, blogs.length)}</span> of{' '}
              <span className="font-bold text-stone-800">{blogs.length}</span> blogs
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 font-semibold hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {blogToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">Delete Blog Post?</h3>
              <p className="text-xs text-stone-500 font-medium mb-5">
                Are you sure you want to delete <span className="font-semibold text-stone-800">"{blogToDelete.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setBlogToDelete(null)}
                  disabled={deletingId !== null}
                  className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={deletingId !== null}
                  className="flex-1 py-2.5 px-4 bg-rose-400 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {deletingId !== null ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────
// Add Blog View (Verified Icons, Proper Div Structure & Colors)
// ─────────────────────────────────────────────────────────────
const AddBlogView: React.FC<{ setActiveView: (v: AdminView) => void }> = ({ setActiveView }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Education');
  const [author, setAuthor] = useState('Admin User');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([
    'Education',
    'Technology',
    'Engineering',
    'Parenting',
    'Platform News',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiServices.listBlogCategories()
      .then((res: any) => {
        const catList = res?.data || [];
        if (Array.isArray(catList) && catList.length > 0) {
          const names = catList.map((c: any) => c.name);
          setCategories(prev => Array.from(new Set([...names, ...prev])));
        }
      })
      .catch(() => { });
  }, []);

  const handleSave = async (status: 'Published' | 'Draft') => {
    if (!title.trim()) {
      setError('Blog title is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await ApiServices.createBlog({
        title: title.trim(),
        category,
        author: author.trim() || 'Admin User',
        content,
        status,
        date: new Date().toISOString().slice(0, 10),
      });
      setActiveView('manage-blogs' as AdminView);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to create blog'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveView('manage-blogs' as AdminView)}
            className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-500 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-stone-900">Create New Blog</h1>
            <p className="text-sm text-stone-500 font-medium mt-1">Draft a new post for your audience in MySQL.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSave('Draft')}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('Published')}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish Post
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm font-semibold shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-card space-y-6">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Blog Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter an engaging title..."
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Admin User"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Content</label>
          <Suspense fallback={<div className="h-80 flex items-center justify-center text-sm text-stone-500">Loading editor...</div>}>
            <JoditEditor
              key="add-blog-editor"
              value={content}
              onChange={(value: string) => setContent(value)}
              config={BLOG_CONTENT_EDITOR_CONFIG}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────
// Category View (With Full Add, Edit, Delete, & Live API Integration)
// ─────────────────────────────────────────────────────────────
const CategoryView: React.FC<{ setActiveView: (v: string) => void }> = () => {
  interface CategoryItem {
    id: number;
    name: string;
    count: number;
    isActive: boolean;
    status: string;
  }

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add / Edit Modal State
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [categoryForm, setCategoryForm] = useState<{ id?: number; name: string; isActive: boolean }>({
    name: '',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Custom Delete Modal State
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Categories from Backend API
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiServices.listBlogCategories();
      const list = Array.isArray(res) ? res : res?.data || [];
      const mapped: CategoryItem[] = list.map((c: any) => ({
        id: c.id,
        name: c.name || 'Unnamed Category',
        count: typeof c.count === 'number' ? c.count : (typeof c.items === 'number' ? c.items : 0),
        isActive: c.isActive !== undefined ? Boolean(c.isActive) : (c.is_active !== undefined ? Boolean(c.is_active) : true),
        status: (c.isActive !== undefined ? c.isActive : (c.is_active !== undefined ? c.is_active : true)) ? 'Active' : 'Inactive',
      }));
      setCategories(mapped);
    } catch (err: any) {
      console.error('Failed to fetch blog categories:', err);
      showToast('error', err?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Add Category Modal
  const openAddModal = () => {
    setCategoryForm({ name: '', isActive: true });
    setModalMode('add');
  };

  // Open Edit Category Modal
  const openEditModal = (cat: CategoryItem) => {
    setCategoryForm({ id: cat.id, name: cat.name, isActive: cat.isActive });
    setModalMode('edit');
  };

  // Save / Update Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = categoryForm.name.trim();
    if (!cleanName) {
      showToast('error', 'Category name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        await ApiServices.createBlogCategory({
          name: cleanName,
          is_active: categoryForm.isActive,
        });
        showToast('success', `Category "${cleanName}" created successfully!`);
      } else if (modalMode === 'edit' && categoryForm.id) {
        await ApiServices.updateBlogCategory(categoryForm.id, {
          name: cleanName,
          is_active: categoryForm.isActive,
        });
        showToast('success', `Category "${cleanName}" updated successfully!`);
      }
      setModalMode(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      showToast('error', err?.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Delete Confirmation Modal
  const promptDeleteCategory = (cat: { id: number; name: string }) => {
    setCategoryToDelete(cat);
  };

  // Execute Deletion
  const handleExecuteDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await ApiServices.deleteBlogCategory(categoryToDelete.id);
      showToast('success', `Category "${categoryToDelete.name}" deleted successfully!`);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      showToast('error', err?.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / pageSize) || 1;
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold shadow-xl border backdrop-blur-md animate-in fade-in duration-300 ${toast.type === 'success'
            ? 'bg-emerald-500/90 text-white border-emerald-400'
            : 'bg-rose-500/90 text-white border-rose-400'
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

      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">Categories</h1>
          <p className="text-sm text-stone-500 font-medium mt-1">Manage content categories and tags.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search categories..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition-all whitespace-nowrap cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="admin-card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Name</th>
                <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-stone-400">Items</th>
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
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-stone-400 font-medium">
                    No categories found. Click <strong>+ Add Category</strong> to create one.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/40 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-stone-800">{c.name}</td>
                    <td className="px-6 py-4 text-stone-600 font-medium">{c.count}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${c.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Soft Blue Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          title="Edit Category"
                          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100/80 hover:text-blue-700 rounded-xl transition-all cursor-pointer active:scale-95"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Soft Red Delete Button */}
                        <button
                          type="button"
                          onClick={() => promptDeleteCategory(c)}
                          title="Delete Category"
                          className="p-1.5 bg-rose-50/80 text-rose-400 hover:bg-rose-100 hover:text-rose-500 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing {filteredCategories.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredCategories.length)} of {filteredCategories.length} categories
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${currentPage === pNum
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
              >
                {pNum}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Add / Edit Category Modal
         ───────────────────────────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                  {modalMode === 'add' ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {modalMode === 'add' ? 'Create a category for organizing articles' : 'Update category name and status'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Category Name <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence, Mathematics..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                />
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Status</label>
                  <select
                    value={categoryForm.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.value === 'active' })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="active">Active (Visible across platform)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'add' ? 'Create Category' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Delete Confirmation Modal
         ───────────────────────────────────────────────────────────── */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">Delete Category?</h3>
              <p className="text-xs text-stone-500 font-medium mb-5">
                Are you sure you want to delete <span className="font-semibold text-stone-800">"{categoryToDelete.name}"</span>? This action will remove the category from the database.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────
// Admin Dashboard Shell
// ─────────────────────────────────────────────────────────────
interface AdminDashboardProps {
  onLogout: () => void;
  user?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('EduJunction_admin_sidebar_collapsed') || localStorage.getItem('acugrade_admin_sidebar_collapsed');
      if (stored !== null) return stored === 'true';
      return true; // Default to collapsed for Admin persona
    } catch {
      return true;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('EduJunction_admin_sidebar_collapsed', String(next));
      } catch { }
      return next;
    });
  };

  // navigate-based replacement for setActiveView — child views use this to navigate between pages
  const navigate = useNavigate();
  const location = useLocation();
  const isBlogEditor = location.pathname.startsWith('/edit-blog/');
  const activeView: AdminView = isBlogEditor ? 'edit-blog' : location.pathname.split('/').pop() || 'dashboard';
  const editBlogId = location.pathname.split('/').pop() || '';
  const setActiveView = (view: string) => {
    if (view.startsWith('/')) navigate(view);
    else navigate('/' + view);
  };

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const [pageAccess, setPageAccess] = useState<any[]>(() => {
    const stored = sessionStorage.getItem('EduJunction_admin_page_access') || localStorage.getItem('EduJunction_admin_page_access') || sessionStorage.getItem('acugrade_admin_page_access') || localStorage.getItem('acugrade_admin_page_access');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BarChart3': return <BarChart3 className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Play': return <Play className="w-5 h-5" />;
      case 'Bot': return <Bot className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'Settings': return <Settings className="w-5 h-5" />;
      case 'LayoutDashboard': return <LayoutDashboard className="w-5 h-5" />;
      default: return <LayoutDashboard className="w-5 h-5" />;
    }
  };


  const navItems = pageAccess.map(page => ({
    id: page.pageRoute?.split('/').pop() || 'dashboard',
    route: page.pageRoute || '/admin/dashboard',
    icon: getIcon(page.icon),
    label: page.pageName,
    navId: `admin-nav-${page.pageRoute?.split('/').pop() || 'dashboard'}`
  }));

  const handleNav = (item: { id: string; route: string }) => {
    navigate(item.route);
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen w-full bg-stone-50 flex font-sans overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-full flex-shrink-0 shadow-xl overflow-hidden
          bg-gradient-to-b from-yellow-50/40 via-white to-orange-50/20 border-r border-stone-200/60
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:shadow-none
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          w-72
        `}
      >
        {/* Decorative background blob in sidebar */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-yellow-100/30 to-transparent pointer-events-none"></div>

        {/* Brand */}
        <div className={`h-16 w-full flex items-center justify-between ${collapsed ? 'lg:justify-center px-4' : 'px-6'} border-b border-stone-100 flex-shrink-0 relative z-10 transition-all`}>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-lg font-bold text-stone-900 tracking-tight transition-all">
                  Edu<span className="text-yellow-500">Junction</span>
                </span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 mt-0.5 leading-none">Admin Console</p>
              </div>
            )}
          </div>
          {/* Desktop collapse toggle */}
          <button
            id="admin-sidebar-collapse"
            onClick={toggleCollapsed}
            className={`hidden lg:flex p-1.5 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 bg-stone-50 border border-stone-100 rounded-lg transition-colors ${collapsed ? '' : 'ml-auto'}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto mt-2 relative z-10 custom-scrollbar">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              id={item.navId}
              icon={item.icon}
              label={item.label}
              active={activeView === item.id}
              collapsed={collapsed}
              onClick={() => handleNav(item)}
            />
          ))}
        </nav>

        {/* Footer Actions (Logout) */}
        <div className="p-4 border-t border-stone-100 mt-auto relative z-10">
          <button
            id="admin-nav-logout"
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-600 rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
            title="Log out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-stone-400" />
            <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ───────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">

        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              id="admin-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-black text-stone-800">
                Welcome, {user?.name || 'Admin'} 👋
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Date and Time */}
            <div className="hidden sm:block text-right">
              <p className="text-xs text-stone-700 font-semibold">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-[10px] text-stone-400 font-medium">
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification bell */}
              <button
                id="admin-notifications"
                className="relative p-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>

              {/* Admin Avatar */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-xl border border-transparent hover:bg-stone-50 hover:border-stone-200 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-yellow-50 to-amber-50 border border-yellow-200 flex items-center justify-center text-base sm:text-lg shadow-sm group-hover:scale-105 transition-transform" title="Admin Profile">
                    🧑‍💼
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/60 rounded-t-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-xs shrink-0">
                          {(user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-900 truncate">{user?.name || 'Admin'} (Admin)</p>
                          <p className="text-[10px] text-stone-400 truncate">{user?.email || 'admin@EduJunction.com'}</p>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                      </div>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs text-stone-700 hover:bg-stone-100 transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4 text-stone-400" />
                        <span className="font-medium text-stone-900">Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {(() => {
            // Dynamic view registry — add new pages here as backend adds them
            const VIEW_MAP: Record<string, React.ReactNode> = {
              dashboard: <DashboardView />,
              users: <UsersView />,
              academics: <AcademicsHub />,
              courses: <AcademicsHub />,
              'ai-rag': <AiRagHub />,
              airag: <AiRagHub />,
              analytics: <ReportsView />,
              reports: <ReportsView />,
              blogs: <ManageBlogsView setActiveView={(v) => navigate('/' + v)} />,
              'manage-blogs': <ManageBlogsView setActiveView={(v) => navigate('/' + v)} />,
              'add-blogs': <BlogFormModal isOpen fullPage initialBlog={null} onClose={() => navigate('/manage-blogs')} onSuccess={() => navigate('/manage-blogs')} />,
              'edit-blog': <BlogEditPage blogId={editBlogId} onBack={() => navigate('/manage-blogs')} onSaved={() => { }} />,
              category: <CategoryView setActiveView={(v) => navigate('/' + v)} />,
            };

            return VIEW_MAP[activeView] ?? (
              <div className="flex flex-col items-center justify-center h-full text-stone-400 font-medium py-20">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-stone-300" />
                </div>
                <p className="text-lg text-stone-600 font-bold mb-1">Coming Soon</p>
                <p className="text-sm">This module is currently under construction.</p>
              </div>
            );
          })()}
        </main>
      </div>

      {/* Inline scoped styles */}
      <style>{`
        .admin-card {
          background: white;
          border: 1px solid rgba(231,229,228,0.7);
          border-radius: 1.25rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04);
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Admin Login Page
// ─────────────────────────────────────────────────────────────
type AuthScreen = 'login' | 'forgot-password';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Auth state ──────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const tokens = getStoredTokens();
    if (!tokens) return false;
    const payload = decodeTokenPayload(tokens.accessToken);
    const role = (payload?.role ?? '').toUpperCase();
    return role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'AUTHOR';
  });

  const [adminUser, setAdminUser] = useState<any>(() => {
    const stored = sessionStorage.getItem('EduJunction_admin_user') || localStorage.getItem('EduJunction_admin_user') || sessionStorage.getItem('acugrade_admin_user') || localStorage.getItem('acugrade_admin_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [view, setView] = useState<AuthScreen>('login');

  // Synchronize router path when authenticated or not
  useEffect(() => {
    if (isAuthenticated) {
      if (location.pathname === '/admin' || location.pathname === '/admin/login') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // ── Login form state ────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ── Create New Password state ───────────────
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);
  const [resetFieldErrors, setResetFieldErrors] = useState<{
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const clearFieldError = (field: 'email' | 'password') => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (errorMessage) setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Please enter your admin email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) errs.password = 'Please enter your password.';
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await ApiServices.adminLogin({ email: email.trim(), password });
      const result = response.data?.data || response.data;

      const accessToken = result.accessToken || result.tokens?.accessToken;
      const refreshToken = result.refreshToken || result.tokens?.refreshToken;

      if (accessToken && refreshToken) {
        storeTokens({ accessToken, refreshToken });
      }

      const payload = accessToken ? decodeTokenPayload(accessToken) : null;
      const userRole = ((payload?.role || result.user?.role || result.user?.roleName || '') as string).toUpperCase();

      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        clearTokens();
        sessionStorage.removeItem('EduJunction_admin_user');
        sessionStorage.removeItem('acugrade_admin_user');
        setErrorMessage('Access denied. This portal is restricted to admin accounts only.');
        return;
      }

      const userData = result.user || {
        email: email.trim(),
        name: result.user?.name || 'EduJunction Admin',
        role: userRole,
        roleName: userRole,
      };

      sessionStorage.setItem('EduJunction_admin_user', JSON.stringify(userData));
      sessionStorage.setItem('EduJunction_admin_page_access', JSON.stringify(result.pageAccess || []));
      setAdminUser(userData);

      setLoginSuccess(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        navigate('/admin/dashboard');
      }, 500);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Unable to sign in. Please check your credentials and try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetErrorMessage(null);
    setResetFieldErrors({});

    const errs: { email?: string; newPassword?: string; confirmPassword?: string } = {};
    if (!resetEmail.trim()) {
      errs.email = 'Please enter your admin email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!newPassword) {
      errs.newPassword = 'Please enter a new password.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errs).length) {
      setResetFieldErrors(errs);
      return;
    }

    setResetSubmitting(true);
    try {
      await ApiServices.adminResetPassword({
        email: resetEmail.trim(),
        newPassword,
      });
      setResetSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password. Please try again.';
      setResetErrorMessage(msg);
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const tokens = getStoredTokens();
    try {
      if (tokens) await ApiServices.logout({ refreshToken: tokens.refreshToken });
    } catch {
      /* best-effort */
    }
    clearTokens();
    sessionStorage.removeItem('EduJunction_admin_user');
    sessionStorage.removeItem('acugrade_admin_user');
    localStorage.removeItem('EduJunction_admin_user');
    localStorage.removeItem('acugrade_admin_user');
    setAdminUser(null);
    setIsAuthenticated(false);
    setLoginSuccess(false);
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    navigate('/admin/login');
  };

  // If already authenticated or on dashboard route with valid auth, show dashboard
  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} user={adminUser} />;
  }

  // ── Clean EduJunction Admin Sign In Page ──────────
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-xl shadow-stone-200/50">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-lg shadow-yellow-200 mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="font-black text-xl tracking-tight">
            <span className="text-stone-900">Edu</span><span className="text-yellow-500">Junction</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-4">
            {view === 'login' ? 'Admin Sign In' : 'Create New Password'}
          </h1>
        </div>

        {/* ── View: Admin Sign In ── */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            {/* Admin Email */}
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative group">
                <Mail
                  size={17}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${fieldErrors.email ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                    }`}
                />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder="admin@EduJunction.com"
                  autoComplete="email"
                  className={`w-full h-12 pl-11 pr-4 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                    placeholder:text-stone-300 placeholder:font-normal
                    bg-stone-50/60 border-2
                    ${fieldErrors.email
                      ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                    }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <Lock
                  size={17}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${fieldErrors.password ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                    }`}
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full h-12 pl-11 pr-12 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                    placeholder:text-stone-300 placeholder:font-normal
                    bg-stone-50/60 border-2
                    ${fieldErrors.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                    }`}
                />
                <button
                  type="button"
                  id="admin-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                id="admin-forgot-password"
                onClick={() => {
                  setResetEmail(email);
                  setResetSuccess(false);
                  setResetErrorMessage(null);
                  setResetFieldErrors({});
                  setView('forgot-password');
                }}
                className="text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={isSubmitting || loginSuccess}
              className="w-full h-12 rounded-2xl font-extrabold text-sm transition-all duration-200 shadow-lg shadow-yellow-200 bg-yellow-400 hover:bg-yellow-500 text-stone-900 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : loginSuccess ? (
                <span>Signed In</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        )}

        {/* ── View: Create New Password ── */}
        {view === 'forgot-password' && (
          <div>
            {resetSuccess ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-stone-800">Password created successfully.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(resetEmail);
                    setPassword('');
                    setView('login');
                  }}
                  className="w-full h-12 rounded-2xl font-extrabold text-sm transition-all duration-200 shadow-lg shadow-yellow-200 bg-yellow-400 hover:bg-yellow-500 text-stone-900 active:scale-[0.98] flex items-center justify-center mt-4"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
                {/* Admin Email */}
                <div>
                  <label htmlFor="reset-email" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                    Admin Email
                  </label>
                  <div className="relative group">
                    <Mail
                      size={17}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${resetFieldErrors.email ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                        }`}
                    />
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="admin@EduJunction.com"
                      autoComplete="email"
                      className={`w-full h-12 pl-11 pr-4 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                        placeholder:text-stone-300 placeholder:font-normal bg-stone-50/60 border-2 ${resetFieldErrors.email
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                          : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                        }`}
                    />
                  </div>
                  {resetFieldErrors.email && (
                    <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{resetFieldErrors.email}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="new-password" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={17}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${resetFieldErrors.newPassword ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                        }`}
                    />
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full h-12 pl-11 pr-12 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                        placeholder:text-stone-300 placeholder:font-normal bg-stone-50/60 border-2 ${resetFieldErrors.newPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                          : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {resetFieldErrors.newPassword && (
                    <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{resetFieldErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock
                      size={17}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${resetFieldErrors.confirmPassword ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                        }`}
                    />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      placeholder="••••••••"
                      className={`w-full h-12 pl-11 pr-12 rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all
                        placeholder:text-stone-300 placeholder:font-normal bg-stone-50/60 border-2 ${resetFieldErrors.confirmPassword
                          ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-400/15'
                          : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/15 focus:bg-white'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {resetFieldErrors.confirmPassword && (
                    <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{resetFieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Error Message */}
                {resetErrorMessage && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{resetErrorMessage}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  id="admin-reset-submit"
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full h-12 rounded-2xl font-extrabold text-sm transition-all duration-200 shadow-lg shadow-yellow-200 bg-yellow-400 hover:bg-yellow-500 text-stone-900 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
                >
                  {resetSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <span>Create Password</span>
                  )}
                </button>

                {/* Back to Sign In Link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView('login');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;