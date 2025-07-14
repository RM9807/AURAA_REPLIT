import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, Tag, Package, Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WardrobeItem {
  id: number;
  itemName: string;
  category: string;
  color: string;
  brand?: string;
  imageUrl?: string;
}

interface ARTag {
  id: number;
  wardrobeItemId: number;
  arTagId: string;
  position: { x: number; y: number; z: number };
  metadata: {
    size: string;
    fitNotes: string;
    careInstructions: string[];
  };
}

export default function ARWardrobeOrganizer() {
  const userId = 1;
  const queryClient = useQueryClient();
  const [scanningMode, setScanningMode] = useState(false);

  const { data: wardrobe } = useQuery({
    queryKey: ['/api/users', userId, 'wardrobe'],
  });

  const createARTagMutation = useMutation({
    mutationFn: async (wardrobeItemId: number) => {
      const arData = {
        arTagId: `AR_${Date.now()}`,
        position: { 
          x: Math.random() * 100, 
          y: Math.random() * 100, 
          z: Math.random() * 10 
        },
        metadata: {
          size: "M",
          fitNotes: "True to size",
          careInstructions: ["Machine wash cold", "Tumble dry low", "Do not bleach"]
        }
      };
      
      return await apiRequest(`/api/wardrobe/${wardrobeItemId}/ar`, {
        method: 'POST',
        body: JSON.stringify(arData),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'wardrobe'] });
      setScanningMode(false);
    },
  });

  const handleStartScanning = () => {
    setScanningMode(true);
    // Simulate AR scanning process
    setTimeout(() => {
      if (wardrobe && wardrobe.length > 0) {
        createARTagMutation.mutate(wardrobe[0].id);
      }
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-gradient-blue-teal" />
          AR Wardrobe Organization
        </CardTitle>
        <CardDescription>
          Scan and tag your clothes for smart organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg">
          {scanningMode ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <Camera className="h-12 w-12 mx-auto text-gradient-purple-pink mb-2" />
                <p className="text-sm text-slate-600">Scanning your wardrobe...</p>
                <div className="w-24 h-2 bg-slate-200 rounded-full mx-auto mt-2">
                  <div className="h-2 bg-gradient-purple-pink rounded-full animate-pulse w-16"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Package className="h-12 w-12 mx-auto text-slate-400" />
              <div>
                <h3 className="font-medium text-slate-800">Start AR Scanning</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Point your camera at clothing items to automatically tag and organize
                </p>
                <Button 
                  onClick={handleStartScanning}
                  disabled={createARTagMutation.isPending}
                  className="bg-gradient-blue-teal text-white"
                >
                  <Scan className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-800 flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tagged Items
          </h4>
          
          {wardrobe?.slice(0, 3).map((item: WardrobeItem) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package className="h-5 w-5 text-slate-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.itemName}</p>
                  <p className="text-xs text-slate-600">{item.category} • {item.color}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <Tag className="h-3 w-3 mr-1" />
                Tagged
              </Badge>
            </div>
          ))}

          {(!wardrobe || wardrobe.length === 0) && (
            <div className="text-center py-4 text-slate-500">
              <Package className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items scanned yet. Start by scanning your wardrobe!</p>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-slate-800 mb-2">AR Features</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Automatic item recognition</li>
            <li>• Smart categorization</li>
            <li>• 3D wardrobe mapping</li>
            <li>• Care instruction tagging</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}