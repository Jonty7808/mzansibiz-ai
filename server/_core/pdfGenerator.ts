/**
 * PDF Document Generator for MzansiBiz AI
 * Generates professional business documents as PDF files
 */

import { storagePut } from "../storage";

interface InvoiceData {
  invoiceNumber: string;
  businessName: string;
  businessEmail: string;
  clientName: string;
  clientEmail: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
}

interface ContractData {
  contractType: string;
  employeeName: string;
  employeeEmail: string;
  businessName: string;
  position: string;
  startDate: Date;
  salary: number;
  workingHours: string;
  terms?: string;
}

interface BusinessPlanData {
  businessName: string;
  businessType: string;
  ownerName: string;
  executiveSummary: string;
  marketAnalysis: string;
  financialProjections: string;
  marketingStrategy: string;
}

/**
 * Generate an HTML invoice that can be converted to PDF
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vat = subtotal * 0.15; // 15% VAT for South Africa
  const total = subtotal + vat;

  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.description}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R${(item.quantity * item.unitPrice).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${data.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          background: white;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          border-bottom: 3px solid #FF1493;
          padding-bottom: 20px;
        }
        .business-info h1 {
          margin: 0;
          color: #FF1493;
          font-size: 24px;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-details p {
          margin: 5px 0;
        }
        .invoice-number {
          font-weight: bold;
          font-size: 18px;
          color: #FF1493;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-weight: bold;
          color: #FF1493;
          margin-bottom: 10px;
          text-transform: uppercase;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background: #f5f5f5;
          padding: 10px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #FF1493;
        }
        .totals {
          width: 300px;
          margin-left: auto;
          margin-right: 0;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
        }
        .totals-row.total {
          font-weight: bold;
          font-size: 18px;
          color: #FF1493;
          border-bottom: 2px solid #FF1493;
          margin-top: 10px;
        }
        .notes {
          background: #f9f9f9;
          padding: 15px;
          border-left: 3px solid #00FFFF;
          margin-top: 20px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="business-info">
            <h1>${data.businessName}</h1>
            <p>${data.businessEmail}</p>
          </div>
          <div class="invoice-details">
            <div class="invoice-number">INVOICE #${data.invoiceNumber}</div>
            <p><strong>Issue Date:</strong> ${data.issueDate.toLocaleDateString('en-ZA')}</p>
            <p><strong>Due Date:</strong> ${data.dueDate.toLocaleDateString('en-ZA')}</p>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bill To</div>
          <p><strong>${data.clientName}</strong></p>
          <p>${data.clientEmail}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>R${subtotal.toFixed(2)}</span>
          </div>
          <div class="totals-row">
            <span>VAT (15%):</span>
            <span>R${vat.toFixed(2)}</span>
          </div>
          <div class="totals-row total">
            <span>TOTAL:</span>
            <span>R${total.toFixed(2)}</span>
          </div>
        </div>

        ${data.notes ? `<div class="notes"><strong>Notes:</strong> ${data.notes}</div>` : ""}

        <div class="footer">
          <p>This invoice was generated by MzansiBiz AI. Thank you for your business!</p>
          <p>Payment terms: Net ${Math.ceil((data.dueDate.getTime() - data.issueDate.getTime()) / (1000 * 60 * 60 * 24))} days</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate an HTML employment contract
 */
