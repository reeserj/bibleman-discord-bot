const { OpenAI } = require('openai');
const logger = require('./utils/logger');

class AIService {
  constructor() {
    this.openai = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (!process.env.VENICE_API_KEY) {
        throw new Error('VENICE_API_KEY environment variable is required');
      }

      this.openai = new OpenAI({
        apiKey: process.env.VENICE_API_KEY,
        baseURL: 'https://api.venice.ai/api/v1'
      });

      this.initialized = true;
      logger.info('AIService initialized successfully with Venice AI');
    } catch (error) {
      logger.error('Failed to initialize AIService:', error);
      throw error;
    }
  }

  async generateApplicationQuestion(readingAssignment) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!readingAssignment || !readingAssignment.trim()) {
        logger.warn('No reading assignment provided for AI question generation');
        return null;
      }

      // Create a prompt for the AI to generate an application question
      const prompt = this.createApplicationQuestionPrompt(readingAssignment);
      
      logger.debug(`Generating AI application question for: ${readingAssignment}`);

      const response = await this.openai.chat.completions.create({
        model: "llama-3.3-70b", // Venice - better quality, no thinking tags
        messages: [
          {
            role: "system",
            content: "You are a mentor who helps high school boys (ages 14-18) apply Bible readings to their daily lives. Generate ONE specific, challenge-based question that forces them to think about practical action. Your questions should be action-oriented using phrases like 'What's one way you can...', 'Choose one...', 'Identify one area...', 'Who is one person...', 'What's one specific action...'. Focus on real-world scenarios high school boys face: friendships, sports, school pressure, family relationships, social media, integrity, courage, and character. Make it specific and actionable, not vague. The question should challenge them to DO something, not just think about something. IMPORTANT: Output ONLY the question itself, no explanations, no thinking process, no preamble."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      });

      let question = response.choices[0]?.message?.content?.trim();
      
      if (!question) {
        logger.warn('No application question generated from Venice AI');
        return null;
      }

      // Clean up thinking tags if present
      question = this.cleanThinkingTags(question);

      // Ensure it ends with a question mark
      if (question && !question.endsWith('?')) {
        question += '?';
      }

      logger.info(`AI application question generated for ${readingAssignment}`);
      return question;

    } catch (error) {
      logger.error('Error generating AI application question:', error);
      return null;
    }
  }

  createApplicationQuestionPrompt(readingAssignment) {
    let prompt = `Based on the Bible reading "${readingAssignment}", generate ONE specific challenge-based question for high school boys that forces them to think about how to apply this passage to their lives TODAY or THIS WEEK.\n\n`;
    
    prompt += `The question should:\n`;
    prompt += `- Start with action words: "What's one way...", "Choose one...", "Identify one...", "Who is one person..."\n`;
    prompt += `- Be specific and concrete (not vague like "how do you feel")\n`;
    prompt += `- Focus on practical action they can take\n`;
    prompt += `- Relate to real situations high school boys face (friends, school, sports, family, social media, integrity)\n`;
    prompt += `- Challenge them to DO something specific\n\n`;
    
    prompt += `Examples of good questions:\n`;
    prompt += `- "What's one specific way you can show courage in a difficult situation at school this week?"\n`;
    prompt += `- "Choose one friend who needs encouragement today - how will you reach out to them?"\n`;
    prompt += `- "Identify one area where you've been compromising your values. What's your first step to change it?"\n\n`;
    
    prompt += `Generate ONE question now:`;
    
    return prompt;
  }

  async generateBookSummary(bookName, chapterRange = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!bookName || !bookName.trim()) {
        logger.warn('No book name provided for AI summary');
        return null;
      }

      // Create a prompt for the AI to generate a book summary
      const prompt = this.createBookSummaryPrompt(bookName, chapterRange);
      
      logger.debug(`Generating AI summary for: ${bookName}${chapterRange ? ` (${chapterRange})` : ''}`);

      const response = await this.openai.chat.completions.create({
        model: "qwen3-4b", // Venice Small - fast and cost-efficient for summaries
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides concise, engaging summaries of Bible books and chapters for high school boys. Focus on key themes, important stories, and spiritual insights. Emphasize practical life application and how the scripture applies to their daily lives. Use bullet points when possible to make content easy to scan. Keep summaries brief but informative, suitable for a daily Bible reading Discord bot."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      let summary = response.choices[0]?.message?.content?.trim();
      
      if (!summary) {
        logger.warn('No summary generated from Venice AI');
        return null;
      }

      // Clean up thinking tags if present
      summary = this.cleanThinkingTags(summary);

      logger.info(`AI summary generated for ${bookName}`);
      return summary;

    } catch (error) {
      logger.error('Error generating AI book summary:', error);
      return null;
    }
  }

  createBookSummaryPrompt(bookName, chapterRange) {
    let prompt = `Provide a brief, engaging summary of the book of ${bookName}`;
    
    if (chapterRange) {
      prompt += `, specifically covering ${chapterRange}`;
    }
    
    prompt += `. Include key themes, important stories, and spiritual insights. Focus on practical life application for high school boys - how can they apply this scripture to their daily lives? Use bullet points when possible to make it easy to scan. Keep it concise (2-3 sentences) and suitable for a daily Bible reading context.`;
    
    return prompt;
  }

  async generateChapterSummary(bookName, chapterNumber) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!bookName || !chapterNumber) {
        logger.warn('Book name and chapter number required for chapter summary');
        return null;
      }

      const prompt = `Provide a brief summary of ${bookName} chapter ${chapterNumber}. Include the main events, key themes, and spiritual insights. Focus on practical life application for high school boys - how can they apply this scripture to their daily lives? Use bullet points when possible to make it easy to scan. Keep it concise (1-2 sentences) for a daily Bible reading context.`;

      const response = await this.openai.chat.completions.create({
        model: "qwen3-4b", // Venice Small - fast and cost-efficient for summaries
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides concise, engaging summaries of Bible chapters for high school boys. Focus on key events, themes, and spiritual insights. Emphasize practical life application and how the scripture applies to their daily lives. Use bullet points when possible to make content easy to scan. Keep summaries brief but informative."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      let summary = response.choices[0]?.message?.content?.trim();
      
      if (!summary) {
        logger.warn('No chapter summary generated from Venice AI');
        return null;
      }

      // Clean up thinking tags if present
      summary = this.cleanThinkingTags(summary);

      logger.info(`AI chapter summary generated for ${bookName} ${chapterNumber}`);
      return summary;

    } catch (error) {
      logger.error('Error generating AI chapter summary:', error);
      return null;
    }
  }

  // Extract book name from reading assignment (e.g., "Genesis 1-3" -> "Genesis")
  extractBookName(readingAssignment) {
    if (!readingAssignment || typeof readingAssignment !== 'string') {
      return null;
    }

    // Remove common prefixes and extract the first word (book name)
    const cleaned = readingAssignment.trim();
    const bookName = cleaned.split(' ')[0];
    
    // Validate it's a reasonable book name (at least 3 characters, no numbers)
    if (bookName && bookName.length >= 3 && !/\d/.test(bookName)) {
      return bookName;
    }

    return null;
  }

  // Extract chapter range (e.g., "Genesis 1-3" -> "1-3")
  extractChapterRange(readingAssignment) {
    if (!readingAssignment || typeof readingAssignment !== 'string') {
      return null;
    }

    const match = readingAssignment.match(/\d+(?:-\d+)?/);
    return match ? match[0] : null;
  }

  // Clean up thinking tags from Venice AI responses
  cleanThinkingTags(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // Remove <think>...</think> tags and their content (with closing tag)
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    
    // Also remove incomplete <think> tags (without closing tags) - take everything before <think>
    if (cleaned.includes('<think>')) {
      cleaned = cleaned.substring(0, cleaned.indexOf('<think>')).trim();
    }
    
    // If the cleaned text is empty or very short, return null (AI didn't generate a proper response)
    if (cleaned.length < 10) {
      logger.warn('AI response was mostly thinking tags, no actual content');
      return null;
    }
    
    return cleaned;
  }
}

module.exports = AIService;
