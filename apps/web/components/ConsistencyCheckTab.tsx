'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import type { ConsistencyCheck, AggregateReport } from '@page-atelier/core';

interface ConsistencyCheckTabProps {
  consistencyCheck: ConsistencyCheck;
  aggregateReport: AggregateReport;
}

export default function ConsistencyCheckTab({ 
  consistencyCheck, 
  aggregateReport 
}: ConsistencyCheckTabProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'PASS':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'REVISE':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'BLOCK':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'PASS':
        return 'border-green-600 bg-green-50';
      case 'REVISE':
        return 'border-yellow-600 bg-yellow-50';
      case 'BLOCK':
        return 'border-red-600 bg-red-50';
      default:
        return '';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    };
    return <Badge variant={variants[severity] || 'outline'}>{severity}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Verdict Card */}
      <Card className={`border-2 ${getVerdictColor(aggregateReport.verdict)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getVerdictIcon(aggregateReport.verdict)}
              <CardTitle className="text-xl">
                최종 판정: {aggregateReport.verdict}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              신뢰도 {aggregateReport.confidence_score}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{aggregateReport.executive_summary}</p>
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>추천 사항</AlertTitle>
            <AlertDescription className="whitespace-pre-line">
              {aggregateReport.recommendation}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Score Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">개연성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${getScoreColor(consistencyCheck.continuity.score)}`}>
                {consistencyCheck.continuity.score}
              </span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <Progress value={consistencyCheck.continuity.score} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {consistencyCheck.continuity.issues.length}개 이슈 발견
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">캐릭터 일관성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${getScoreColor(consistencyCheck.character.score)}`}>
                {consistencyCheck.character.score}
              </span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <Progress value={consistencyCheck.character.score} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {consistencyCheck.character.issues.length}개 이슈 발견
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">세계관 규칙</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${getScoreColor(consistencyCheck.world_rules.score)}`}>
                {consistencyCheck.world_rules.score}
              </span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <Progress value={consistencyCheck.world_rules.score} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {consistencyCheck.world_rules.issues.length}개 이슈 발견
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      {aggregateReport.action_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">우선 조치 사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aggregateReport.action_items.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <Badge variant={
                      item.priority === 'critical' ? 'destructive' : 
                      item.priority === 'high' ? 'default' : 
                      'secondary'
                    }>
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      영역: {item.affected_area} | 예상 작업량: {item.estimated_effort || 'moderate'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">발견된 이슈 상세</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...consistencyCheck.continuity.issues, 
              ...consistencyCheck.character.issues, 
              ...consistencyCheck.world_rules.issues]
              .sort((a, b) => {
                const severityOrder = ['critical', 'high', 'medium', 'low'];
                return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
              })
              .slice(0, 10)
              .map((issue, index) => (
                <div key={index} className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getSeverityBadge(issue.severity)}
                    <Badge variant="outline">{issue.type}</Badge>
                  </div>
                  <p className="text-sm font-medium mt-2">{issue.description}</p>
                  {issue.evidence && issue.evidence.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <p className="font-semibold mb-1">증거:</p>
                      {issue.evidence.slice(0, 2).map((ev, i) => (
                        <p key={i} className="italic">"{ev}"</p>
                      ))}
                    </div>
                  )}
                  {issue.suggested_fix && (
                    <p className="text-xs text-blue-600 mt-2">
                      💡 제안: {issue.suggested_fix}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}