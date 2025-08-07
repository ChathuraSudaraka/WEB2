import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiTag, FiArrowRight, FiSearch, FiTrendingUp, FiEye } from 'react-icons/fi';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Streetwear: DYNEX's Vision for 2025",
      excerpt: "Exploring how DYNEX is revolutionizing streetwear culture with innovative designs and sustainable practices that define the future of fashion.",
      content: "Full article content here...",
      category: "brand",
      author: "DYNEX Team",
      date: "2024-12-15",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
      tags: ["streetwear", "innovation", "sustainability"],
      featured: true,
      views: 2845
    },
    {
      id: 2,
      title: "How to Style Oversized Hoodies: 5 Game-Changing Looks",
      excerpt: "Master the art of styling oversized hoodies with these expert tips that will elevate your streetwear game to the next level.",
      content: "Full article content here...",
      category: "style",
      author: "Maya Chen",
      date: "2024-12-10",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=400&fit=crop",
      tags: ["hoodies", "styling", "streetwear"],
      featured: false,
      views: 1923
    },
    {
      id: 3,
      title: "DYNEX x Urban Culture: Our Latest Collaboration",
      excerpt: "Behind the scenes of our groundbreaking collaboration that merges high fashion with authentic street culture.",
      content: "Full article content here...",
      category: "brand",
      author: "Alex Rivera",
      date: "2024-12-08",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
      tags: ["collaboration", "culture", "design"],
      featured: true,
      views: 3201
    },
    {
      id: 4,
      title: "Sustainable Fashion: Why It Matters in Streetwear",
      excerpt: "Discover how DYNEX is leading the sustainable fashion movement while maintaining the edgy aesthetics streetwear fans love.",
      content: "Full article content here...",
      category: "sustainability",
      author: "Jordan Mills",
      date: "2024-12-05",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=400&fit=crop",
      tags: ["sustainability", "eco-friendly", "fashion"],
      featured: false,
      views: 1687
    },
    {
      id: 5,
      title: "Street Photography: Capturing DYNEX in the Wild",
      excerpt: "A visual journey through cities worldwide, showcasing how DYNEX pieces integrate into authentic street culture.",
      content: "Full article content here...",
      category: "culture",
      author: "Sam Torres",
      date: "2024-12-03",
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=400&fit=crop",
      tags: ["photography", "street-culture", "lifestyle"],
      featured: false,
      views: 2156
    },
    {
      id: 6,
      title: "Color Theory in Streetwear: The Psychology of DYNEX",
      excerpt: "Understanding how color choices in streetwear design influence mood, perception, and personal expression.",
      content: "Full article content here...",
      category: "design",
      author: "Casey Kim",
      date: "2024-11-28",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1506629905057-f39b3c6815f5?w=600&h=400&fit=crop",
      tags: ["design", "color-theory", "psychology"],
      featured: false,
      views: 1432
    }
  ];

  const categories = [
    { id: 'all', name: 'All Posts', count: blogPosts.length },
    { id: 'brand', name: 'Brand Stories', count: blogPosts.filter(post => post.category === 'brand').length },
    { id: 'style', name: 'Style Tips', count: blogPosts.filter(post => post.category === 'style').length },
    { id: 'culture', name: 'Culture', count: blogPosts.filter(post => post.category === 'culture').length },
    { id: 'design', name: 'Design', count: blogPosts.filter(post => post.category === 'design').length },
    { id: 'sustainability', name: 'Sustainability', count: blogPosts.filter(post => post.category === 'sustainability').length }
  ];

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = blogPosts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory]);

  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23000'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23333' strokeWidth='0.5' opacity='0.2'/%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16 space-y-6">
            <div className="inline-block">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                DYNEX BLOG
              </h1>
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent mt-4"></div>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Stories, insights, and inspiration from the world of streetwear culture. 
              Discover the latest trends, style tips, and behind-the-scenes content from DYNEX.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles, tags, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white placeholder-gray-400"
                  />
                </div>

                {/* Category Filter */}
                <div className="md:w-auto">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-white"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id} className="bg-gray-800">
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <div className="relative py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center space-x-3 mb-12">
              <FiTrendingUp className="text-2xl text-white" />
              <h2 className="text-3xl font-bold">Featured Stories</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <div key={post.id} className={`backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 ${index === 0 ? 'lg:col-span-1' : ''}`}>
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
                        FEATURED
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center space-x-1 text-white/80">
                      <FiEye size={14} />
                      <span className="text-xs">{post.views.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <FiCalendar size={14} />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiUser size={14} />
                        <span>{post.author}</span>
                      </div>
                      <span>{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <Link
                        to={`/blog/${post.id}`}
                        className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300 group"
                      >
                        <span className="text-sm font-medium">Read More</span>
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Posts Grid */}
      <div className="relative py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">
              {selectedCategory === 'all' ? 'All Posts' : categories.find(cat => cat.id === selectedCategory)?.name}
              <span className="text-gray-400 ml-2">({filteredPosts.length})</span>
            </h2>
            
            {searchTerm && (
              <div className="text-gray-400">
                Searching for: "<span className="text-white">{searchTerm}</span>"
              </div>
            )}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                <FiSearch className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Posts Found</h3>
                <p className="text-gray-400">Try adjusting your search terms or category filter.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <div key={post.id} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30 capitalize">
                        {post.category}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center space-x-1 text-white/80">
                      <FiEye size={12} />
                      <span className="text-xs">{post.views.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center space-x-3 text-xs text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <FiCalendar size={12} />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">by {post.author}</span>
                      
                      <Link
                        to={`/blog/${post.id}`}
                        className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors duration-300 group-hover:translate-x-1"
                      >
                        <span className="text-xs font-medium">Read</span>
                        <FiArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
