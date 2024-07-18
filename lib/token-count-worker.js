// worker to count tokens
const { Tiktoken } = require("tiktoken/lite");
// tokenizer for GPT-4o
const o200k_base = require("tiktoken/encoders/o200k_base.json");

const encoder = new Tiktoken(
  o200k_base.bpe_ranks,
  o200k_base.special_tokens,
  o200k_base.pat_str
);

self.addEventListener('message', e => {
  var text = e.data;
  var count = encoder.encode(text).length;

  postMessage(count);
}, false);
