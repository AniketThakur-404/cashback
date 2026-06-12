import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Newspaper, ChevronRight, Clock } from "lucide-react";
import { getPublicBlogs } from "../lib/api";
import { getApiBaseUrl } from "../lib/apiClient";
import AuthImage from "../components/AuthImage";
import { useSEO } from "../hooks/useSEO";

const API_BASE_URL = getApiBaseUrl();

const resolveAssetUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return API_BASE_URL ? `${API_BASE_URL}${value}` : value;
  return value;
};

const normalizeBlogs = (blogs) =>
  Array.isArray(blogs)
    ? blogs.map((blog, index) => ({
        id: String(blog?.id || `blog-${index + 1}`),
        title: String(blog?.title || ""),
        slug: String(blog?.slug || ""),
        excerpt: String(blog?.excerpt || ""),
        author: String(blog?.author || ""),
        category: String(blog?.category || ""),
        coverImage: String(blog?.coverImage || blog?.image || ""),
        content: String(blog?.content || ""),
        status:
          String(blog?.status || "draft").toLowerCase() === "published"
            ? "published"
            : "draft",
        publishedAt: String(blog?.publishedAt || ""),
      }))
    : [];

const parseInlineMarkdown = (text) => {
  if (!text) return "";

  const alignMatch = text.match(/^<p style="text-align:(left|center|right)">(.*?)<\/p>$/i);
  if (alignMatch) {
    const [, alignment, innerText] = alignMatch;
    const alignClass = 
      alignment === "center" ? "text-center" : 
      alignment === "right" ? "text-right" : "text-left";
    return (
      <span className={`block w-full ${alignClass}`}>
        {parseInlineMarkdown(innerText)}
      </span>
    );
  }

  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|__.*?__|~~.*?~~|\*.*?\*|_.*?_)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
        >
          {parseInlineMarkdown(linkMatch[1])}
        </a>
      );
    }

    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return (
        <strong key={index} className="font-bold">
          {parseInlineMarkdown(part.slice(2, -2))}
        </strong>
      );
    }

    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return (
        <em key={index} className="italic">
          {parseInlineMarkdown(part.slice(1, -1))}
        </em>
      );
    }

    if (part.startsWith("~~") && part.endsWith("~~")) {
      return (
        <del key={index} className="line-through text-slate-450 dark:text-slate-500">
          {parseInlineMarkdown(part.slice(2, -2))}
        </del>
      );
    }

    return part;
  });
};

const renderBlogBlocks = (content) => {
  const lines = String(content || "").split("\n");
  return lines.map((line, index) => {
    const key = `${index}-${line}`;
    if (line.startsWith("# ")) {
      return (
        <h1 key={key} className="text-2xl sm:text-3xl font-extrabold leading-tight mb-5 text-slate-900 dark:text-white">
          {parseInlineMarkdown(line.slice(2))}
        </h1>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2 key={key} className="text-xl sm:text-2xl font-bold leading-snug mb-4 text-slate-850 dark:text-slate-200">
          {parseInlineMarkdown(line.slice(3))}
        </h2>
      );
    }
    if (line.startsWith("> ")) {
      return (
        <blockquote key={key} className="border-l-4 border-emerald-500 bg-slate-100/40 dark:bg-white/[0.02] pl-4 py-2 italic mb-4 text-slate-700 dark:text-slate-300 rounded-r-lg">
          {parseInlineMarkdown(line.slice(2))}
        </blockquote>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <p key={key} className="mb-2 pl-4 text-slate-700 dark:text-slate-300">
          • {parseInlineMarkdown(line.slice(2))}
        </p>
      );
    }
    if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+\.\s)/)[0];
      return (
        <p key={key} className="mb-2 pl-4 text-slate-700 dark:text-slate-300">
          {match}{parseInlineMarkdown(line.slice(match.length))}
        </p>
      );
    }
    if (line.trim() === "---") {
      return <hr key={key} className="my-6 border-slate-200 dark:border-zinc-800" />;
    }
    if (!line.trim()) {
      return <div key={key} className="h-4" />;
    }
    return (
      <p key={key} className="mb-4 leading-7 text-slate-700 dark:text-slate-300 text-[15px]">
        {parseInlineMarkdown(line)}
      </p>
    );
  });
};

