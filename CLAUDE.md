# Development Guidelines for Page Atelier

## 1. Project Context and Planning

### Context Files
All project documentation is maintained in `.claude/context-long-term/*.md`:
- **PRD.md**: Consult this file for project description, objectives, and business value
- **TODO.md**: Reference this for current development progress and task tracking

## 2. Development Workflow

### Task Management
- Development progresses are tracked in `.claude/context-long-term/todo.md`
- Work is organized in Phases - complete each Phase before moving to the next
- After completing each Phase, update `todo.md` with:
  - Completed task details
  - Source code locations with file paths and line numbers (e.g., `src/components/Analysis.tsx:45-92`)
  - Status updates for each subtask

### Phase Completion Protocol
When finishing a Phase:
1. Mark all completed tasks with checkmarks
2. Add implementation details with precise code references
3. Document any deviations from the original plan
4. Update the next Phase's tasks if needed

## 3. Code Implementation Standards

### Type-First Development
**Before writing any implementation code:**
1. Define all TypeScript types and interfaces comprehensively
2. Place type definitions in appropriate type files
3. Ensure type safety across the entire codebase

### Code Reuse Check
**Before adding new features:**
1. Search the codebase for similar existing functionality
2. Evaluate if existing code can be extended or refactored
3. Avoid duplicating logic that already exists

## 4. Documentation Requirements

### For NEW Code
Add JSDoc documentation at module → class → function levels with the following structure:

```typescript
/**
 * [Purpose and usage description]
 * Used by: [Frontend/Backend] - [Component name] for [specific purpose]
 * 
 * @tags tag1, tag2, tag3
 * 
 * Example tags for text analysis features:
 * - llm, rule-generation, analyze-text, setting-builder
 * - consistency-check, persona-evaluation, report-generation
 */
```

#### Required Documentation Elements:
- **Purpose**: Clear description of what the code does
- **Usage Context**: Where it's used (e.g., "Frontend - AnalysisPanel component for triggering LLM analysis")
- **Searchable Tags**: Relevant keywords for easy feature discovery

#### Excluded from Documentation:
- **Input/Output specifications**: TypeScript types provide this information through inference
- **Parameter descriptions**: Unless the parameter name is ambiguous

### For EXISTING Code Modifications
When modifying existing code:
1. Update JSDoc comments in order: function → class → module
2. Ensure documentation reflects the current implementation
3. Add or update tags if functionality changes
4. Preserve historical context when relevant

## 5. Example Documentation

```typescript
/**
 * Generates a comprehensive setting note from the full text of a web novel
 * Used by: Backend - /api/analyze endpoint for initial story analysis
 * 
 * @tags llm, setting-extraction, character-analysis, world-building, honggildongjeon
 */
export class SettingBuilder {
  /**
   * Extracts character profiles including traits, taboos, and speech patterns
   * Used by: Backend - SettingBuilder class for character data generation
   * 
   * @tags character-extraction, nlp, profile-generation
   */
  async extractCharacters(text: string): Promise<Character[]> {
    // Implementation
  }
}
```

## 6. Technology Stack Reference

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **LLM Integration**: Provider-agnostic design (Gemini/OpenAI compatible)
- **Package Management**: pnpm with Turborepo for monorepo structure
- **Testing**: Vitest for unit tests
- **Code Quality**: ESLint, Prettier

## 7. Project Structure

```
page-atelier/
├─ apps/
│  └─ web/                    # Next.js application
│     ├─ app/                 # App Router pages and API
│     └─ components/          # React components
├─ packages/
│  ├─ core/                   # Business logic and algorithms
│  ├─ llm/                    # LLM adapter interfaces
│  └─ data/                   # Static data (Honggildongjeon text)
```

## 8. Key Implementation Notes

- All Honggildongjeon text data is hardcoded in `packages/data`
- LLM temperature should be set ≤ 0.3 for consistency
- JSON schemas must be strictly validated using Zod
- API responses must conform to the defined Analysis type structure
- UI must support three persona types: Setting-obsessed, Romance-sub-focus, Traditional-martial-arts-fan