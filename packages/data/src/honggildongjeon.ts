/**
 * Honggildongjeon text data loader and processor
 * Used by: Backend - /api/analyze endpoint for story text retrieval
 * 
 * @tags data, honggildongjeon, text-loader, story-data
 */

import * as fs from 'fs';
import * as path from 'path';

export interface TextData {
  title: string;
  fullText: string;
  chapters: Chapter[];
  metadata: {
    source: string;
    totalCharacters: number;
    totalChapters: number;
  };
}

export interface Chapter {
  number: number;
  title: string;
  content: string;
}

/**
 * Loads and processes Honggildongjeon text from example.txt
 * Used by: Backend - API endpoint for initial text loading
 * 
 * @tags file-reader, text-processor
 */
export async function loadHonggildongjeonText(): Promise<TextData> {
  try {
    // Read from example.txt in project root
    const filePath = path.resolve(process.cwd(), 'example.txt');
    const fullText = await fs.promises.readFile(filePath, 'utf-8');
    
    // Parse chapters based on == markers
    const chapters = parseChapters(fullText);
    
    return {
      title: '홍길동전',
      fullText,
      chapters,
      metadata: {
        source: 'example.txt',
        totalCharacters: fullText.length,
        totalChapters: chapters.length
      }
    };
  } catch (error) {
    console.error('Failed to load Honggildongjeon text:', error);
    // Return sample data if file not found
    return getSampleData();
  }
}

/**
 * Parses text into chapters based on == markers
 * Used by: Backend - loadHonggildongjeonText for chapter extraction
 * 
 * @tags parser, chapter-extractor
 */
function parseChapters(text: string): Chapter[] {
  const chapters: Chapter[] = [];
  const lines = text.split('\n');
  
  let currentChapter: Chapter | null = null;
  let chapterContent: string[] = [];
  let chapterNumber = 0;
  
  for (const line of lines) {
    // Check if line starts with == (chapter marker)
    if (line.startsWith('==') && line.endsWith('==')) {
      // Save previous chapter if exists
      if (currentChapter) {
        currentChapter.content = chapterContent.join('\n').trim();
        chapters.push(currentChapter);
        chapterContent = [];
      }
      
      // Extract chapter title
      const title = line.replace(/==/g, '').trim();
      chapterNumber++;
      
      currentChapter = {
        number: chapterNumber,
        title,
        content: ''
      };
    } else {
      // Add line to current chapter content
      chapterContent.push(line);
    }
  }
  
  // Save last chapter
  if (currentChapter) {
    currentChapter.content = chapterContent.join('\n').trim();
    chapters.push(currentChapter);
  }
  
  return chapters;
}

/**
 * Returns sample Honggildongjeon data for development/testing
 * Used by: Backend - Fallback when example.txt is not available
 * 
 * @tags sample-data, fallback, development
 */
export function getSampleData(): TextData {
  const sampleText = `==一, 길동이 몸이 천하다==
옛날 저 이조시절에 잇섯든 일이엇다. 한 재상이 잇서 두 아들을 두엇으니 맛아들의 이름은 인형이요 고담을 길동이라 불럿다. 마는 인형이는 그 아우 길동이를 그리 썩 탐탁히 녀겨주지 안엇다. 왜냐면 자기는 정실 유씨부인의 소생이로되 길동이는 계집종 춘섬의 몸에서 난 천한 서자이기 때문이엇다.

==二, 길동이 슬퍼하다==
하루는 밤이 이슥하야 아버지는 사랑마당에서 배회하는 길동이를 발견하셧다. 푸른 하늘에 달은 맑고 정자에 우거진 온갓 나무들이 부수수 하고 낙엽이 지는 처량한 밤이엿다.`;

  return {
    title: '홍길동전 (샘플)',
    fullText: sampleText,
    chapters: parseChapters(sampleText),
    metadata: {
      source: 'sample',
      totalCharacters: sampleText.length,
      totalChapters: 2
    }
  };
}

/**
 * Gets cached setting note data (to be implemented)
 * Used by: Backend - For reducing LLM calls when setting note already exists
 * 
 * @tags cache, setting-note, optimization
 */
export function getCachedSettingNote(): any | null {
  // TODO: Implement caching logic for setting notes
  // This will store previously generated setting notes to avoid redundant LLM calls
  return null;
}

export default {
  loadHonggildongjeonText,
  getSampleData,
  getCachedSettingNote
};