const BlogViewer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getPublicBlogs();
        const published = normalizeBlogs(data?.blogs).filter(
          (b) => b.status === "published"
        );
        setBlogs(published);
      } catch (err) {
        setError(err.message || "Failed to load blogs.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const activeBlog = useMemo(() => {
    if (!slug) return null;
    return blogs.find((b) => b.slug === slug);
  }, [slug, blogs]);

  const readingTime = useMemo(() => {
    if (!activeBlog || !activeBlog.content) return "1 min read";
    const words = activeBlog.content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 225));
    return `${minutes} min read`;
  }, [activeBlog]);

  useEffect(() => {
    if (!slug) return;
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  const pageTitle = activeBlog
    ? `${activeBlog.title} | Assured Rewards Blog`
    : "Latest Insights & Cashback Guides | Assured Rewards Blog";
  const pageDesc = activeBlog
    ? activeBlog.excerpt || "Read this article on Assured Rewards."
    : "Read our latest articles, guides, and tips on digital loyalty programs, rewards maximization, and smart shopping.";
  useSEO(pageTitle, pageDesc);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#059669] border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 max-w-sm shadow-md">
          <p className="text-sm text-rose-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857] shadow-lg shadow-[#059669]/10 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Single Article Reader View
  if (slug) {
    if (!activeBlog) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Article Not Found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">The article you are looking for might have been removed or set to draft.</p>
            <button
              onClick={() => navigate("/blog")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857]"
            >
              <ArrowLeft size={14} /> Back to Blog
            </button>
          </div>
        </div>
      );
    }

    const displayDate = activeBlog.publishedAt || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const otherBlogs = blogs.filter((b) => b.slug !== slug).slice(0, 5);
    const bannerBgStyle = activeBlog.coverImage ? {
      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.85)), url(${resolveAssetUrl(activeBlog.coverImage)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    } : {};

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans relative overflow-hidden pb-16">
        {/* Scroll Progress Bar */}
        <div 
          className="fixed top-0 left-0 right-0 h-1 bg-[#059669] z-50 origin-left transition-transform duration-75"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />

        {/* Ambient Radial Glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/[0.02] rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Huge Header Cover Banner */}
        <div 
          className="relative w-full min-h-[350px] sm:min-h-[420px] flex items-end bg-slate-900 text-white" 
          style={bannerBgStyle}
        >
          {/* Cover dark mesh overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
          
          <div className="max-w-6xl w-full mx-auto px-6 py-8 sm:py-12 z-10 space-y-4">
            {/* Back Button */}
            <button
              onClick={() => navigate("/blog")}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Blog</span>
            </button>

            {/* Category */}
            {activeBlog.category && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-emerald-300 border border-white/10">
                {activeBlog.category}
              </span>
            )}

            {/* Huge Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight max-w-4xl leading-tight text-white drop-shadow-md">
              {activeBlog.title}
            </h1>

            {/* Metadata (Author, Date, Reading Time) */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-white/70 pt-2 border-t border-white/10">
              {activeBlog.author && activeBlog.author.toLowerCase() !== "admin" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-white/60" />
                    <span className="font-medium">By {activeBlog.author}</span>
                  </div>
                  <span className="text-white/30 hidden sm:inline">•</span>
                </>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-white/60" />
                <span>{displayDate}</span>
              </div>
              <span className="text-white/30 hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-white/60" />
                <span>{readingTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            
            {/* Left Column: Content */}
            <div className="space-y-8">
              {/* Title Repeated */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {activeBlog.title}
              </h2>

              {/* Excerpt with separator line */}
              {activeBlog.excerpt && (
                <div className="space-y-4">
                  <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeBlog.excerpt}
                  </p>
                  <hr className="border-slate-200 dark:border-zinc-800/80" />
                </div>
              )}

              {/* Markdown Content Blocks */}
              <article className="prose dark:prose-invert max-w-none prose-emerald prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300">
                {renderBlogBlocks(activeBlog.content)}
              </article>
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-6 lg:border-l lg:border-slate-200/60 lg:dark:border-zinc-800/50 lg:pl-8">
              {/* Sidebar Header */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Clock size={14} />
                <span>Latest Posts</span>
              </div>

              {/* Dynamic Other Posts Listing */}
              {otherBlogs.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No other posts available.
                </p>
              ) : (
                <div className="space-y-4">
                  {otherBlogs.map((item) => {
                    const itemDate = item.publishedAt || new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => navigate(`/blog/${item.slug}`)}
                        className="group block cursor-pointer space-y-1"
                      >
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#059669] dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                          {item.author && item.author.toLowerCase() !== "admin" && (
                            <>
                              <span>{item.author}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>{itemDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Articles Grid View (/blog)
  return (
    <div className="min-h-screen bg-white dark:bg-[#080B11] text-slate-900 dark:text-white transition-colors duration-350 font-sans pb-20 relative overflow-hidden blog-grid-bg">
      <style>{`
        .blog-grid-bg {
          background-image: 
            radial-gradient(circle at 50% -120px, rgba(5, 150, 105, 0.08) 0%, transparent 60%),
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          background-size: 100% 100%, 45px 45px, 45px 45px;
        }
        .dark .blog-grid-bg {
          background-image: 
            radial-gradient(circle at 50% -120px, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 100% 100%, 45px 45px, 45px 45px;
        }
      `}</style>

      {/* Navigation Bar */}
      <header className="border-b border-slate-200/40 dark:border-white/5 backdrop-blur-md sticky top-0 z-45 bg-white/70 dark:bg-[#080B11]/70">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-extrabold text-slate-900 dark:text-white text-base tracking-tight hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white shadow-md shadow-[#059669]/10 shrink-0">
              <Newspaper size={16} />
            </div>
            <span>Assured Rewards</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">Home</Link>
            <Link to="/about-us" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">About</Link>
            <Link to="/blog" className="text-[#059669] dark:text-emerald-400 transition-colors font-bold">Blog</Link>
            <Link to="/contact" className="hover:text-[#059669] dark:hover:text-emerald-400 transition-colors">Contact</Link>
          </nav>

          {/* Right Action Button */}
          <Link 
            to="/signup" 
            className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-bold rounded-lg shadow-md shadow-[#059669]/10 hover:shadow-lg transition-all cursor-pointer"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-16 sm:pt-12 sm:pb-24 space-y-16">
        {/* Centered Blog Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            From the Assured Rewards Blog
          </h1>
          <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Insights, updates, and ideas on digital loyalty programs, rewards maximization, and smart shopping with Assured Rewards.
          </p>
          <div className="flex items-center justify-center gap-3.5 text-xs font-bold pt-1.5">
            <Link to="/about-us" className="text-[#059669] dark:text-emerald-400 hover:underline">
              Learn More About Assured Rewards
            </Link>
            <span className="text-slate-300 dark:text-zinc-800">|</span>
            <Link to="/store" className="text-[#059669] dark:text-emerald-400 hover:underline">
              Redeem Catalog
            </Link>
          </div>
        </div>

        {/* Blog Post List */}
        {blogs.length === 0 ? (
          <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-white/5 p-12 text-center max-w-sm mx-auto shadow-sm">
            <Newspaper className="mx-auto mb-4 text-slate-400 dark:text-zinc-700" size={36} />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No blog posts published yet.</p>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-1.5">Check back later for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => {
              const displayDate = blog.publishedAt || new Date().toLocaleDateString("en-US", { year: "numeric", month: "numeric", day: "numeric" });
              return (
                <div
                  key={blog.id || index}
                  onClick={() => navigate(`/blog/${blog.slug}`)}
                  className="bg-white/80 dark:bg-[#111625]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 cursor-pointer flex flex-col h-full group"
                >
                  {/* Image wrapper */}
                  <div className="aspect-[16/10] bg-slate-100 dark:bg-black/30 overflow-hidden relative border-b border-slate-200/40 dark:border-white/5 flex items-center justify-center">
                    {blog.coverImage ? (
                      <AuthImage
                        src={resolveAssetUrl(blog.coverImage)}
                        alt={blog.title}
                        className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-slate-300 dark:text-zinc-800 flex flex-col items-center gap-2">
                        <Newspaper size={28} />
                        <span className="text-[10px]">No cover image</span>
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                        <span>
                          {blog.author && blog.author.toLowerCase() !== "admin" ? `By ${blog.author}` : ""}
                        </span>
                        <span>{displayDate}</span>
                      </div>
                      <h3 className="text-[17px] font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#059669] dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {blog.title || "Untitled Post"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 line-clamp-3 leading-relaxed font-light">
                        {blog.excerpt || "Read full article details here."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-4 text-xs font-bold text-[#059669] dark:text-emerald-400">
                      <span>Read article &rarr;</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogViewer;
