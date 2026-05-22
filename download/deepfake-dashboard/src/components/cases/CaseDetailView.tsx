'use client';

import { ArrowLeft, Download, Share2, Clock, User, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { RiskBadge } from '@/components/shared/RiskBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';

export function CaseDetailView() {
  const { selectedCase, setCurrentView } = useAppStore();

  if (!selectedCase) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500">No case selected</p>
          <Button 
            variant="link" 
            onClick={() => setCurrentView('dashboard')}
            className="text-red-600"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setCurrentView('analysis')}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedCase.caseId}</h1>
            <p className="text-gray-500">{selectedCase.imageName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={selectedCase.status} />
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image & AI Analysis */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Image Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
                <FileImage className="w-12 h-12 text-gray-400" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">File Name</span>
                  <span className="font-medium text-gray-700">{selectedCase.imageName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">File Size</span>
                  <span className="font-medium text-gray-700">{selectedCase.hashInfo.fileSize}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Real vs Fake */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{selectedCase.realPercentage}%</p>
                  <p className="text-sm text-green-700">Real</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{selectedCase.fakePercentage}%</p>
                  <p className="text-sm text-red-700">Fake</p>
                </div>
              </div>

              {/* Confidence */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">AI Confidence</span>
                  <span className={`font-bold ${
                    selectedCase.aiConfidence >= 70 ? 'text-red-600' :
                    selectedCase.aiConfidence >= 40 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {selectedCase.aiConfidence}%
                  </span>
                </div>
                <Progress 
                  value={selectedCase.aiConfidence} 
                  className={`h-2 ${
                    selectedCase.aiConfidence >= 70 ? '[&>div]:bg-red-500' :
                    selectedCase.aiConfidence >= 40 ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'
                  }`}
                />
              </div>

              {/* Risk Score */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Risk Score</span>
                <span className="text-2xl font-bold text-gray-700">{selectedCase.riskScore}/10</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Risk Assessment */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <RiskBadge level={selectedCase.riskLevel} size="lg" />
                  <div>
                    <p className="text-sm text-gray-500">Assessment based on AI confidence and metadata analysis</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated: {selectedCase.updatedAt.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-gray-800">{selectedCase.riskScore}</p>
                  <p className="text-sm text-gray-500">out of 10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for details */}
          <Card className="bg-white shadow-sm">
            <CardContent className="pt-6">
              <Tabs defaultValue="metadata">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="hash">Hash Details</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="metadata" className="mt-4">
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-3 text-sm font-medium bg-gray-50 p-3 border-b">
                      <div>Field</div>
                      <div>Value</div>
                      <div>Status</div>
                    </div>
                    {selectedCase.metadata.map((item, index) => (
                      <div 
                        key={index} 
                        className={`grid grid-cols-3 text-sm p-3 border-b last:border-b-0 ${
                          item.status === 'suspicious' ? 'bg-red-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-700">{item.field}</div>
                        <div className="text-gray-600">{item.value}</div>
                        <div>
                          <Badge 
                            variant={item.status === 'suspicious' ? 'destructive' : 'secondary'}
                            className="text-xs capitalize"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="hash" className="mt-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">SHA-256 Hash</p>
                      <p className="font-mono text-sm break-all text-gray-700">
                        {selectedCase.hashInfo.sha256}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">File Size</p>
                        <p className="font-medium text-gray-700">{selectedCase.hashInfo.fileSize}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">File Type</p>
                        <p className="font-medium text-gray-700">{selectedCase.hashInfo.fileType}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Duplicate</p>
                        <Badge variant={selectedCase.hashInfo.isDuplicate ? 'destructive' : 'secondary'}>
                          {selectedCase.hashInfo.isDuplicate ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">First Seen</p>
                        <p className="font-medium text-gray-700">
                          {selectedCase.hashInfo.firstSeenDate?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-4">
                    {[
                      { time: selectedCase.createdAt, action: 'Case Created', user: selectedCase.analystName, icon: Clock },
                      { time: new Date(selectedCase.createdAt.getTime() + 300000), action: 'AI Analysis Completed', user: 'System', icon: FileImage },
                      { time: selectedCase.updatedAt, action: 'Status Updated', user: selectedCase.analystName, icon: User },
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-white rounded-full">
                          <item.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">{item.action}</p>
                          <p className="text-sm text-gray-500">by {item.user}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {item.time.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {selectedCase.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                            <span className="text-sm text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        Update Status
                      </Button>
                      <Button className="flex-1 bg-red-600 hover:bg-red-700">
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
