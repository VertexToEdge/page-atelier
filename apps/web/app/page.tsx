'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { FileText, Send, Loader2, BookOpen } from 'lucide-react';
import type { Analysis } from '@page-atelier/core';
import ConsistencyCheckTab from '@/components/ConsistencyCheckTab';
import PersonasTab from '@/components/PersonasTab';
import JsonTab from '@/components/JsonTab';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Analysis | null>(null);
  const [activeTab, setActiveTab] = useState('consistency');

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error('텍스트를 입력해주세요');
      return;
    }

    if (inputText.length < 100) {
      toast.error('최소 100자 이상의 텍스트를 입력해주세요');
      return;
    }

    setIsAnalyzing(true);
    toast.info('분석을 시작합니다... (약 30초-1분 소요)');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          options: {
            temperature: 0.3
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '분석 중 오류가 발생했습니다');
      }

      if (result.success && result.data) {
        setAnalysisResult(result.data);
        setActiveTab('consistency');
        toast.success('분석이 완료되었습니다!');
      } else {
        throw new Error('분석 결과를 받아올 수 없습니다');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleText = async () => {
    try {
      const response = await fetch('/example.txt');
      const text = await response.text();
      setInputText(text.substring(0, 5000)); // 처음 5000자만 로드
      toast.success('홍길동전 샘플 텍스트를 불러왔습니다');
    } catch (error) {
      toast.error('샘플 텍스트를 불러올 수 없습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  페이지 아틀리에
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI 기반 웹소설 검수 도구
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              MVP v1.0
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Panel - Input */}
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <CardTitle>텍스트 입력</CardTitle>
              <CardDescription>
                분석할 웹소설 텍스트를 입력하세요 (최소 100자)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-120px)]">
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={loadSampleText}
                  variant="outline"
                  size="sm"
                  disabled={isAnalyzing}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  홍길동전 샘플 로드
                </Button>
                <Badge variant="outline">{inputText.length} / 50000자</Badge>
              </div>
              
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="웹소설 텍스트를 입력하세요..."
                className="flex-1 resize-none font-mono text-sm"
                maxLength={50000}
                disabled={isAnalyzing}
              />
              
              <Button
                onClick={handleAnalyze}
                className="mt-4 w-full"
                size="lg"
                disabled={isAnalyzing || !inputText.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    분석 시작
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - Results */}
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <CardTitle>분석 결과</CardTitle>
              <CardDescription>
                {analysisResult 
                  ? `분석 완료 (${(analysisResult.processing_time_ms / 1000).toFixed(1)}초 소요)`
                  : '분석 결과가 여기에 표시됩니다'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-120px)] overflow-hidden">
              {analysisResult ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="consistency">검수 결과</TabsTrigger>
                    <TabsTrigger value="personas">페르소나</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  
                  <div className="h-[calc(100%-48px)] overflow-y-auto mt-4">
                    <TabsContent value="consistency" className="mt-0">
                      <ConsistencyCheckTab 
                        consistencyCheck={analysisResult.consistency_check}
                        aggregateReport={analysisResult.aggregate_report}
                      />
                    </TabsContent>
                    
                    <TabsContent value="personas" className="mt-0">
                      <PersonasTab 
                        personas={analysisResult.persona_evaluations}
                      />
                    </TabsContent>
                    
                    <TabsContent value="json" className="mt-0">
                      <JsonTab 
                        data={analysisResult}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>분석을 시작하려면 텍스트를 입력하고</p>
                    <p>"분석 시작" 버튼을 클릭하세요</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}