export function generateContractHTML(data: ContractData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Employment Contract</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          background: white;
          line-height: 1.6;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: #FF1493;
          margin-bottom: 30px;
          text-transform: uppercase;
        }
        h2 {
          color: #FF1493;
          margin-top: 30px;
          margin-bottom: 10px;
          border-bottom: 2px solid #00FFFF;
          padding-bottom: 5px;
        }
        .contract-info {
          background: #f9f9f9;
          padding: 15px;
          border-left: 3px solid #FF1493;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          width: 150px;
          color: #FF1493;
        }
        .info-value {
          flex: 1;
        }
        .terms {
          background: #f0f8ff;
          padding: 15px;
          border-left: 3px solid #00FFFF;
          margin-bottom: 20px;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature-block {
          width: 45%;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 40px;
          padding-top: 5px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Employment Contract</h1>

        <div class="contract-info">
          <div class="info-row">
            <span class="info-label">Employer:</span>
            <span class="info-value">${data.businessName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Employee:</span>
            <span class="info-value">${data.employeeName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Position:</span>
            <span class="info-value">${data.position}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Start Date:</span>
            <span class="info-value">${data.startDate.toLocaleDateString('en-ZA')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Monthly Salary:</span>
            <span class="info-value">R${data.salary.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Working Hours:</span>
            <span class="info-value">${data.workingHours}</span>
          </div>
        </div>

        <h2>Employment Terms</h2>
        <div class="terms">
          <p>This employment contract is entered into between ${data.businessName} (Employer) and ${data.employeeName} (Employee).</p>
          
          <h3 style="color: #333; margin-top: 15px;">1. Position and Duties</h3>
          <p>The Employee shall be employed as ${data.position} and shall perform duties as assigned by the Employer.</p>

          <h3 style="color: #333; margin-top: 15px;">2. Remuneration</h3>
          <p>The Employee shall receive a monthly salary of R${data.salary.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} payable on the last working day of each month.</p>

          <h3 style="color: #333; margin-top: 15px;">3. Working Hours</h3>
          <p>The Employee shall work the following hours: ${data.workingHours}</p>

          <h3 style="color: #333; margin-top: 15px;">4. Leave and Benefits</h3>
          <p>The Employee is entitled to annual leave, sick leave, and other benefits as per the Labour Relations Act and CCMA regulations.</p>

          <h3 style="color: #333; margin-top: 15px;">5. Termination</h3>
          <p>Either party may terminate this contract with 30 days' written notice, or as per applicable labour laws.</p>

          <h3 style="color: #333; margin-top: 15px;">6. Confidentiality</h3>
          <p>The Employee agrees to maintain confidentiality of all business information.</p>

          ${data.terms ? `<h3 style="color: #333; margin-top: 15px;">7. Additional Terms</h3><p>${data.terms}</p>` : ""}
        </div>

        <div class="signature-section">
          <div class="signature-block">
            <p><strong>Employer:</strong></p>
            <p>${data.businessName}</p>
            <div class="signature-line">Signature and Date</div>
          </div>
          <div class="signature-block">
            <p><strong>Employee:</strong></p>
            <p>${data.employeeName}</p>
            <div class="signature-line">Signature and Date</div>
          </div>
        </div>

        <div class="footer">
          <p>This contract was generated by MzansiBiz AI and complies with South African labour laws.</p>
          <p>For legal advice, please consult with a qualified employment attorney.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate an HTML business plan document
 */
export function generateBusinessPlanHTML(data: BusinessPlanData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Business Plan - ${data.businessName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          background: white;
          line-height: 1.8;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }
        .title-page {
          text-align: center;
          padding: 60px 20px;
          border-bottom: 3px solid #FF1493;
          margin-bottom: 40px;
        }
        .title-page h1 {
          color: #FF1493;
          font-size: 36px;
          margin: 0 0 10px 0;
        }
        .title-page p {
          color: #666;
          font-size: 16px;
        }
        h2 {
          color: #FF1493;
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 2px solid #00FFFF;
          padding-bottom: 10px;
        }
        .section {
          margin-bottom: 30px;
          background: #f9f9f9;
          padding: 15px;
          border-left: 3px solid #00FFFF;
        }
        .business-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-box {
          background: white;
          padding: 15px;
          border: 1px solid #ddd;
        }
        .info-box strong {
          color: #FF1493;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title-page">
          <h1>${data.businessName}</h1>
          <p>Business Plan</p>
          <p>Prepared by: ${data.ownerName}</p>
          <p>Date: ${new Date().toLocaleDateString('en-ZA')}</p>
        </div>

        <h2>1. Executive Summary</h2>
        <div class="section">
          <p>${data.executiveSummary}</p>
        </div>

        <h2>2. Business Information</h2>
        <div class="business-info">
          <div class="info-box">
            <strong>Business Name:</strong><br>${data.businessName}
          </div>
          <div class="info-box">
            <strong>Business Type:</strong><br>${data.businessType}
          </div>
          <div class="info-box">
            <strong>Owner:</strong><br>${data.ownerName}
          </div>
          <div class="info-box">
            <strong>Established:</strong><br>${new Date().getFullYear()}
          </div>
        </div>

        <h2>3. Market Analysis</h2>
        <div class="section">
          <p>${data.marketAnalysis}</p>
        </div>

        <h2>4. Marketing Strategy</h2>
        <div class="section">
          <p>${data.marketingStrategy}</p>
        </div>

        <h2>5. Financial Projections</h2>
        <div class="section">
          <p>${data.financialProjections}</p>
        </div>

        <div class="footer">
          <p>This business plan was generated by MzansiBiz AI.</p>
          <p>For professional business advice, please consult with a qualified business consultant.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Convert HTML to PDF and store in S3
 * Note: In production, this would use a service like Puppeteer or WeasyPrint
 * For now, we'll return the HTML as a downloadable document
 */
export async function generateAndStorePDF(
  html: string,
  fileName: string,
  userId: number
): Promise<{ url: string; key: string }> {
  try {
    // In production, convert HTML to PDF using Puppeteer or similar
    // For MVP, we'll store the HTML and let the browser handle PDF generation
    
    const pdfKey = `documents/${userId}/${fileName}-${Date.now()}.html`;
    const result = await storagePut(pdfKey, html, "text/html");
    
    console.log(`[PDF] Generated document: ${fileName}`);
    
    return {
      url: result.url,
      key: result.key,
    };
  } catch (error) {
    console.error('[PDF Error]', error);
    throw error;
  }
}
