import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share, Plus, Image, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MoodBoard {
  id: number;
  title: string;
  description?: string;
  images: string[];
  tags: string[];
  isPublic: boolean;
  likes: number;
  createdAt: string;
}

export default function MoodBoardSharing() {
  const userId = 1;
  const queryClient = useQueryClient();

  const { data: userMoodBoards } = useQuery({
    queryKey: ['/api/users', userId, 'mood-boards'],
  });

  const { data: publicMoodBoards } = useQuery({
    queryKey: ['/api/mood-boards/public'],
  });

  const createMoodBoardMutation = useMutation({
    mutationFn: async () => {
      const sampleImages = [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop"
      ];

      const moodBoardData = {
        title: `Style Board ${Date.now()}`,
        description: "A curated collection of my favorite fashion inspirations",
        images: sampleImages,
        tags: ["minimalist", "chic", "autumn", "neutrals"],
        isPublic: Math.random() > 0.5,
      };
      
      return await apiRequest(`/api/users/${userId}/mood-boards`, {
        method: 'POST',
        body: JSON.stringify(moodBoardData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'mood-boards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mood-boards/public'] });
    },
  });

  const likeMoodBoardMutation = useMutation({
    mutationFn: async (moodBoardId: number) => {
      return await apiRequest(`/api/mood-boards/${moodBoardId}/like`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mood-boards/public'] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-gradient-purple-pink" />
          Style Mood Boards
        </CardTitle>
        <CardDescription>
          Create and share Pinterest-style fashion inspiration boards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => createMoodBoardMutation.mutate()}
          disabled={createMoodBoardMutation.isPending}
          className="w-full bg-gradient-purple-pink text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {createMoodBoardMutation.isPending ? 'Creating...' : 'Create New Mood Board'}
        </Button>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Boards
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {userMoodBoards?.slice(0, 2).map((board: MoodBoard) => (
                <div key={board.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm">{board.title}</h5>
                    {board.isPublic && (
                      <Badge className="bg-blue-100 text-blue-800">Public</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {board.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-square bg-slate-200 rounded overflow-hidden">
                        <img 
                          src={image} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {board.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">{board.likes} likes</span>
                    <Button size="sm" variant="outline">
                      <Share className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-3">Trending Boards</h4>
            <div className="grid grid-cols-1 gap-3">
              {publicMoodBoards?.slice(0, 2).map((board: MoodBoard) => (
                <div key={board.id} className="border rounded-lg p-3 bg-gradient-to-r from-slate-50 to-slate-100">
                  <h5 className="font-medium text-sm mb-2">{board.title}</h5>
                  
                  <div className="grid grid-cols-4 gap-1 mb-2">
                    {board.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="aspect-square bg-slate-200 rounded overflow-hidden">
                        <img 
                          src={image} 
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">{board.likes} likes</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => likeMoodBoardMutation.mutate(board.id)}
                      disabled={likeMoodBoardMutation.isPending}
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      Like
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(!userMoodBoards || userMoodBoards.length === 0) && (
          <div className="text-center py-6 text-slate-500">
            <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No mood boards yet. Create your first style inspiration board!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}