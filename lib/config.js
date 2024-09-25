'use babel'

const config = {
  local: {
    title: 'Local LLM',
    type: 'object',
    properties: {
      enable: {
        title: 'Enable',
        type: 'boolean',
        default: true,
      },
      endpoint: {
        title: 'Endpoint',
        type: 'string',
        default: 'http://127.0.0.1:8080/completions',
        description: 'Text completion API endpoint URI',
      },
      params: {
        title: 'Params',
        type: 'string',
        default: JSON.stringify({
          n_predict: -1,
          temperature: 0.8,
        }),
        description: 'option parameters for text generation',
      },
    },
    order: 2,
  },

  gemini: {
    title: 'Google AI Studio Gemini API',
    type: 'object',
    properties: {
      enable: {
        title: 'Enable',
        type: 'boolean',
        default: false,
        order: 1,
      },
      apiKey: {
        title: 'API key',
        type: 'string',
        default: '',
        order: 2,
      },
      modelName: {
        title: 'Model name',
        type: 'string',
        default: 'gemini-1.5-flash-002',
        enum: [
          {
            value: 'gemini-1.5-flash-002',
            description: 'Gemini 1.5 Flash 002',
          },
          { value: 'gemini-1.5-pro-002', description: 'Gemini 1.5 Pro 002' },
          { value: 'gemini-1.5-flash', description: 'Gemini 1.5 Flash' },
          { value: 'gemini-1.5-pro', description: 'Gemini 1.5 Pro' },
          {
            value: 'gemini-1.5-pro-exp-0801',
            description: 'Gemini 1.5 Pro Experimental 0801',
          },
          {
            value: 'gemini-1.5-pro-exp-0827',
            description: 'Gemini 1.5 Pro Experimental 0827',
          },
          {
            value: 'gemini-1.5-flash-exp-0827',
            description: 'Gemini 1.5 Flash Experimental 0827',
          },
          {
            value: 'gemini-1.5-flash-8b-exp-0827',
            description: 'Gemini 1.5 Flash-8B Experimental 0827',
          },
        ],
        order: 3,
      },
      params: {
        title: 'Params',
        type: 'string',
        default: JSON.stringify({
          temperature: 1,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
        }),
        description: 'option parameters for text generation',
        order: 4,
      },
      blockedWords: {
        title: 'Blocked words',
        type: 'string',
        default: '',
        description:
          "The package won't send prompts to the API when these words are included. Words should be splitted in whitespaces",
        order: 5,
      },
    },
    order: 3,
  },

  tokenCounter: {
    type: 'object',
    properties: {
      tokenizer: {
        title: 'Tokenizer',
        type: 'string',
        default: 'gpt4o',
        enum: [
          { value: 'gpt4o', description: 'built-in GPT-4o tokenizer' },
          { value: 'llama-server', description: 'llama-server tokenize API' },
        ],
      },
      tokenizerEndpoint: {
        title: 'Endpoint',
        type: 'string',
        default: 'http://127.0.0.1:8080/tokenize',
        description: 'Tokenize API endpoint URL',
      },
    },
    order: 3,
  },
}

export { config }
