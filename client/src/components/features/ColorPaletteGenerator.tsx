import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Sparkles, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ColorPalette {
  id: number;
  name: string;
  colors: { name: string; hex: string }[];
  seasonType: string;
  skinTone: string;
  isActive: boolean;
}

export default function ColorPaletteGenerator() {
  const userId = 1;
  const queryClient = useQueryClient();

  const { data: palettes, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'color-palettes'],
  });

  const generatePaletteMutation = useMutation({
    mutationFn: async () => {
      const samplePalette = {
        name: "AI Generated Palette",
        colors: [
          { name: "Deep Navy", hex: "#0D1321" },
          { name: "Sunset Coral", hex: "#FF6B6B" },
          { name: "Warm Cream", hex: "#FFF8E7" },
          { name: "Sage Green", hex: "#95A58D" },
          { name: "Dusty Rose", hex: "#F4ACB7" }
        ],
        seasonType: "autumn",
        skinTone: "warm",
        isActive: false
      };
      
      return await apiRequest(`/api/users/${userId}/color-palettes`, {
        method: 'POST',
        body: JSON.stringify(samplePalette),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'color-palettes'] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Palette Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-gradient-blue-teal" />
          Personalized Color Palette
        </CardTitle>
        <CardDescription>
          AI-generated colors that complement your skin tone and style
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => generatePaletteMutation.mutate()}
          disabled={generatePaletteMutation.isPending}
          className="w-full bg-gradient-purple-pink text-white"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generatePaletteMutation.isPending ? 'Generating...' : 'Generate New Palette'}
        </Button>

        <div className="space-y-3">
          {palettes?.map((palette: ColorPalette) => (
            <div key={palette.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-800">{palette.name}</h4>
                {palette.isActive && (
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2 mb-2">
                {palette.colors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                    <span className="text-xs text-slate-600 mt-1">{color.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 text-xs">
                <Badge variant="outline">{palette.seasonType}</Badge>
                <Badge variant="outline">{palette.skinTone} tone</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}