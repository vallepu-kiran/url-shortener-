import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="h-12 w-96 mx-auto bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-80 mx-auto bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full max-w-6xl mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}