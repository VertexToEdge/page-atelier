/**
 * Aggregate Report Generator for final analysis summary
 * Used by: Backend - /api/analyze endpoint for final verdict generation
 * 
 * @tags aggregate-report, verdict-generation, final-analysis
 */

import type { 
  AggregateReport, 
  ConsistencyCheck, 
  PersonaResult, 
  Issue,
  ActionItem,
  Verdict 
} from './types';

/**
 * Generates comprehensive aggregate reports from analysis results
 * Used by: Backend - Core analysis pipeline for final report generation
 * 
 * @tags report-generator, verdict-calculator, action-items
 */
export class AggregateReportGenerator {
  private readonly verdictThresholds = {
    pass: 80,      // 80% or higher
    revise: 60,    // 60-79%
    block: 0       // Below 60%
  };

  private readonly weights = {
    continuity: 0.4,
    character: 0.35,
    world_rules: 0.25
  };

  /**
   * Generates complete aggregate report from all analysis results
   * Used by: Backend - Main analysis flow for final report compilation
   * 
   * @tags main-report, comprehensive-summary
   */
  generateReport(
    consistencyCheck: ConsistencyCheck,
    personaEvaluations: PersonaResult[]
  ): AggregateReport {
    // Calculate weighted scores
    const weightedScores = this.calculateWeightedScores(consistencyCheck);
    
    // Determine verdict based on total score
    const verdict = this.determineVerdict(weightedScores.total);
    
    // Generate action items from issues
    const actionItems = this.generateActionItems(
      consistencyCheck,
      personaEvaluations
    );
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      consistencyCheck,
      personaEvaluations
    );
    
    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(
      verdict,
      weightedScores,
      consistencyCheck,
      personaEvaluations
    );
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(
      verdict,
      actionItems,
      personaEvaluations
    );

