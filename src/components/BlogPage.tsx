import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowLeft,
  Calendar,
  Tag,
  ArrowRight,
  Search,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  Share2,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import DOMPurify from "dompurify";
import { PublicHeader } from "./common/PublicHeader";
import { PublicFooter } from "./common/PublicFooter";
import { SEO } from "./common/SEO";

export interface BlogPostData {
  id: string;
  title: string;
  heading?: string;
  introduction?: string;
  slug: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  publishedDate: string;
  sharesCount?: number;
  category: string;
  categoryId: number | null;
  classRange: string;
  board: string;
  coverGradient: string;
  coverEmoji: string;
  summary: string;
  content: string[];
  tags: string[];
  featured: boolean;
  image: string;
}

// ── Markdown bold
const renderMD = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold text-stone-900">{p}</strong> : <span key={i}>{p}</span>
  );
};

const catColor = (_category: string) => "text-stone-500";

// ─────────────────────────────────────────────────────────────────────────────
// Cover image (gradient + emoji, like a real thumbnail)
// ─────────────────────────────────────────────────────────────────────────────
const CoverImg: React.FC<{ post: BlogPostData }> = ({ post }) => (
  <div className="relative w-full h-48 overflow-hidden bg-stone-100 flex items-center justify-center group-hover:opacity-90 transition-opacity">
    {post.image ? (
      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-amber-100 via-stone-100 to-emerald-100 p-6 flex flex-col justify-end">
        <BookOpen className="w-8 h-8 text-stone-700/40 mb-3" />
        <p className="max-w-xs text-xl font-black leading-tight text-stone-800/80">EduJunction Journal</p>
      </div>
    )}
    <div className="absolute inset-0 bg-black/10" />
    {/* class + board chips */}
    <div className="absolute top-3 left-3 flex gap-1.5 z-10">
      <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold">{post.board}</span>
      <span className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm text-white text-[9px] font-bold border border-white/20">{post.classRange}</span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Blog Card — exact EduJobs reference layout
// ─────────────────────────────────────────────────────────────────────────────
const BlogCard: React.FC<{ post: BlogPostData }> = ({ post }) => (
  <Link
    to={`/blog/${post.slug}`}
    className="group bg-white rounded-xl border border-stone-200 hover:shadow-lg hover:border-stone-300 shadow-sm overflow-hidden cursor-pointer transition-all duration-200 flex flex-col"
  >
    {/* Thumbnail */}
    <CoverImg post={post} />

    {/* Body */}
    <div className="p-5 flex flex-col flex-1">
      {/* Category label */}
      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${catColor(post.category)}`}>
        {post.category}
      </p>

      {/* Title */}
      <h3 className="font-black text-stone-900 text-[15px] leading-snug group-hover:text-yellow-600 transition-colors mb-2 line-clamp-2">
        {post.title}
      </h3>

      {/* Meta: Leave a Comment / Category / Author */}
      <p className="text-[10px] text-stone-400 mb-3 flex items-center gap-1 flex-wrap">
        <span className="flex items-center gap-0.5 hover:text-yellow-600 cursor-pointer transition-colors">
          <MessageSquare className="w-2.5 h-2.5" /> Leave a Comment
        </span>
        <span className="mx-0.5">/</span>
        <span className={`font-semibold ${catColor(post.category)}`}>{post.category}</span>
        <span className="mx-0.5">/</span>
        <span>{post.author}</span>
      </p>

      {/* Excerpt */}
      <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 flex-1 mb-5">{post.summary}</p>

      {/* Read More button */}
      <div className="w-full py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-stone-900 font-black text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 group-hover:gap-2.5">
        Read More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  </Link>
);

// ─────────────────────────────────────────────────────────────────────────────
// Article Detail page
// ─────────────────────────────────────────────────────────────────────────────
const ArticleDetail: React.FC<{ post: BlogPostData; allPosts: BlogPostData[]; onBack: () => void }> = ({ post, allPosts, onBack }) => {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [post]);

  const [sharesCount, setSharesCount] = useState<number>(post.sharesCount || 0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSharesCount(post.sharesCount || 0);
  }, [post.sharesCount]);

  const relatedPosts = allPosts.filter(p => p.category === post.category && p.id !== post.id).slice(0, 3);
  const latestPosts = allPosts.filter(p => p.id !== post.id).slice(0, 4);

  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  // Robust formatted published date
  const formattedDate = useMemo(() => {
    try {
      const d = new Date(post.publishedDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      }
    } catch { }
    return post.publishedDate || "Recently Published";
  }, [post.publishedDate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleShare = async (platform: 'facebook' | 'linkedin' | 'whatsapp' | 'native') => {
    const url = window.location.href;
    const title = post.title || 'Check out this article on EduJunction';

    // Asynchronously increment share counter in database
    if (post.id) {
      ApiServices.shareBlog(post.id)
        .then(() => setSharesCount(prev => prev + 1))
        .catch(() => { });
    }

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=620,height=480,noopener,noreferrer');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=620,height=520,noopener,noreferrer');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + url)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({ title, url });
            showToast('Thank you for sharing!');
            return;
          } catch (e) {
            // Cancelled or unsupported, fallback to copy link
          }
        }
        if (navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(url);
            showToast('Link copied to clipboard! 📋');
          } catch {
            showToast('Link copied!');
          }
        }
        break;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content (Left) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Hero Image - Full Align / Edge-to-Edge */}
            <div className="w-full aspect-video max-h-[480px] overflow-hidden bg-stone-100 border-b border-stone-100">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>

            {/* Article Body Content */}
            <div className="p-6 sm:p-10">
              {/* Category Pill */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded bg-[#0d47a1] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight mb-4">{post.heading || post.title}</h1>

              {/* Meta: Author & Date */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-2.5 text-sm text-stone-500 mb-6 font-medium">
                <span>By <span className="text-stone-800 font-bold">{post.author}</span></span>
                <span className="text-stone-300">•</span>
                <span>{formattedDate}</span>
              </div>

              {/* Share Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-100 relative">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-black mr-1">Share</span>
                  <button
                    type="button"
                    onClick={() => handleShare('facebook')}
                    title="Share on Facebook"
                    aria-label="Share on Facebook"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1877F2] text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="text-sm font-bold font-serif">f</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('linkedin')}
                    title="Share on LinkedIn"
                    aria-label="Share on LinkedIn"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A66C2] text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="text-xs font-bold font-sans">in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('whatsapp')}
                    title="Share on WhatsApp"
                    aria-label="Share on WhatsApp"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#25D366] text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="text-xs font-bold font-sans">Wa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare('native')}
                    title="Copy Link / Share"
                    aria-label="Copy Link"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 hover:scale-105 active:scale-95 border border-stone-200 transition-all shadow-2xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Toast message */}
                {toastMessage && (
                  <div className="absolute -top-10 left-0 bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{toastMessage}</span>
                  </div>
                )}
              </div>

              {/* Breadcrumb */}
              <div className="text-xs text-stone-500 mb-8 flex items-center gap-1.5 flex-wrap font-semibold">
                <Link to="/" className="text-[#0d47a1] hover:underline">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to="/blog" className="text-[#0d47a1] hover:underline">Blog</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-stone-700">{post.title}</span>
              </div>

              {/* Content Header */}
              <h2 className="text-xl font-bold text-stone-900 mb-4">Introduction</h2>
              {post.introduction && (
                <div
                  className="mb-6 text-stone-600 font-medium prose prose-stone max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.introduction) }}
                />
              )}

              {/* Content Body */}
              <div className="space-y-6 text-stone-700 text-[15px] leading-relaxed">
                {post.content?.map((para, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(para) }} />
                ))}
              </div>

              {/* Previous & Next Post */}
              <div className="mt-10 pt-8 border-t border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                {prevPost ? (
                  <Link to={`/blog/${prevPost.slug}`} className="group max-w-[45%] flex-1">
                    <p className="text-xs text-stone-400 mb-1 font-bold">Previous Post</p>
                    <p className="text-[#0d47a1] text-sm font-semibold group-hover:underline line-clamp-2">
                      {prevPost.title}
                    </p>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
                {nextPost ? (
                  <Link to={`/blog/${nextPost.slug}`} className="group max-w-[45%] flex-1 text-left sm:text-right">
                    <p className="text-xs text-stone-400 mb-1 font-bold">Next Post</p>
                    <p className="text-[#0d47a1] text-sm font-semibold group-hover:underline line-clamp-2">
                      {nextPost.title}
                    </p>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-1 space-y-8">

            {/* Latest Articles */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="bg-yellow-400 px-4 py-3 border-b border-yellow-500">
                <h3 className="text-sm font-black text-stone-900 tracking-wider">LATEST ARTICLES</h3>
              </div>
              <div className="p-4 space-y-4">
                {latestPosts.map(p => (
                  <Link to={`/blog/${p.slug}`} key={p.id} className="flex gap-3 group">
                    <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-md border border-stone-200 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#0d47a1] transition-colors line-clamp-2 mb-1">{p.title}</h4>
                      <p className="text-[10px] text-stone-500 font-medium">{new Date(p.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} | By {p.author}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="bg-yellow-400 px-4 py-3 border-b border-yellow-500">
                  <h3 className="text-sm font-black text-stone-900 tracking-wider">RELATED ARTICLES</h3>
                </div>
                <div className="p-4 space-y-4">
                  {relatedPosts.map(p => (
                    <Link to={`/blog/${p.slug}`} key={p.id} className="flex gap-3 group">
                      <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-md border border-stone-200 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#0d47a1] transition-colors line-clamp-2 mb-1">{p.title}</h4>
                        <p className="text-[10px] text-stone-500 font-medium">{new Date(p.publishedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} | By {p.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main BlogPage
// ─────────────────────────────────────────────────────────────────────────────
export const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<number | "All">("All");
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(6);
  const PER_PAGE_OPTIONS = [3, 6, 9, 12];

  const loadPublicBlogs = () => {
    let mounted = true;
    Promise.all([
      ApiServices.listBlogs({ status: "Published" }),
      ApiServices.listBlogCategories(),
    ])
      .then(([blogsResponse, categoriesResponse]: any[]) => {
        if (!mounted) return;
        const categoryRecords = Array.isArray(categoriesResponse)
          ? categoriesResponse
          : Array.isArray(categoriesResponse?.items)
            ? categoriesResponse.items
            : Array.isArray(categoriesResponse?.data)
              ? categoriesResponse.data
              : [];
        setCategories(categoryRecords
          .filter((category: any) => category?.isActive !== false)
          .map((category: any) => ({ id: Number(category.id), name: category.name }))
          .filter((category: { id: number; name: string }) => Number.isFinite(category.id) && category.name));

        const response = blogsResponse;
        const records = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.data)
              ? response.data
              : [];
        setPosts(records.map((blog: any) => ({
          id: String(blog.id),
          title: blog.title || "Untitled blog",
          heading: blog.heading || blog.title || "Untitled blog",
          introduction: blog.introduction || "",
          slug: blog.slug || `blog-${blog.id}`,
          author: blog.author || "Admin User",
          authorRole: "EduJunction",
          authorAvatar: "",
          readTime: "5 min read",
          publishedDate: blog.isoDate || blog.date || new Date().toISOString(),
          sharesCount: Number(blog.sharesCount || blog.shares_count || 0),
          category: blog.category || "Uncategorized",
          categoryId: blog.categoryId == null ? null : Number(blog.categoryId),
          classRange: "All classes",
          board: "All boards",
          coverGradient: "",
          coverEmoji: "",
          summary: blog.introduction || blog.content || "Read the latest learning update from EduJunction.",
          content: Array.isArray(blog.content) && blog.content.length > 0
            ? blog.content
            : (blog.content || "Read the latest learning update from EduJunction.").split(/\n\s*\n/),
          tags: Array.isArray(blog.tags) ? blog.tags : [],
          featured: false,
          image: blog.imageUrl || blog.image || "",
        })));
      })
      .catch((error) => console.error("Failed to load public blogs and categories:", error))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  };

  useEffect(() => {
    const cleanup = loadPublicBlogs();
    const handleFocus = () => loadPublicBlogs();
    window.addEventListener("focus", handleFocus);
    return () => {
      cleanup?.();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const selectedPost = slug ? posts.find((p) => p.slug === slug) ?? null : null;
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [selectedPost]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCat]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const okCat = activeCat === "All" || p.categoryId === activeCat;
      const q = search.toLowerCase();
      const okQ = !q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
        || p.author.toLowerCase().includes(q) || p.board.toLowerCase().includes(q)
        || p.tags.some(t => t.toLowerCase().includes(q));
      return okCat && okQ;
    });
  }, [posts, search, activeCat]);

  const totalPages = Math.ceil(filtered.length / postsPerPage);
  const paginated = filtered.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // Visible page range (max 5 buttons)
  const getPageRange = () => {
    const delta = 2;
    const range: (number | '...')[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const goTo = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Detail view
  if (selectedPost) {
    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": selectedPost.title,
      "description": selectedPost.excerpt,
      "image": selectedPost.image || selectedPost.featuredImage,
      "author": {
        "@type": "Person",
        "name": selectedPost.author || "EduJunction Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "EduJunction",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.edujunction.co.in/favicon.svg"
        }
      },
      "datePublished": selectedPost.date
    };

    return (
      <div className="min-h-screen flex flex-col">
        <SEO
          title={`${selectedPost.title} – EduJunction Blog`}
          description={selectedPost.excerpt}
          keywords={`${selectedPost.category || 'EdTech'}, EduJunction blog, board exam preparation`}
          ogImage={selectedPost.image || selectedPost.featuredImage}
          ogType="article"
          canonicalUrl={`https://www.edujunction.co.in/blog/${selectedPost.slug || selectedPost.id}`}
          jsonLd={articleJsonLd}
        />
        <PublicHeader />
        <div className="flex-1">
          <ArticleDetail post={selectedPost} allPosts={posts} onBack={() => navigate("/blog")} />
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEO
        title="EdTech & Board Exam Insights – EduJunction Blog"
        description="Latest insights, study tips, exam strategies, and educational updates for CBSE, ICSE, and ISC students."
        keywords="EduJunction blog, board exam tips, study strategies, Class 10 preparation"
        canonicalUrl="https://www.edujunction.co.in/blog"
      />
      {/* ── Header */}
      <PublicHeader />

      {/* ── Page body */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Title row + search (exactly like reference) */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            {/* Left: title + subtitle */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-700 mb-3">EduJunction Journal</p>
              <h1 className="text-4xl sm:text-5xl font-black text-stone-900 leading-[0.95]">Blogs &amp; Stories</h1>
              <p className="text-sm text-stone-500 mt-1 max-w-md">
                Deep dives into learning, exam strategy, and the small practices that help students grow with confidence.
              </p>
            </div>
            {/* Right: search bar */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="blog-search"
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 border-b border-stone-100">
            {[
              { id: "All" as const, name: "All" },
              ...categories,
            ].map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCat(category.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeCat === category.id
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-amber-100 hover:text-stone-800"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>



          {/* ── Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24 text-sm text-stone-500">Loading blogs...</div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* ── PrimeReact-style Paginator */}
              {totalPages >= 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100 pt-6">

                  {/* Left: result count */}
                  <p className="text-xs text-stone-400 order-2 sm:order-1">
                    Showing{" "}
                    <strong className="text-stone-600">{(currentPage - 1) * postsPerPage + 1}</strong>
                    {"–"}
                    <strong className="text-stone-600">{Math.min(currentPage * postsPerPage, filtered.length)}</strong>
                    {" of "}
                    <strong className="text-stone-600">{filtered.length}</strong>{" articles"}
                  </p>

                  {/* Centre: page buttons */}
                  <div className="flex items-center gap-1 order-1 sm:order-2">
                    {/* First page << */}
                    <button
                      onClick={() => goTo(1)}
                      disabled={currentPage === 1}
                      title="First page"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg font-medium"
                    >
                      «
                    </button>
                    {/* Prev < */}
                    <button
                      onClick={() => goTo(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      title="Previous page"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg font-medium"
                    >
                      ‹
                    </button>

                    {/* Page numbers */}
                    {getPageRange().map((p, idx) =>
                      p === '...' ? (
                        <span key={`dot-${idx}`} className="w-8 h-8 flex items-center justify-center text-stone-400 text-xs select-none">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => goTo(p as number)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-bold transition-all ${currentPage === p
                            ? 'bg-yellow-400 text-stone-900 border-yellow-400 shadow-sm shadow-yellow-200'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-yellow-300 hover:bg-yellow-50'
                            }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    {/* Next > */}
                    <button
                      onClick={() => goTo(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      title="Next page"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg font-medium"
                    >
                      ›
                    </button>
                    {/* Last >> */}
                    <button
                      onClick={() => goTo(totalPages)}
                      disabled={currentPage === totalPages}
                      title="Last page"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-lg font-medium"
                    >
                      »
                    </button>
                  </div>

                  {/* Right: rows per page dropdown */}
                  <div className="flex items-center gap-2 order-3">
                    <label className="text-xs text-stone-400 whitespace-nowrap">Per page</label>
                    <select
                      value={postsPerPage}
                      onChange={(e) => { setPostsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="text-xs font-semibold text-stone-700 border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 cursor-pointer hover:border-stone-300 transition-all"
                    >
                      {PER_PAGE_OPTIONS.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base font-bold text-stone-700 mb-1">No articles found</h3>
              <p className="text-sm text-stone-400 mb-5">Try a different search or category.</p>
              <button onClick={() => { setSearch(""); setActiveCat("All"); }}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold shadow-sm transition-all">
                Clear filters
              </button>
            </div>
          )}

        </div>
      </main>

      {/* ── Footer */}
      <PublicFooter />
    </div>
  );
};
