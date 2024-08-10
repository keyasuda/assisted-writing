# Assisted Writing: Power Your Pulsar with AI Text Generation

This package empowers you with in-editor text completion capabilities, leveraging the power of either local Large Language Models (LLMs) with llama.cpp and text-generation webui, or the Google AI Studio Gemini API.

![A screenshot](https://raw.githubusercontent.com/keyasuda/assisted-writing/images/screenshot.gif)

**Key Features:**

- **In-Editor Text Completion:** Leverage the power of your preferred LLMs, including Google AI Studio Gemini, for text generation directly within your editor.
- **Multiple LLM Support:** Choose between local LLMs (with llama.cpp or text-generation webui) or the cloud-based Google AI Studio Gemini.
- **Token Counter:** Stay informed about your text's token count, displayed conveniently on the statusbar. The counter now supports the built-in GPT-4o tokenizer and can also utilize the llama-server API for tokenization, providing flexibility and potential performance benefits.

**Getting Started:**

1.  **Choose your LLM backend:**
    - **For local LLMs:** Ensure either llama-server or text-generation webui (with the `--api`) is running.
    - **For Google AI Studio Gemini:** Set up your Google AI Studio API key (see instructions below).
2.  **Configure Settings:** Specify your API endpoint URI and other parameters within the package settings.
3.  **Compose Your Prompt:** Type your desired text into the editor.
4.  **Position Cursor:** Place the cursor at the point where you want the LLM to generate text.
5.  **Trigger Completion:** Invoke text completion by pressing CTRL+ALT+ENTER or navigating to "Assisted Writing: run" in the Command palette.
6.  **Abort Completion (Optional):** Press ESC to stop the generation process if needed.

**Settings:**

- **Backend:** Select your preferred LLM backend (llama-server, text-generation webui, or Google AI Studio Gemini API).
- **Endpoint:** Define the URI of your chosen API endpoint.
- **Params:** Customize API parameters to fine-tune the text generation behavior according to your requirements.
- **Google AI Studio Gemini Settings:**
  - **API Key:** Your Google AI Studio API Key.
  - **Model Name:** Your preferred Gemini model name (Flash, Pro or Pro experimental).

**Using Google AI Studio Gemini:**

1.  **Create API key:** Create an API Key on [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Configure the Plugin:** In the Assisted Writing package settings, select "Google AI Studio Gemini API" as the "Mode" and enter your API Key.
