'use babel'

const config = {
  local: {
    title: 'llama.cpp / text-generation webui',
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
        default: 'gemini-2.0-flash',
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

  ollama: {
    title: 'Ollama',
    type: 'object',
    properties: {
      enable: {
        title: 'Enable',
        type: 'boolean',
        default: false,
      },
      endpoint: {
        title: 'Endpoint',
        type: 'string',
        default: 'http://localhost:11434/api/generate',
        description: 'Ollama API endpoint URI',
      },
      model: {
        // Add model setting for Ollama
        title: 'Model',
        type: 'string',
        default: 'llama3', // Or any default Ollama model
        description: 'Ollama model to use',
      },
      params: {
        // Add params setting for Ollama
        title: 'Params',
        type: 'string',
        default: JSON.stringify({
          options: {
            temperature: 0.8,
            // Add other Ollama options as needed, e.g., top_k, top_p
          },
        }),
        description: 'Additional model parameters for Ollama',
      },
    },
    order: 1, // Ollama settings before local and gemini
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
    order: 4, // Keep tokenCounter last
  },
}

export { config }
