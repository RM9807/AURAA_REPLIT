import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, Shirt, Sparkles, Target, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const userId = 1; // In a real app, this would come from auth context

  const { data: user } = useQuery({
    queryKey: ['/api/users', userId],
  });

  const { data: profile } = useQuery({
    queryKey: ['/api/users', userId, 'profile'],
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/users', userId, 'analytics'],
  });

  const { data: wardrobe } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
  });

  const { data: outfits } = useQuery({
    queryKey: ['/api/users', userId, 'outfits'],
  });

  const { data: recommendations } = useQuery({
    queryKey: ['/api/users', userId, 'recommendations'],
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your style dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/images/auraa-logo.png" alt="AURAA" className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-bold text-navy">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-600">Your personal style dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50">
                Style Score: {analytics?.styleScore || 0}/100
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outfits</CardTitle>
              <Shirt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalOutfits || 0}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wardrobe Items</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalWardrobeItems || 0}</div>
              <p className="text-xs text-muted-foreground">
                Well-organized closet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Style Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.styleScore || 0}</div>
              <Progress value={analytics?.styleScore || 0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.avgOutfitRating || 0}/5</div>
              <p className="text-xs text-muted-foreground">
                Outfit satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="wardrobe" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
            <TabsTrigger value="outfits">Outfits</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="wardrobe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Wardrobe</CardTitle>
                <CardDescription>
                  Manage your clothing items and track usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wardrobe?.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{item.itemName}</h3>
                        {item.favorite && <Heart className="h-4 w-4 text-red-500 fill-current" />}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">{item.color}</Badge>
                        {item.brand && <Badge variant="outline">{item.brand}</Badge>}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Worn {item.wearCount || 0} times</p>
                        {item.lastWorn && (
                          <p>Last worn: {new Date(item.lastWorn).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outfits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Outfits</CardTitle>
                <CardDescription>
                  Saved outfit combinations for different occasions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outfits?.map((outfit) => (
                    <div key={outfit.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{outfit.name}</h3>
                        <div className="flex gap-2">
                          {outfit.occasion && (
                            <Badge variant="secondary">{outfit.occasion}</Badge>
                          )}
                          {outfit.season && (
                            <Badge variant="outline">{outfit.season}</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{outfit.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Items:</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(outfit.items) && outfit.items.map((item: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {item.color} {item.type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(outfit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Style Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized suggestions to enhance your style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations?.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{rec.recommendationType}</Badge>
                          <span className="text-sm text-gray-600">
                            {rec.confidence}% confidence
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Decline
                          </Button>
                          <Button size="sm" className="bg-gradient-purple-pink">
                            Accept
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm">{rec.reason}</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Recommendation:</p>
                        {rec.recommendationType === 'outfit' && (
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(rec.content?.items) && rec.content.items.map((item: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item.color} {item.type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Style Analytics</CardTitle>
                  <CardDescription>
                    Insights into your fashion preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Style Score</label>
                    <div className="mt-1">
                      <Progress value={analytics?.styleScore || 0} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">
                        {analytics?.styleScore || 0}/100
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Most Worn Category</label>
                    <p className="text-sm text-gray-600 mt-1 capitalize">
                      {analytics?.mostWornCategory || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Favorite Colors</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analytics?.favoriteColors?.map((color) => (
                        <Badge key={color} variant="outline" className="text-xs capitalize">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>
                    Track your wardrobe activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics?.totalOutfits || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Outfits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics?.totalWardrobeItems || 0}
                      </p>
                      <p className="text-sm text-gray-600">Wardrobe Items</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Last active: {analytics?.lastActive ? new Date(analytics.lastActive).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}