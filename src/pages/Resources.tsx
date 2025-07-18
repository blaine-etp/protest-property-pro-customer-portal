import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, User, ArrowRight, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  post_type: string;
  status: string;
  featured: boolean;
  thumbnail_image_url: string | null;
  published_at: string | null;
  created_at: string;
  read_time_minutes: number;
  author_id: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const categories = ["All", "Tax Appeals", "Success Stories", "Market News", "County News"];

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(post => post.featured);
  const regularArticles = filteredArticles.filter(post => !post.featured);

  const getAuthorName = (post: BlogPost) => {
    if (post.profiles) {
      return `${post.profiles.first_name} ${post.profiles.last_name}`;
    }
    return "Admin";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Loading Resources...</h1>
              <p className="text-muted-foreground">Please wait while we fetch the latest articles.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "Tax Appeals": "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "Success Stories": "bg-green-100 text-green-800 hover:bg-green-200",
      "Market News": "bg-purple-100 text-purple-800 hover:bg-purple-200",
      "County News": "bg-orange-100 text-orange-800 hover:bg-orange-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Property Tax
                <span className="text-primary"> Resources</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Stay informed with expert insights, success stories, and the latest news 
                on property taxes, market trends, and tax appeal strategies.
              </p>
              
              {/* Search and Filter */}
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="transition-all duration-200"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Featured Articles</h2>
              <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {featuredArticles.map((post) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.thumbnail_image_url || "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=400&fit=crop"} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-base line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {getAuthorName(post)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(post.published_at || post.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {post.read_time_minutes} min read
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" className="group/btn p-0 h-auto text-primary hover:text-primary/80">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Articles */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Latest Articles</h2>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No articles found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {regularArticles.map((post) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={post.thumbnail_image_url || "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=400&fit=crop"} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={getCategoryColor(post.category)} variant="secondary">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-3 flex-grow">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-sm">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 mt-auto">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {getAuthorName(post)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.read_time_minutes} min
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {formatDate(post.published_at || post.created_at)}
                      </div>
                      <Button variant="ghost" size="sm" className="group/btn p-0 h-auto text-primary hover:text-primary/80">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Stay Updated
              </h3>
              <p className="text-muted-foreground mb-6">
                Get the latest property tax news, tips, and success stories delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input 
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button className="sm:px-8">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}