'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Check, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import type { Analysis } from '@page-atelier/core';

interface JsonTabProps {
  data: Analysis;
}

export default function JsonTab({ data }: JsonTabProps) {
  const [copied, setCopied] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('full');

  const sections = {
    full: { label: '전체 데이터', data: data },
    setting_note: { label: '설정노트', data: data.setting_note },
    consistency: { label: '일관성 검사', data: data.consistency_check },
    personas: { label: '페르소나 평가', data: data.persona_evaluations },
    report: { label: '종합 리포트', data: data.aggregate_report },
  };

  const handleCopy = async () => {
    try {
      const jsonString = JSON.stringify(
        sections[selectedSection as keyof typeof sections].data, 
        null, 
        2
      );
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast.success('JSON이 클립보드에 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleDownload = () => {
    try {
      const jsonString = JSON.stringify(
        sections[selectedSection as keyof typeof sections].data, 
        null, 
        2
      );
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `page-atelier-analysis-${selectedSection}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('JSON 파일이 다운로드되었습니다');
    } catch (error) {
      toast.error('다운로드에 실패했습니다');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getJsonSize = () => {
    const jsonString = JSON.stringify(sections[selectedSection as keyof typeof sections].data);
    return formatBytes(new Blob([jsonString]).size);
  };

  return (
    <div className="space-y-4">
      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">데이터 섹션 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sections).map(([key, section]) => (
              <Button
                key={key}
                variant={selectedSection === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSection(key)}
              >
                {section.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* JSON Viewer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5" />
              <CardTitle className="text-lg">
                {sections[selectedSection as keyof typeof sections].label}
              </CardTitle>
              <Badge variant="secondary">{getJsonSize()}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    복사
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[500px]">
            <pre className="text-xs font-mono">
              <code>
                {JSON.stringify(
                  sections[selectedSection as keyof typeof sections].data, 
                  null, 
                  2
                )}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">분석 메타데이터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">분석 ID:</span>
              <p className="font-mono">{data.id}</p>
            </div>
            <div>
              <span className="text-gray-500">분석 시간:</span>
              <p>{new Date(data.timestamp).toLocaleString('ko-KR')}</p>
            </div>
            <div>
              <span className="text-gray-500">처리 시간:</span>
              <p>{(data.processing_time_ms / 1000).toFixed(2)}초</p>
            </div>
            <div>
              <span className="text-gray-500">LLM 호출 횟수:</span>
              <p>{data.llm_calls_count}회</p>
            </div>
            <div>
              <span className="text-gray-500">상태:</span>
              <Badge variant={data.status === 'success' ? 'default' : 'destructive'}>
                {data.status}
              </Badge>
            </div>
            <div>
              <span className="text-gray-500">최종 판정:</span>
              <Badge variant={
                data.aggregate_report.verdict === 'PASS' ? 'default' : 
                data.aggregate_report.verdict === 'REVISE' ? 'secondary' : 
                'destructive'
              }>
                {data.aggregate_report.verdict}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}