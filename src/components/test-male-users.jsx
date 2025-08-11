import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function TestMaleUsers() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testMaleUsers = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('https://www.13namima.me/api/test-male-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Test Male Users API</CardTitle>
          <CardDescription>
            Test the 42 API endpoint: /v2/users?filter[gender]=male
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testMaleUsers} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing API...
              </>
            ) : (
              'Test Male Users API'
            )}
          </Button>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Success!</CardTitle>
                <CardDescription>
                  Found {result.count} male users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <p><strong>Token Type:</strong> {result.token_type}</p>
                  <p><strong>Expires In:</strong> {result.expires_in} seconds</p>
                  <p><strong>Available Fields:</strong> {result.available_fields?.join(', ')}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Sample Users:</h4>
                  {result.users?.slice(0, 3).map((user, index) => (
                    <Card key={user.id} className="p-3 bg-white">
                      <div className="flex items-center gap-3">
                        {user.image?.link && (
                          <img 
                            src={user.image.link} 
                            alt={user.login}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium">{user.login}</p>
                          <p className="text-sm text-gray-600">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Campus: {user.campus?.[0]?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer font-medium text-sm">
                    View Raw Response (Click to expand)
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
