import { jsPDF } from "jspdf";
import moment from "moment";

export function generateInvoicePDF(invoice) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(28, 28, 28);
  doc.text("INVOICE", 20, 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(invoice.invoice_number || "", 20, 32);

  // Gold accent line
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(1);
  doc.line(20, 38, 190, 38);

  // Bill to
  doc.setFontSize(11);
  doc.setTextColor(28, 28, 28);
  doc.text("Bill To:", 20, 50);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(invoice.lead_name || "—", 20, 57);

  // Meta info (right side)
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(`Due Date: ${invoice.due_date ? moment(invoice.due_date).format("MMM D, YYYY") : "—"}`, 190, 50, { align: "right" });
  doc.text(`Status: ${invoice.status || "Pending"}`, 190, 57, { align: "right" });
  if (invoice.property_reference) {
    doc.text(`Property: ${invoice.property_reference}`, 190, 64, { align: "right" });
  }

  // Line item table header
  let y = 80;
  doc.setFillColor(28, 28, 28);
  doc.rect(20, y - 6, 170, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("Description", 24, y);
  doc.text("Amount", 186, y, { align: "right" });

  // Line item row
  y += 12;
  doc.setTextColor(28, 28, 28);
  doc.text(invoice.description || "Service", 24, y);
  doc.text(`$${Number(invoice.amount || 0).toLocaleString()}`, 186, y, { align: "right" });

  // Total
  y += 15;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, y, 190, y);
  y += 10;
  doc.setFontSize(13);
  doc.setTextColor(201, 162, 39);
  doc.text("Total", 140, y);
  doc.text(`$${Number(invoice.amount || 0).toLocaleString()}`, 186, y, { align: "right" });

  if (invoice.status === "Paid" && invoice.payment_date) {
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(16, 150, 90);
    doc.text(`Paid on ${moment(invoice.payment_date).format("MMM D, YYYY")}`, 20, y);
  }

  doc.save(`${invoice.invoice_number || "invoice"}.pdf`);
}
