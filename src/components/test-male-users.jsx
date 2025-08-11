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
          <CardTitle>AI Gender Detection Test</CardTitle>
          <CardDescription>
            Testing 42 API + AI gender prediction using OpenAI to analyze user profiles
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
                Running AI Analysis...
              </>
            ) : (
              'Start AI Gender Detection'
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
                <CardTitle className="text-green-700">AI Analysis Complete!</CardTitle>
                <CardDescription>
                  Analyzed {result.count} users • Found {result.ai_predicted_male_users} predicted males • Filter: {result.filter_used}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-2">AI Gender Detection Results:</p>
                  <p className="text-sm text-blue-700">{result.note}</p>
                </div>
                
                <div className="grid gap-2">
                  <p><strong>Total Users:</strong> {result.count}</p>
                  <p><strong>AI Predicted Males:</strong> {result.ai_predicted_male_users}</p>
                  <p><strong>Original Gender Info:</strong> {result.users_with_gender_info}</p>
                  <p><strong>Token Expires:</strong> {result.expires_in} seconds</p>
                </div>

                {result.predicted_male_users && result.predicted_male_users.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">AI Predicted Male Users:</h4>
                    {result.predicted_male_users.slice(0, 5).map((user, index) => (
                      <Card key={user.id} className="p-3 bg-green-50 border-green-200">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{user.login}</span>
                            <span className="text-sm bg-green-100 px-2 py-1 rounded">
                              {user.ai_prediction?.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-green-700">
                            <strong>AI Reasoning:</strong> {user.ai_prediction?.reasoning}
                          </p>
                          {user.ai_prediction?.primary_indicators && (
                            <p className="text-xs text-gray-500">
                              <strong>Key factors:</strong> {user.ai_prediction.primary_indicators.join(', ')}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold">Sample Analysis (All Users):</h4>
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
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.login}</p>
                            {user.ai_gender_prediction && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                user.ai_gender_prediction.predicted_gender === 'male' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : user.ai_gender_prediction.predicted_gender === 'female'
                                  ? 'bg-pink-100 text-pink-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                AI: {user.ai_gender_prediction.predicted_gender} ({user.ai_gender_prediction.confidence}%)
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Campus: {user.campus?.[0]?.name || 'N/A'} • Kind: {user.kind}
                          </p>
                          {user.ai_gender_prediction?.reasoning && (
                            <p className="text-xs text-gray-400 mt-1">
                              {user.ai_gender_prediction.reasoning}
                            </p>
                          )}
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
