'use babel'

const config = {
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
}

export { config }