    return {
      verdict,
      confidence_score: confidenceScore,
      weighted_scores: weightedScores,
      action_items: actionItems,
      executive_summary: executiveSummary,
      recommendation
    };
  }

  /**
   * Calculates weighted scores from consistency check
   * Used by: Backend - Score calculation for verdict
   * 
   * @tags score-calculation, weighted-average
   */
  private calculateWeightedScores(check: ConsistencyCheck): {
    continuity: number;
    character: number;
    world_rules: number;
    total: number;
  } {
    const continuity = Math.round(check.continuity.score);
    const character = Math.round(check.character.score);
    const worldRules = Math.round(check.world_rules.score);
    
    const total = Math.round(
      continuity * this.weights.continuity +
      character * this.weights.character +
      worldRules * this.weights.world_rules
    );

    return {
      continuity,
      character,
      world_rules: worldRules,
      total
    };
  }

  /**
   * Determines verdict based on total score
   * Used by: Backend - Verdict decision logic
   * 
   * @tags verdict-logic, decision-making
   */
  private determineVerdict(totalScore: number): Verdict {
    if (totalScore >= this.verdictThresholds.pass) {
      return 'PASS';
    } else if (totalScore >= this.verdictThresholds.revise) {
      return 'REVISE';
    } else {
      return 'BLOCK';
    }
  }

  /**
   * Generates prioritized action items from issues
   * Used by: Backend - Action item generation for authors
   * 
   * @tags action-items, issue-prioritization
   */
  private generateActionItems(
    consistencyCheck: ConsistencyCheck,
    personaEvaluations: PersonaResult[]
  ): ActionItem[] {
    const actionItems: ActionItem[] = [];

    // Process consistency issues
    const allIssues = [
      ...consistencyCheck.continuity.issues,
      ...consistencyCheck.character.issues,
      ...consistencyCheck.world_rules.issues
    ];

    // Convert critical and high severity issues to action items
    allIssues
      .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
      .forEach(issue => {
        actionItems.push(this.issueToActionItem(issue));
      });

    // Add persona-based suggestions as action items
    personaEvaluations.forEach(persona => {
      // Add critical suggestions if satisfaction is low
      if (persona.metrics.satisfaction < 60) {
        persona.suggestions.slice(0, 2).forEach(suggestion => {
          actionItems.push({
            priority: 'high',
            type: 'improvement',
            description: `[${persona.persona_name}] ${suggestion}`,
            affected_area: 'reader_satisfaction',
            estimated_effort: 'moderate'
          });
        });
      }
    });

    // Sort by priority
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    actionItems.sort((a, b) => 
      priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    );

    // Return top 10 action items
    return actionItems.slice(0, 10);
  }

  /**
   * Converts issue to action item
   * Used by: Backend - Issue transformation
   * 
   * @tags issue-conversion, action-item-creation
   */
  private issueToActionItem(issue: Issue): ActionItem {
    const priorityMap = {
      critical: 'critical' as const,
      high: 'high' as const,
      medium: 'medium' as const,
      low: 'low' as const
    };

    const typeMap = {
      critical: 'fix_required' as const,
      high: 'fix_required' as const,
      medium: 'improvement' as const,
      low: 'consideration' as const
    };

    const effortMap = {
      critical: 'significant' as const,
      high: 'moderate' as const,
      medium: 'moderate' as const,
      low: 'minimal' as const
    };

    return {
      priority: priorityMap[issue.severity],
      type: typeMap[issue.severity],
      description: issue.suggested_fix || issue.description,
      affected_area: issue.type,
      estimated_effort: effortMap[issue.severity]
    };
  }

  /**
   * Calculates confidence score for the analysis
   * Used by: Backend - Confidence metric calculation
   * 
   * @tags confidence-score, reliability-metric
   */
  private calculateConfidenceScore(
    consistencyCheck: ConsistencyCheck,
    personaEvaluations: PersonaResult[]
  ): number {
    // Base confidence on consistency scores
    let confidence = consistencyCheck.overall_score;

    // Adjust based on persona agreement
    const reactions = personaEvaluations.map(p => p.overall_reaction);
    const positiveCount = reactions.filter(r => 
      r === 'very_positive' || r === 'positive'
    ).length;
    
    if (positiveCount === 3) {
      confidence = Math.min(100, confidence + 10);
    } else if (positiveCount === 0) {
      confidence = Math.max(0, confidence - 10);
    }

    // Adjust based on issue severity
    const criticalIssues = [
      ...consistencyCheck.continuity.issues,
      ...consistencyCheck.character.issues,
      ...consistencyCheck.world_rules.issues
    ].filter(i => i.severity === 'critical').length;

    confidence = Math.max(0, confidence - (criticalIssues * 5));

    return Math.round(confidence);
  }

  /**
   * Generates executive summary of the analysis
   * Used by: Backend - Summary generation for quick overview
   * 
   * @tags executive-summary, overview-generation
   */
  private generateExecutiveSummary(
    verdict: Verdict,
    scores: { continuity: number; character: number; world_rules: number; total: number },
    consistencyCheck: ConsistencyCheck,
    personaEvaluations: PersonaResult[]
  ): string {
    const verdictText = {
      PASS: '출간 가능',
      REVISE: '수정 필요',
      BLOCK: '대폭 수정 필요'
    };

    const totalIssues = 
      consistencyCheck.continuity.issues.length +
      consistencyCheck.character.issues.length +
      consistencyCheck.world_rules.issues.length;

    const avgSatisfaction = Math.round(
      personaEvaluations.reduce((sum, p) => sum + p.metrics.satisfaction, 0) / 
      personaEvaluations.length
    );

    return `검수 결과: ${verdictText[verdict]} (종합 점수: ${scores.total}/100)

주요 평가 지표:
- 개연성: ${scores.continuity}/100
- 캐릭터 일관성: ${scores.character}/100
- 세계관 규칙: ${scores.world_rules}/100

발견된 이슈: 총 ${totalIssues}개
독자 만족도: 평균 ${avgSatisfaction}/100

${verdict === 'PASS' 
  ? '작품이 전반적으로 양호한 상태입니다. minor한 수정 후 출간 가능합니다.'
  : verdict === 'REVISE'
  ? '몇 가지 중요한 이슈가 발견되었습니다. 수정 후 재검토가 필요합니다.'
  : '심각한 문제점들이 발견되었습니다. 대폭적인 수정이 필요합니다.'}`;
  }

  /**
   * Generates recommendation based on analysis
   * Used by: Backend - Actionable recommendation generation
   * 
   * @tags recommendation, action-guidance
   */
  private generateRecommendation(
    verdict: Verdict,
    actionItems: ActionItem[],
    personaEvaluations: PersonaResult[]
  ): string {
    const criticalItems = actionItems.filter(item => item.priority === 'critical');
    const highItems = actionItems.filter(item => item.priority === 'high');
    
    const lowestSatisfactionPersona = personaEvaluations.reduce((min, p) => 
      p.metrics.satisfaction < min.metrics.satisfaction ? p : min
    );

    if (verdict === 'PASS') {
      return `추천 사항:
1. 출간 준비를 진행하셔도 좋습니다.
2. ${highItems.length > 0 ? `${highItems.length}개의 개선사항을 검토해보세요.` : '세부 퇴고를 진행하세요.'}
3. ${lowestSatisfactionPersona.persona_name} 독자층을 위한 추가 개선을 고려해보세요.`;
    } else if (verdict === 'REVISE') {
      return `필수 수정 사항:
1. ${criticalItems.length > 0 ? `긴급: ${criticalItems.length}개의 심각한 이슈를 먼저 해결하세요.` : ''}
2. ${highItems.length}개의 중요 이슈를 수정하세요.
3. ${lowestSatisfactionPersona.persona_name}의 피드백을 중점적으로 반영하세요.
4. 수정 완료 후 재검수를 요청하세요.`;
    } else {
      return `긴급 조치 필요:
1. 작품의 기본 구조부터 재검토가 필요합니다.
2. ${criticalItems.length}개의 심각한 문제를 우선 해결하세요.
3. 전체적인 플롯과 캐릭터 설정을 다시 점검하세요.
4. 필요시 전문 편집자의 도움을 받는 것을 권장합니다.`;
    }
  }

  /**
   * Filters action items by priority
   * Used by: Backend - Action item prioritization
   * 
   * @tags filter, priority-management
   */
  filterActionItemsByPriority(
    actionItems: ActionItem[],
    minPriority: 'critical' | 'high' | 'medium' | 'low'
  ): ActionItem[] {
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    const minIndex = priorityOrder.indexOf(minPriority);
    
    return actionItems.filter(item => {
      const itemIndex = priorityOrder.indexOf(item.priority);
      return itemIndex <= minIndex;
    });
  }
}

export default AggregateReportGenerator;