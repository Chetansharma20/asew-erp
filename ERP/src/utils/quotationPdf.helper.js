import PDFDocument from "pdfkit";

/**
 * Generate a professional quotation PDF
 * @param {Object} quotation - Populated quotation object
 * @returns {Promise<Buffer>} - PDF as a buffer
 */
export const generateQuotationPdf = (quotation) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 50 });
            const buffers = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);

            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            // ─── HEADER ───
            doc.fontSize(22).font("Helvetica-Bold").fillColor("#1a1a2e")
                .text("QUOTATION", { align: "center" });
            doc.moveDown(0.3);
            doc.fontSize(9).font("Helvetica").fillColor("#666")
                .text("Thank you for your interest. Please find your quotation details below.", { align: "center" });
            doc.moveDown(0.8);

            // ─── DIVIDER ───
            doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y)
                .strokeColor("#e0e0e0").lineWidth(1).stroke();
            doc.moveDown(0.8);

            // ─── QUOTATION INFO & CUSTOMER INFO (side by side) ───
            const infoY = doc.y;

            // Left column — Quotation details
            doc.fontSize(8).font("Helvetica-Bold").fillColor("#999")
                .text("QUOTATION DETAILS", 50, infoY);
            doc.moveDown(0.3);

            const leftX = 50;
            let y = doc.y;
            const labelValuePairs = [
                ["Quotation No", quotation.quotationNo],
                ["Date", new Date(quotation.quotationDate).toLocaleDateString("en-IN")],
                ["Valid Till", new Date(quotation.validTill).toLocaleDateString("en-IN")],
                ["Sales Person", quotation.salesPersonId?.name || "N/A"]
            ];

            labelValuePairs.forEach(([label, value]) => {
                doc.fontSize(9).font("Helvetica-Bold").fillColor("#333")
                    .text(`${label}:`, leftX, y, { continued: true })
                    .font("Helvetica").fillColor("#555")
                    .text(`  ${value}`);
                y = doc.y + 2;
            });

            // Right column — Customer details
            const rightX = 300;
            doc.fontSize(8).font("Helvetica-Bold").fillColor("#999")
                .text("BILL TO", rightX, infoY);

            const customer = quotation.leadId?.customer || {};
            let ry = infoY + 14;
            doc.fontSize(10).font("Helvetica-Bold").fillColor("#1a1a2e")
                .text(customer.name || "N/A", rightX, ry);
            ry = doc.y + 2;

            if (customer.contactPerson) {
                doc.fontSize(9).font("Helvetica").fillColor("#555")
                    .text(customer.contactPerson, rightX, ry);
                ry = doc.y + 2;
            }
            if (customer.email) {
                doc.fontSize(9).font("Helvetica").fillColor("#555")
                    .text(customer.email, rightX, ry);
                ry = doc.y + 2;
            }
            if (customer.contact) {
                doc.fontSize(9).font("Helvetica").fillColor("#555")
                    .text(customer.contact, rightX, ry);
                ry = doc.y + 2;
            }

            doc.y = Math.max(y, ry) + 15;

            // ─── DIVIDER ───
            doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y)
                .strokeColor("#e0e0e0").lineWidth(1).stroke();
            doc.moveDown(0.8);

            // ─── ITEMS TABLE ───
            const colWidths = {
                sno: 30,
                item: pageWidth - 30 - 60 - 80 - 80,
                qty: 60,
                unitPrice: 80,
                total: 80
            };

            // Table header
            const tableHeaderY = doc.y;
            doc.rect(50, tableHeaderY, pageWidth, 22).fill("#1a1a2e");

            doc.fontSize(8).font("Helvetica-Bold").fillColor("#fff");
            let hx = 50;
            doc.text("#", hx + 4, tableHeaderY + 6, { width: colWidths.sno, align: "center" });
            hx += colWidths.sno;
            doc.text("ITEM", hx + 4, tableHeaderY + 6, { width: colWidths.item });
            hx += colWidths.item;
            doc.text("QTY", hx + 4, tableHeaderY + 6, { width: colWidths.qty, align: "center" });
            hx += colWidths.qty;
            doc.text("UNIT PRICE", hx + 4, tableHeaderY + 6, { width: colWidths.unitPrice, align: "right" });
            hx += colWidths.unitPrice;
            doc.text("TOTAL", hx + 4, tableHeaderY + 6, { width: colWidths.total, align: "right" });

            doc.y = tableHeaderY + 22;

            // Table rows
            const items = quotation.quotationItems || [];
            items.forEach((item, index) => {
                const rowY = doc.y;
                const bgColor = index % 2 === 0 ? "#f9f9fb" : "#ffffff";
                doc.rect(50, rowY, pageWidth, 20).fill(bgColor);

                doc.fontSize(9).font("Helvetica").fillColor("#333");
                let rx = 50;
                doc.text(`${index + 1}`, rx + 4, rowY + 5, { width: colWidths.sno, align: "center" });
                rx += colWidths.sno;
                doc.text(item.itemId?.name || "Unknown Item", rx + 4, rowY + 5, { width: colWidths.item });
                rx += colWidths.item;
                doc.text(`${item.quantity}`, rx + 4, rowY + 5, { width: colWidths.qty, align: "center" });
                rx += colWidths.qty;
                doc.text(`Rs.${item.UnitPrice.toFixed(2)}`, rx + 4, rowY + 5, { width: colWidths.unitPrice, align: "right" });
                rx += colWidths.unitPrice;
                doc.font("Helvetica-Bold")
                    .text(`Rs.${item.Total.toFixed(2)}`, rx + 4, rowY + 5, { width: colWidths.total, align: "right" });

                doc.y = rowY + 20;
            });

            // Bottom border of table
            doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y)
                .strokeColor("#e0e0e0").lineWidth(0.5).stroke();
            doc.moveDown(0.5);

            // ─── TOTALS SECTION (right-aligned) ───
            const totalsX = 50 + pageWidth - 200;
            const totalsWidth = 200;

            // Subtotal
            const subtotal = items.reduce((sum, i) => sum + (i.Total || 0), 0);
            drawTotalLine(doc, "Subtotal", `Rs.${subtotal.toFixed(2)}`, totalsX, totalsWidth);

            // Additional charges
            if (quotation.additionalCharges && quotation.additionalCharges.length > 0) {
                quotation.additionalCharges.forEach((charge) => {
                    drawTotalLine(doc, charge.title || "Additional Charge", `Rs.${(charge.amount || 0).toFixed(2)}`, totalsX, totalsWidth);
                });
            }

            // Discount
            if (quotation.discount && quotation.discount.amount > 0) {
                const discLabel = quotation.discount.type === "Percentage"
                    ? `Discount (${quotation.discount.value}%)`
                    : "Discount";
                drawTotalLine(doc, discLabel, `-Rs.${quotation.discount.amount.toFixed(2)}`, totalsX, totalsWidth, "#e74c3c");
            }

            // Tax
            if (quotation.tax && quotation.tax.amount > 0) {
                const taxLabel = `${quotation.tax.type || "Tax"} (${quotation.tax.percentage}%)`;
                drawTotalLine(doc, taxLabel, `Rs.${quotation.tax.amount.toFixed(2)}`, totalsX, totalsWidth);
            }

            // Grand Total
            doc.moveDown(0.3);
            doc.moveTo(totalsX, doc.y).lineTo(totalsX + totalsWidth, doc.y)
                .strokeColor("#1a1a2e").lineWidth(1).stroke();
            doc.moveDown(0.3);

            const gtY = doc.y;
            doc.rect(totalsX, gtY, totalsWidth, 24).fill("#1a1a2e");
            doc.fontSize(10).font("Helvetica-Bold").fillColor("#fff")
                .text("GRAND TOTAL", totalsX + 6, gtY + 6, { width: totalsWidth / 2 - 6 })
                .text(`Rs.${(quotation.totalAmount || 0).toFixed(2)}`, totalsX + totalsWidth / 2, gtY + 6, { width: totalsWidth / 2 - 6, align: "right" });
            doc.y = gtY + 30;

            // ─── NOTES ───
            if (quotation.notes) {
                doc.moveDown(1);
                doc.fontSize(8).font("Helvetica-Bold").fillColor("#999")
                    .text("NOTES");
                doc.moveDown(0.3);
                doc.fontSize(9).font("Helvetica").fillColor("#555")
                    .text(quotation.notes, { width: pageWidth });
            }

            // ─── FOOTER ───
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(50 + pageWidth, doc.y)
                .strokeColor("#e0e0e0").lineWidth(0.5).stroke();
            doc.moveDown(0.5);
            doc.fontSize(8).font("Helvetica").fillColor("#999")
                .text("This is a computer-generated quotation. Prices are valid until the date mentioned above.", { align: "center" });
            doc.moveDown(0.3);
            doc.fontSize(8).font("Helvetica-Bold").fillColor("#1a1a2e")
                .text("Thank you for your business!", { align: "center" });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Helper to draw a totals line
 */
function drawTotalLine(doc, label, value, x, width, valueColor = "#333") {
    const y = doc.y;
    doc.fontSize(9).font("Helvetica").fillColor("#666")
        .text(label, x + 6, y, { width: width / 2 - 6 });
    doc.fontSize(9).font("Helvetica-Bold").fillColor(valueColor)
        .text(value, x + width / 2, y, { width: width / 2 - 6, align: "right" });
    doc.y = y + 16;
}
