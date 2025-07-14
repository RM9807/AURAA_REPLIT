import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shirt, Plus, Heart, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RecentActivityItem {
  id: string;
  type: 'wardrobe_add' | 'outfit_save' | 'style_quiz';
  description: string;
  timeAgo: string;
  icon: string;
}

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const userId = user?.id || 1;

  const { data: wardrobe } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
    enabled: isAuthenticated,
  });

  const { data: outfits } = useQuery({
    queryKey: ['/api/users', userId, 'outfits'],
    enabled: isAuthenticated,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/users', userId, 'analytics'],
    enabled: isAuthenticated,
  });

  // Mock recent activity data based on actual user data
  const recentActivity: RecentActivityItem[] = [
    {
      id: '1',
      type: 'wardrobe_add',
      description: 'Added new blazer to wardrobe',
      timeAgo: '2 hours ago',
      icon: 'plus'
    },
    {
      id: '2', 
      type: 'outfit_save',
      description: 'Saved "Business Casual" outfit',
      timeAgo: '1 day ago',
      icon: 'heart'
    },
    {
      id: '3',
      type: 'style_quiz',
      description: 'Completed style quiz',
      timeAgo: '3 days ago',
      icon: 'target'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'wardrobe_add':
        return <Plus className="h-4 w-4" />;
      case 'outfit_save':
        return <Heart className="h-4 w-4" />;
      case 'style_quiz':
        return <Target className="h-4 w-4" />;
      default:
        return <Shirt className="h-4 w-4" />;
    }
  };

  const getActivityIconBg = (type: string) => {
    switch (type) {
      case 'wardrobe_add':
        return 'bg-green-500/20 text-green-400';
      case 'outfit_save':
        return 'bg-pink-500/20 text-pink-400';
      case 'style_quiz':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  // Only show dashboard for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Style Dashboard
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Track your fashion journey and see how your style evolves with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Feature Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Outfit Generator Card */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Outfit Generator</h3>
                <p className="text-slate-300 text-sm mb-4">
                  {outfits?.length || 0} outfits created
                </p>
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 w-full">
                  Create Outfit →
                </Button>
              </CardContent>
            </Card>

            {/* Style Score Card */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Badge className="bg-orange-400 text-slate-900 text-xs px-2 py-1">
                      {analytics?.styleScore || 0}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Style Score</h3>
                <p className="text-slate-300 text-sm mb-4">
                  {analytics?.styleScore >= 80 ? 'Excellent' : analytics?.styleScore >= 60 ? 'Good' : 'Growing'} style
                </p>
                <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 w-full">
                  View Analytics →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Panel */}
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/50">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityIconBg(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      {activity.description}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {activity.timeAgo}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button className="bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 hover:from-cyan-500 hover:to-blue-500">
            Change Style Profile
          </Button>
          <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
            View Profile
          </Button>
        </div>
      </div>
    </section>
  );
}