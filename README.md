# Assisted Writing: Power Your Pulsar with AI Text Generation

This package empowers you with in-editor text completion capabilities, leveraging either the llama.cpp or text-generation webui.

![A screenshot](https://raw.githubusercontent.com/keyasuda/assisted-writing/images/screenshot.gif)

**Key Features:**

- **In-Editor Text Completion:** Leverage the power of your preferred large language models (LLMs) for text generation directly within your editor.
- **Token Counter:** Stay informed about your text's token count, displayed conveniently on the statusbar. The counter utilizes the GPT-4o tokenizer for measurements.

**Getting Started:**

1.  **Start Your API Server:** Ensure either llama-server or text-generation webui (with the `--api`) is running.
2.  **(Optional) Configure API Endpoint:** Specify your API endpoint URI within the package settings.
3.  **Compose Your Prompt:** Type your desired text into the editor.
4.  **Position Cursor:** Place the cursor at the point where you want the LLM to generate text.
5.  **Trigger Completion:** Invoke text completion by pressing CTRL+ALT+ENTER or navigating to "Assisted Writing: run" in the Command palette.
6.  **Abort Completion (Optional):** Press ESC to stop the generation process if needed.

**Settings:**

- **Endpoint:** Define the URI of your chosen API endpoint (llama-server or text-generation webui).
- **Params:** Customize API parameters to fine-tune the text generation behavior according to your requirements.
