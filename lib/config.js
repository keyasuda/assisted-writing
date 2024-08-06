'use babel'

const config = {
  mode: {
    type: 'string',
    default: 'local',
    description: 'API to use',
    enum: [
      { value: 'local', description: 'local API' },
      { value: 'gemini', description: 'Google AI Studio Gemini API' },
    ],
    order: 1,
  },

  local: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        default: 'http://127.0.0.1:8080/completions',
        description: 'URI of text completion API endpoint',
      },
      params: {
        type: 'string',
        default: JSON.stringify({
          n_predict: -1,
          temperature: 0.8,
        }),
        description: 'option parameters for text completion API',
      },
    },
    order: 2,
  },

  gemini: {
    type: 'object',
    properties: {
      apiKey: {
        type: 'string',
        default: '',
        description: 'API key of Google AI Studio Gemini',
      },
      modelName: {
        type: 'string',
        default: 'gemini-1.5-flash',
        description: 'model name to use',
        enum: [
          { value: 'gemini-1.5-flash', description: 'Gemini 1.5 Flash' },
          { value: 'gemini-1.5-pro', description: 'Gemini 1.5 Pro' },
          {
            value: 'gemini-1.5-pro-exp-0801',
            description: 'Gemini 1.5 Pro Experimental 0801',
          },
        ],
      },
      params: {
        type: 'string',
        default: JSON.stringify({
          temperature: 1,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
        }),
        description: 'option parameters for Gemini API',
      },
    },
    order: 3,
  },
}

export { config }
