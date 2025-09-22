'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, Lightbulb, User, Heart, Sparkles } from 'lucide-react';
import type { PersonaResult } from '@page-atelier/core';

interface PersonasTabProps {
  personas: PersonaResult[];
}

export default function PersonasTab({ personas }: PersonasTabProps) {
  const getReactionColor = (reaction: string) => {
    switch (reaction) {
      case 'very_positive':
        return 'text-green-600 bg-green-50';
      case 'positive':
        return 'text-blue-600 bg-blue-50';
      case 'neutral':
        return 'text-gray-600 bg-gray-50';
      case 'negative':
        return 'text-orange-600 bg-orange-50';
      case 'very_negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getReactionEmoji = (reaction: string) => {
    switch (reaction) {
      case 'very_positive':
        return '😍';
      case 'positive':
        return '😊';
      case 'neutral':
        return '😐';
      case 'negative':
        return '😕';
      case 'very_negative':
        return '😞';
      default:
        return '🤔';
    }
  };

  const getPersonaIcon = (type: string) => {
    switch (type) {
      case 'setting_obsessed':
        return <Sparkles className="w-5 h-5" />;
      case 'romance_sub_focused':
        return <Heart className="w-5 h-5" />;
      case 'traditional_martial_arts_fan':
        return <User className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  if (!personas || personas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        페르소나 평가 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>전체 독자 반응 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">평균 만족도</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {Math.round(personas.reduce((acc, p) => acc + p.metrics.satisfaction, 0) / personas.length)}
                </span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">평균 몰입도</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {Math.round(personas.reduce((acc, p) => acc + p.metrics.engagement, 0) / personas.length)}
                </span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">평균 불만족도</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {Math.round(personas.reduce((acc, p) => acc + p.metrics.frustration, 0) / personas.length)}
                </span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Persona Cards */}
      <div className="space-y-6">
        {personas.map((persona, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className={`${getReactionColor(persona.overall_reaction)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getPersonaIcon(persona.persona_type)}
                  <div>
                    <CardTitle className="text-lg">{persona.persona_name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {persona.persona_description}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-3xl">
                  {getReactionEmoji(persona.overall_reaction)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              {/* Metrics */}
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">만족도</span>
                    <span className="text-sm font-bold">{persona.metrics.satisfaction}%</span>
                  </div>
                  <Progress value={persona.metrics.satisfaction} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">몰입도</span>
                    <span className="text-sm font-bold">{persona.metrics.engagement}%</span>
                  </div>
                  <Progress value={persona.metrics.engagement} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">불만족도</span>
                    <span className="text-sm font-bold">{persona.metrics.frustration}%</span>
                  </div>
                  <Progress value={persona.metrics.frustration} className="h-2" />
                </div>
              </div>

              {/* Likes & Dislikes */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold">마음에 든 점</span>
                  </div>
                  <ul className="space-y-1">
                    {persona.likes.slice(0, 3).map((like, i) => (
                      <li key={i} className="text-xs text-gray-700 pl-4">• {like}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold">아쉬운 점</span>
                  </div>
                  <ul className="space-y-1">
                    {persona.dislikes.slice(0, 3).map((dislike, i) => (
                      <li key={i} className="text-xs text-gray-700 pl-4">• {dislike}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold">개선 제안</span>
                </div>
                <ul className="space-y-1">
                  {persona.suggestions.slice(0, 3).map((suggestion, i) => (
                    <li key={i} className="text-xs text-gray-700 pl-4">• {suggestion}</li>
                  ))}
                </ul>
              </div>

              {/* Sample Comment */}
              {persona.sample_comment && (
                <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">예상 댓글</p>
                  <p className="text-sm italic text-gray-700">"{persona.sample_comment}"</p>
                </div>
              )}

              {/* Overall Reaction Badge */}
              <div className="mt-4 flex justify-end">
                <Badge variant="outline" className={getReactionColor(persona.overall_reaction)}>
                  {persona.overall_reaction.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}