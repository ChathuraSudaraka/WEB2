import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiTag, FiArrowLeft, FiShare2, FiHeart, FiMessageCircle, FiEye } from 'react-icons/fi';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [liked, setLiked] = useState(false);

  // Sample detailed blog post data
  const blogPostsData = {
    1: {
      id: 1,
      title: "The Future of Streetwear: DYNEX's Vision for 2025",
      excerpt: "Exploring how DYNEX is revolutionizing streetwear culture with innovative designs and sustainable practices that define the future of fashion.",
      content: `
        <p>The streetwear landscape is evolving at an unprecedented pace, and at DYNEX, we're not just keeping up—we're leading the charge into the future. As we look toward 2025, our vision extends far beyond creating clothes; we're crafting a movement that redefines what streetwear can be.</p>

        <h2>Innovation at the Core</h2>
        <p>Our design philosophy centers on pushing boundaries while staying true to streetwear's authentic roots. We're integrating cutting-edge materials with time-tested silhouettes, creating pieces that are both futuristic and familiar. From moisture-wicking fabrics in our everyday tees to reflective elements in our outerwear, every detail serves both form and function.</p>

        <p>The DYNEX lab has been working on revolutionary textile technologies that respond to environmental changes. Imagine hoodies that adapt their insulation based on temperature, or jeans that resist stains while maintaining their authentic denim feel. This isn't science fiction—it's the near future of streetwear.</p>

        <h2>Sustainability Without Compromise</h2>
        <p>The future of fashion is undeniably sustainable, but we refuse to compromise on style or quality. Our 2025 sustainability roadmap includes:</p>

        <ul>
          <li>100% recycled polyester in all synthetic garments</li>
          <li>Organic cotton sourcing from verified farms</li>
          <li>Carbon-neutral shipping on all orders</li>
          <li>Take-back programs for worn DYNEX pieces</li>
        </ul>

        <p>We're proving that eco-conscious fashion doesn't mean sacrificing the edge that streetwear demands. Our sustainable pieces maintain the same bold aesthetics and superior quality that DYNEX is known for.</p>

        <h2>Community-Driven Design</h2>
        <p>The future of DYNEX is collaborative. We're launching design challenges where our community can submit ideas, vote on concepts, and see their visions come to life. This isn't just about making clothes—it's about creating a platform where street culture can express itself authentically.</p>

        <p>Our upcoming DYNEX Connect platform will allow customers to share styling ideas, participate in virtual fashion shows, and even collaborate directly with our design team. The lines between creator and consumer are blurring, and we're here for it.</p>

        <h2>Looking Ahead</h2>
        <p>As we move toward 2025, DYNEX remains committed to our core mission: elevating streetwear culture through authentic design and uncompromising quality. The future is bright, sustainable, and undeniably stylish.</p>

        <p>Join us on this journey. The future of streetwear starts here.</p>
      `,
      category: "brand",
      author: "DYNEX Team",
      date: "2024-12-15",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      tags: ["streetwear", "innovation", "sustainability"],
      views: 2845,
      likes: 234,
      comments: 18
    },
    2: {
      id: 2,
      title: "How to Style Oversized Hoodies: 5 Game-Changing Looks",
      excerpt: "Master the art of styling oversized hoodies with these expert tips that will elevate your streetwear game to the next level.",
      content: `
        <p>The oversized hoodie has become the cornerstone of modern streetwear, but styling it right requires more than just throwing it on. Here are five game-changing approaches to make your oversized hoodie the star of your outfit.</p>

        <h2>1. The Layered Legend</h2>
        <p>Layer your oversized hoodie over a fitted longline tee, letting the bottom hem peek out. Pair with tapered joggers and chunky sneakers. This creates visual interest while maintaining the relaxed vibe that makes hoodies so appealing.</p>

        <h2>2. The Contrast Play</h2>
        <p>Pair your oversized hoodie with fitted bottoms—think skinny jeans or leggings. This contrast between loose and tight creates a balanced silhouette that's both comfortable and stylish. Finish with sleek sneakers or boots.</p>

        <h2>3. The Elevated Casual</h2>
        <p>Elevate your hoodie game by layering it under a structured jacket or blazer. Leave the hoodie unzipped and let the hood peek out from the collar. This unexpected combination bridges streetwear and smart-casual perfectly.</p>

        <h2>4. The Proportional Balance</h2>
        <p>When wearing an oversized hoodie, pay attention to proportions. If you're going big on top, consider cropped or high-waisted bottoms to define your waistline. Add a belt bag or crossbody bag to accentuate the middle.</p>

        <h2>5. The Accessory Amplifier</h2>
        <p>Use accessories to transform your hoodie look. A baseball cap worn backward, layered necklaces, or statement sunglasses can completely change the vibe. Don't forget about footwear—the right shoes can make or break the entire outfit.</p>

        <h2>Pro Tips for Hoodie Styling</h2>
        <ul>
          <li>Size up 1-2 sizes for the perfect oversized fit</li>
          <li>Pay attention to sleeve length—they should hit just past your wrists</li>
          <li>Experiment with different textures and materials</li>
          <li>Don't be afraid to mix high and low-end pieces</li>
        </ul>

        <p>Remember, confidence is your best accessory. Own your style choices and make them work for your lifestyle.</p>
      `,
      category: "style",
      author: "Maya Chen",
      date: "2024-12-10",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&h=600&fit=crop",
      tags: ["hoodies", "styling", "streetwear"],
      views: 1923,
      likes: 156,
      comments: 23
    }
  };

  const allPosts = [
    { id: 3, title: "DYNEX x Urban Culture: Our Latest Collaboration", category: "brand", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop" },
    { id: 4, title: "Sustainable Fashion: Why It Matters in Streetwear", category: "sustainability", image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=250&fit=crop" },
    { id: 5, title: "Street Photography: Capturing DYNEX in the Wild", category: "culture", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=250&fit=crop" }
  ];

  useEffect(() => {
    const postData = blogPostsData[parseInt(id)];
    if (postData) {
      setPost(postData);
      // Get related posts (same category, different id)
      const related = allPosts.filter(p => p.id !== parseInt(id)).slice(0, 3);
      setRelatedPosts(related);
    }
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <Link to="/blog" className="text-gray-400 hover:text-white transition-colors duration-300">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Image */}
      <div className="relative h-96 md:h-[60vh] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
        
        {/* Back Button */}
        <div className="absolute top-8 left-8">
          <Link
            to="/blog"
            className="flex items-center space-x-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-black/70 transition-all duration-300"
          >
            <FiArrowLeft />
            <span>Back to Blog</span>
          </Link>
        </div>

        {/* Post Meta */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 text-sm text-white/80 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 capitalize">
                {post.category}
              </span>
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
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">{post.title}</h1>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="relative py-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Article Stats & Share */}
          <div className="flex items-center justify-between mb-8 p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <FiEye />
                <span>{post.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiHeart className={liked ? 'text-red-500' : ''} />
                <span>{post.likes + (liked ? 1 : 0)} likes</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiMessageCircle />
                <span>{post.comments} comments</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-lg border transition-all duration-300 ${
                  liked 
                    ? 'bg-red-500 border-red-500 text-white' 
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
              >
                <FiHeart className={liked ? 'fill-current' : ''} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                <FiShare2 />
              </button>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div 
              className="text-gray-300 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-6">
              <FiTag className="text-gray-400" />
              <span className="text-gray-400">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-all duration-300 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <div className="mt-12 p-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center">
                <FiUser className="text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{post.author}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {post.author === 'DYNEX Team' ? 
                    'The creative minds behind DYNEX, bringing you the latest insights from streetwear culture, design innovation, and brand stories.' :
                    'Fashion journalist and streetwear enthusiast, exploring the intersection of style, culture, and personal expression.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="relative py-16 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30 capitalize">
                        {relatedPost.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-bold line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                      {relatedPost.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
