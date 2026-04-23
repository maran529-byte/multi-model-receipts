# Multi-Model Receipts

> Universal AI model usage receipt generator - track tokens and costs across OpenAI, Anthropic, Google, Azure, MiniMax and more

**Inspired by [claude-receipts](https://github.com/chrishutchinson/claude-receipts)** - A universal version that works with any AI model provider.

![Receipt Preview](receipt-example.png)

## Features

- 📊 **Multi-Platform Support** - OpenAI, Anthropic, Google Gemini, Azure OpenAI, MiniMax, and more
- 🧾 **Beautiful Receipts** - Thermal printer-style HTML receipts with dark mode
- 💰 **Cost Tracking** - Accurate cost calculation across all providers
- 🔌 **Easy Integration** - CLI tool or SDK import
- 📈 **Usage Analytics** - Summary by provider, model, and time period
- 🎨 **Customizable** - Add your own branding and payment QR codes

## Supported Providers

| Provider | Status | Models |
|----------|--------|--------|
| OpenAI | ✅ Full | GPT-4o, GPT-4-turbo, GPT-3.5-turbo, etc. |
| Anthropic | ✅ Full | Claude Opus, Sonnet, Haiku |
| Google Gemini | ✅ Full | Gemini Pro, Flash, Ultra |
| Azure OpenAI | ✅ Full | All Azure-hosted models |
| MiniMax | ✅ Full | MiniMax-Text, MiniMax-Embedding |
| Groq | ✅ Full | Llama, Mixtral |
| Cohere | ✅ Full | Command R+ |

## Installation

```bash
npm install -g multi-model-receipts
```

Or use directly with npx:

```bash
npx multi-model-receipts generate
```

## Quick Start

### Generate a receipt from API usage

```bash
# OpenAI
multi-model-receipts generate --provider openai --api-key sk-xxx

# Anthropic
multi-model-receipts generate --provider anthropic --api-key sk-ant-xxx

# Google Gemini
multi-model-receipts generate --provider google --api-key xxx

# MiniMax
multi-model-receipts generate --provider minimax --api-key xxx
```

### Interactive mode

```bash
multi-model-receipts generate --interactive
```

### Output formats

```bash
# HTML receipt (opens in browser)
multi-model-receipts generate --output html

# Console/terminal display
multi-model-receipts generate --output console

# JSON data export
multi-model-receipts generate --output json

# All formats
multi-model-receipts generate --output html,console,json
```

## Commands

### `generate`

Generate a usage receipt.

```bash
multi-model-receipts generate [options]

Options:
  --provider, -p     AI provider (openai|anthropic|google|azure|minimax|groq|cohere)
  --api-key, -k      API key for the provider
  --output, -o       Output format: html, console, json (default: html)
  --period, -r       Time period: today, week, month, custom (default: month)
  --start-date       Start date for custom period (YYYY-MM-DD)
  --end-date         End date for custom period (YYYY-MM-DD)
  --timezone, -t     Timezone for dates (default: local)
  --currency, -c     Currency for costs (default: USD)
  --include-models   Comma-separated model filter
  --exclude-models   Comma-separated model exclusion
  --qr-image         Path to QR code image for donations
  --custom-branding  Your name/brand to show on receipt
  --open,            Open HTML in browser (default: true for html output)
  --save, -s         Save path for output files
  --help             Show help
```

### `setup`

First-time setup and configuration.

```bash
multi-model-receipts setup
```

### `config`

Manage configuration.

```bash
# Show current config
multi-model-receipts config --show

# Set API key for a provider
multi-model-receipts config --set openai.key=sk-xxx
multi-model-receipts config --set anthropic.key=sk-ant-xxx

# Set default output format
multi-model-receipts config --set defaultOutput=html

# Reset to defaults
multi-model-receipts config --reset
```

### `providers`

List supported providers and their status.

```bash
multi-model-receipts providers
```

## Usage Examples

### Monthly usage report for OpenAI

```bash
multi-model-receipts generate \
  --provider openai \
  --api-key sk-xxx \
  --period month \
  --output html \
  --open
```

### Compare costs across providers

```bash
multi-model-receipts generate \
  --provider openai,anthropic,google \
  --period week \
  --output html \
  --save ./reports
```

### With custom branding and donation QR

```bash
multi-model-receipts generate \
  --provider openai \
  --api-key sk-xxx \
  --custom-branding "Your Name" \
  --qr-image ./donation-qr.png \
  --output html
```

## Configuration

Config file: `~/.multi-model-receipts.config.json`

```json
{
  "version": "1.0.0",
  "providers": {
    "openai": {
      "apiKey": null,
      "organization": null
    },
    "anthropic": {
      "apiKey": null
    },
    "google": {
      "apiKey": null
    },
    "azure": {
      "apiKey": null,
      "endpoint": null
    },
    "minimax": {
      "apiKey": null,
      "baseUrl": "https://api.minimax.chat/v1"
    }
  },
  "defaults": {
    "output": "html",
    "period": "month",
    "currency": "USD",
    "timezone": "Asia/Shanghai",
    "openBrowser": true
  },
  "customBranding": null,
  "qrImagePath": null
}
```

## Cost Calculation

Each provider has different pricing. We use official pricing APIs where available:

| Provider | Pricing Source |
|----------|---------------|
| OpenAI | [OpenAI Pricing](https://openai.com/pricing) |
| Anthropic | [Anthropic Pricing](https://anthropic.com/pricing) |
| Google | [Google AI Pricing](https://ai.google.pricing) |
| MiniMax | [MiniMax Pricing](https://www.minimax.chat/pricing) |

For inaccurate or missing data, please open an issue.

## Receipt Design

Inspired by thermal printer receipts:

- Black & white aesthetic with dotted separators
- Provider logos and ASCII art
- Detailed token breakdown by model
- Input/Output/Cache tokens displayed
- Total cost in large font
- QR code for donations (optional)

## Programmatic Usage

```javascript
import { ReceiptGenerator, HtmlRenderer, ConsoleRenderer } from 'multi-model-receipts';

// Create generator
const generator = new ReceiptGenerator({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY
});

// Fetch and process usage
const usageData = await generator.fetchUsage({ period: 'month' });

// Generate HTML receipt
const htmlRenderer = new HtmlRenderer();
const html = htmlRenderer.generateHtml(usageData, {
  customBranding: 'Your Name',
  qrImagePath: './donation-qr.png'
});

// Or console output
const consoleRenderer = new ConsoleRenderer();
consoleRenderer.render(usageData);
```

## Roadmap

- [x] Multi-provider support (OpenAI, Anthropic, Google, Azure, MiniMax)
- [x] HTML receipt generation with thermal printer aesthetic
- [x] Console/ASCII art output
- [x] JSON export for data analysis
- [x] Configurable branding and QR codes
- [ ] PNG/PDF export
- [ ] Batch processing multiple providers
- [ ] Historical trend charts
- [ ] Cost alerts and budgets
- [ ] Integration with ccusage for Claude Code sessions

## Contributing

Contributions welcome! Please read the contributing guidelines first.

## License

MIT

## Support

If this project helps you track AI costs, consider buying me a coffee ☕

Donation QR code can be displayed on receipts!
