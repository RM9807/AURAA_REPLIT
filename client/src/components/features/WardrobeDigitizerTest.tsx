import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WardrobeDigitizerTest() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wardrobe Digitizer Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a test component to ensure the wardrobe tab is working.</p>
        </CardContent>
      </Card>
    </div>
  );
}