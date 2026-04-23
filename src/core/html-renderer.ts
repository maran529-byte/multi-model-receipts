import type { ReceiptData, ReceiptOptions, AggregatedUsage } from '../types/index.js';
import { PROVIDER_LOGOS, PROVIDER_NAMES } from './pricing.js';
import { formatCurrency, formatNumber, formatDateTime } from '../utils/formatting.js';

export class HtmlRenderer {
  private qrImagePath?: string;
  private customBranding?: string;

  constructor(qrImagePath?: string, customBranding?: string) {
    this.qrImagePath = qrImagePath;
    this.customBranding = customBranding;
  }

  generateSummaryHtml(usages: AggregatedUsage[], options: ReceiptOptions): string {
    const totalCost = usages.reduce((sum, u) => sum + u.totalCost, 0);
    const totalTokens = usages.reduce((sum, u) => sum + u.totalTokens, 0);
    const totalInput = usages.reduce((sum, u) => sum + u.totalInputTokens, 0);
    const totalOutput = usages.reduce((sum, u) => sum + u.totalOutputTokens, 0);

    const periodLabels: Record<string, string> = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usage Summary Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 16px;
      background: #1a1a1a;
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding: 30px;
      background: #f8f8f8;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .header .date {
      color: #666;
      font-size: 14px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .period-card {
      background: #f8f8f8;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .period-card h2 {
      font-size: 14px;
      color: #666;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .period-card .cost {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .period-card .stat {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px dashed #ddd;
      font-size: 14px;
    }
    .period-card .stat:last-child {
      border-bottom: none;
    }
    .period-card .stat .label {
      color: #666;
    }
    .period-card .stat .value {
      font-weight: bold;
    }
    .models-section {
      background: #f8f8f8;
      padding: 25px;
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .models-section h2 {
      font-size: 18px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
    }
    .model-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    .model-row.header {
      font-weight: bold;
      background: #eee;
      padding: 10px;
      margin: -25px;
      margin-bottom: 10px;
      border-radius: 5px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 13px;
    }
    .footer a {
      color: #333;
    }
    @media print {
      body { background: white; }
      .period-card, .models-section { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Usage Summary Report</h1>
      <div class="date">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      ${this.customBranding ? `<div>User: ${this.escapeHtml(this.customBranding)}</div>` : ''}
    </div>

    <div class="summary-grid">
      ${usages.map((usage, i) => `
        <div class="period-card">
          <h2>${periodLabels[usage.period] || usage.period}</h2>
          <div class="cost">${this.formatCurrency(usage.totalCost, options.currency)}</div>
          <div class="stat"><span class="label">Total Tokens</span><span class="value">${usage.totalTokens.toLocaleString()}</span></div>
          <div class="stat"><span class="label">Input</span><span class="value">${usage.totalInputTokens.toLocaleString()}</span></div>
          <div class="stat"><span class="label">Output</span><span class="value">${usage.totalOutputTokens.toLocaleString()}</span></div>
          ${usage.totalCacheCreationTokens > 0 ? `<div class="stat"><span class="label">Cache Write</span><span class="value">${usage.totalCacheCreationTokens.toLocaleString()}</span></div>` : ''}
          ${usage.totalCacheReadTokens > 0 ? `<div class="stat"><span class="label">Cache Read</span><span class="value">${usage.totalCacheReadTokens.toLocaleString()}</span></div>` : ''}
          <div class="stat"><span class="label">Requests</span><span class="value">${usage.totalRequestCount.toLocaleString()}</span></div>
        </div>
      `).join('')}
    </div>

    <div class="models-section">
      <h2>Model Breakdown (This Month)</h2>
      <div class="model-row header">
        <span>Model</span>
        <span>Input</span>
        <span>Output</span>
        <span>Tokens</span>
        <span>Cost</span>
      </div>
      ${(usages.find(u => u.period === 'month')?.providers[0]?.modelsUsed || [])
        .sort((a, b) => b.cost - a.cost)
        .map(m => `
        <div class="model-row">
          <span>${this.escapeHtml(m.modelName)}</span>
          <span>${m.inputTokens.toLocaleString()}</span>
          <span>${m.outputTokens.toLocaleString()}</span>
          <span>${m.totalTokens.toLocaleString()}</span>
          <span>${this.formatCurrency(m.cost, options.currency)}</span>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p>Generated by <strong>Multi-Model Receipts</strong></p>
      <p><a href="https://github.com/marans/multi-model-receipts">github.com/marans/multi-model-receipts</a></p>
      ${this.qrImagePath ? `<p style="margin-top:15px"><img src="${this.escapeHtml(this.qrImagePath)}" style="width:120px;border:1px solid #ddd" /></p>` : ''}
    </div>
  </div>

  <script>
    console.log('Usage Summary Generated!');
    console.log('Total Cost:', '${this.formatCurrency(totalCost, options.currency)}');
    console.log('Total Tokens:', '${totalTokens.toLocaleString()}');
  </script>
</body>
</html>`;
  }

  private formatCurrency(amount: number, currency: string = 'USD'): string {
    if (amount < 0.01 && amount > 0) {
      return `$${amount.toFixed(4)}`;
    }
    return `$${amount.toFixed(2)}`;
  }

  generateHtml(usage: AggregatedUsage, options: ReceiptOptions): string {
    const providers = usage.providers;
    const primaryProvider = providers[0];
    const providerName = PROVIDER_NAMES[primaryProvider?.provider] || 'AI';
    const logo = PROVIDER_LOGOS[primaryProvider?.provider] || PROVIDER_LOGOS.openai;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${providerName} Usage Receipt</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 16px;
      background: #1a1a1a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }

    .receipt-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
      width: 100%;
      max-width: 500px;
    }

    .receipt {
      background: #f8f8f8;
      width: 100%;
      padding: 30px 25px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      position: relative;
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Thermal receipt tear-off effect */
    .receipt::before,
    .receipt::after {
      content: '';
      position: absolute;
      left: -10px;
      right: -10px;
      height: 15px;
      background: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 8px,
        #f8f8f8 8px,
        #f8f8f8 16px
      );
    }
    .receipt::before { top: -15px; }
    .receipt::after { bottom: -15px; }

    .header { text-align: center; padding-bottom: 20px; }

    .logo {
      font-weight: bold;
      white-space: pre;
      display: inline-block;
      line-height: 1.1;
      font-size: 10px;
      color: #333;
      margin-bottom: 15px;
    }

    .separator { border-bottom: 2px dashed #333; margin: 15px 0; }
    .light-separator { border-bottom: 1px dashed #999; margin: 10px 0; }

    .meta-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 15px;
    }

    .meta-row {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 8px;
      font-size: 14px;
    }

    .meta-label { color: #666; }
    .meta-dots { border-bottom: 1px dotted #999; overflow: hidden; }
    .meta-value { color: #333; text-align: right; }

    .providers-section { margin: 20px 0; }

    .provider-block {
      margin-bottom: 20px;
    }

    .provider-header {
      font-size: 18px;
      font-weight: bold;
      padding: 10px 0;
      border-bottom: 2px solid #333;
      margin-bottom: 10px;
    }

    .provider-logo {
      font-size: 8px;
      white-space: pre;
      line-height: 1.1;
      margin: 10px 0;
      color: #555;
    }

    .model-section { margin-left: 10px; }

    .model-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      color: #555;
      font-size: 14px;
    }

    .model-name {
      font-weight: bold;
      color: #333;
      margin-top: 8px;
      padding-bottom: 4px;
      border-bottom: 1px dashed #ccc;
    }

    .token-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 15px;
      color: #666;
      font-size: 13px;
    }

    .cost-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 15px;
      font-size: 13px;
    }

    .summary-box {
      background: #fff;
      border-left: 4px solid #333;
      padding: 15px;
      margin: 20px 0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }

    .summary-row.total {
      font-size: 20px;
      font-weight: bold;
      border-top: 2px solid #333;
      margin-top: 10px;
      padding-top: 10px;
    }

    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 2px dashed #999;
      color: #666;
      font-size: 13px;
    }

    .footer-message {
      margin: 15px 0;
      color: #333;
      font-size: 16px;
    }

    .footer-links {
      margin-top: 10px;
      font-size: 12px;
    }

    .footer-links a {
      color: #333;
    }

    .qr-section {
      margin-top: 20px;
      text-align: center;
    }

    .qr-image {
      max-width: 150px;
      border: 1px solid #ddd;
    }

    .qr-caption {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }

    .multi-provider-note {
      background: #fffde7;
      border: 1px solid #ffd54f;
      padding: 10px;
      margin: 15px 0;
      font-size: 13px;
      text-align: center;
    }

    @media print {
      body { background: white; }
      .receipt { box-shadow: none; }
      .receipt::before, .receipt::after { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="receipt">
      <div class="header">
        <pre class="logo">${this.escapeHtml(logo)}</pre>
        <div class="meta-info">
          <div class="meta-row">
            <span class="meta-label">Date</span>
            <span class="meta-dots"></span>
            <span class="meta-value">${formatDateTime(new Date(), options.timezone)}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Period</span>
            <span class="meta-dots"></span>
            <span class="meta-value">${this.formatPeriod(usage.period)}</span>
          </div>
          ${this.customBranding ? `
          <div class="meta-row">
            <span class="meta-label">User</span>
            <span class="meta-dots"></span>
            <span class="meta-value">${this.escapeHtml(this.customBranding)}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="separator"></div>

      ${this.renderProviders(usage, options)}

      <div class="summary-box">
        <div class="summary-row">
          <span>Total Tokens</span>
          <span>${formatNumber(usage.totalTokens)}</span>
        </div>
        <div class="summary-row">
          <span>Input Tokens</span>
          <span>${formatNumber(usage.totalInputTokens)}</span>
        </div>
        <div class="summary-row">
          <span>Output Tokens</span>
          <span>${formatNumber(usage.totalOutputTokens)}</span>
        </div>
        ${usage.totalCacheCreationTokens > 0 ? `
        <div class="summary-row">
          <span>Cache Write</span>
          <span>${formatNumber(usage.totalCacheCreationTokens)}</span>
        </div>
        ` : ''}
        ${usage.totalCacheReadTokens > 0 ? `
        <div class="summary-row">
          <span>Cache Read</span>
          <span>${formatNumber(usage.totalCacheReadTokens)}</span>
        </div>
        ` : ''}
        <div class="summary-row total">
          <span>TOTAL</span>
          <span>${formatCurrency(usage.totalCost, options.currency)}</span>
        </div>
      </div>

      <div class="footer">
        <div class="footer-message">Thank you for using AI!</div>
        <div class="footer-links">
          Track your AI usage with <strong>Multi-Model Receipts</strong><br>
          <a href="https://github.com/marans/multi-model-receipts">github.com/marans/multi-model-receipts</a>
        </div>

        ${this.qrImagePath ? `
        <div class="qr-section">
          <img src="${this.escapeHtml(this.qrImagePath)}" alt="Donation QR" class="qr-image" />
          <div class="qr-caption">☕ Buy me a coffee</div>
        </div>
        ` : ''}
      </div>
    </div>
  </div>

  <script>
    console.log('Multi-Model Receipt Generated!');
    console.log('Total Cost:', '${formatCurrency(usage.totalCost, options.currency)}');
    console.log('Total Tokens:', '${formatNumber(usage.totalTokens)}');

    // Close with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.close();
    });
  </script>
</body>
</html>`;
  }

  private renderProviders(usage: AggregatedUsage, options: ReceiptOptions): string {
    if (usage.providers.length === 1) {
      return this.renderSingleProvider(usage.providers[0]);
    }

    let html = `<div class="multi-provider-note">📊 ${usage.providers.length} Providers Tracked</div>`;
    
    for (const provider of usage.providers) {
      html += this.renderSingleProvider(provider);
    }

    return html;
  }

  private renderSingleProvider(provider: any): string {
    return `
    <div class="provider-block">
      <div class="provider-header">${provider.providerName}</div>
      <div class="model-section">
        ${provider.modelsUsed.map((model: any) => `
          <div class="model-name">${this.escapeHtml(model.modelName)}</div>
          <div class="token-row">
            <span>Input</span>
            <span>${formatNumber(model.inputTokens)}</span>
          </div>
          <div class="token-row">
            <span>Output</span>
            <span>${formatNumber(model.outputTokens)}</span>
          </div>
          ${model.cacheCreationTokens > 0 ? `
          <div class="token-row">
            <span>Cache Write</span>
            <span>${formatNumber(model.cacheCreationTokens)}</span>
          </div>
          ` : ''}
          ${model.cacheReadTokens > 0 ? `
          <div class="token-row">
            <span>Cache Read</span>
            <span>${formatNumber(model.cacheReadTokens)}</span>
          </div>
          ` : ''}
          <div class="cost-row" style="font-weight: bold; color: #333;">
            <span>Cost</span>
            <span>${formatCurrency(model.cost)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    `;
  }

  private formatPeriod(period: string): string {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'custom': return 'Custom Range';
      default: return period;
    }
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
