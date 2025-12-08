
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Printer, Check } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { formatCurrency, type Payment } from '@/lib/types/payments';

interface InvoiceGeneratorProps {
  payment: Payment;
  onClose?: () => void;
}

export function InvoiceGenerator({ payment, onClose }: InvoiceGeneratorProps) {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Company Name',
    address: '123 Business Street',
    city: 'City, State 12345',
    email: 'billing@yourcompany.com',
    phone: '+1 (555) 123-4567',
    website: 'www.yourcompany.com',
  });

  const [customerInfo, setCustomerInfo] = useState({
    name: 'Customer Name',
    email: 'customer@example.com',
    address: '',
  });

  const [invoiceNumber] = useState(() => `INV-${format(new Date(), 'yyyyMMdd')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  const [generatedPDF, setGeneratedPDF] = useState(false);

  const generatePDF = () => {
    const doc = new jsPDF();

    const primaryColor: [number, number, number] = [251, 124, 28];
    const darkGray: [number, number, number] = [64, 64, 64];
    const lightGray: [number, number, number] = [245, 245, 245];

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo.name, 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(companyInfo.website, 20, 28);

    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 150, 25);

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    const detailsY = 50;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Number:', 140, detailsY);
    doc.text('Date:', 140, detailsY + 7);
    doc.text('Status:', 140, detailsY + 14);

    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, 180, detailsY);
    doc.text(
      payment.paid_at ? format(new Date(payment.paid_at), 'MMM dd, yyyy') : format(new Date(), 'MMM dd, yyyy'),
      180,
      detailsY + 7
    );

    const statusColor = payment.status === 'succeeded' ? [16, 185, 129] : [239, 68, 68];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(178, detailsY + 10, 22, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(payment.status.toUpperCase(), 180, detailsY + 14);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(10);

    const fromY = detailsY;
    doc.setFont('helvetica', 'bold');
    doc.text('From:', 20, fromY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(companyInfo.name, 20, fromY + 7);
    doc.text(companyInfo.address, 20, fromY + 12);
    doc.text(companyInfo.city, 20, fromY + 17);
    doc.text(companyInfo.email, 20, fromY + 22);
    doc.text(companyInfo.phone, 20, fromY + 27);

    const billToY = fromY + 40;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, billToY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(customerInfo.name, 20, billToY + 7);
    doc.text(customerInfo.email, 20, billToY + 12);
    if (customerInfo.address) {
      doc.text(customerInfo.address, 20, billToY + 17);
    }

    const tableY = billToY + 30;

    autoTable(doc, {
      startY: tableY,
      head: [['Description', 'Project', 'Amount']],
      body: [
        [
          payment.description || 'Payment',
          payment.project_name || 'N/A',
          formatCurrency(payment.amount, payment.currency),
        ],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: darkGray,
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: 20, right: 20 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(130, finalY, 60, 20, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', 135, finalY + 7);
    doc.text('Tax:', 135, finalY + 14);

    doc.setFontSize(12);
    doc.text('TOTAL:', 135, finalY + 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(formatCurrency(payment.amount, payment.currency), 180, finalY + 7, { align: 'right' });
    doc.text('$0.00', 180, finalY + 14, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(formatCurrency(payment.amount, payment.currency), 180, finalY + 25, {
      align: 'right',
    });

    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', 105, 270, { align: 'center' });
    doc.text(
      `Payment Method: ${payment.payment_method || 'Card'} | Transaction ID: ${payment.stripe_payment_intent_id || payment.id}`,
      105,
      275,
      { align: 'center' }
    );

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);

    doc.save(`invoice-${invoiceNumber}.pdf`);
    setGeneratedPDF(true);

    setTimeout(() => setGeneratedPDF(false), 3000);
  };

  const printInvoice = () => {
    generatePDF();
    window.print();
  };

  return (
    <Card className="border-orange-100 shadow-sm rounded-2xl bg-white">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3
              className="text-xl font-semibold text-neutral-900 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Generate Invoice
            </h3>
            <p className="text-sm text-neutral-500 font-light">
              Create a professional PDF invoice
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-neutral-900">Company Information</h4>
            <div className="space-y-3">
              <Input
                placeholder="Company Name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className="bg-neutral-50 border-neutral-100"
              />
              <Input
                placeholder="Address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                className="bg-neutral-50 border-neutral-100"
              />
              <Input
                placeholder="City, State ZIP"
                value={companyInfo.city}
                onChange={(e) => setCompanyInfo({ ...companyInfo, city: e.target.value })}
                className="bg-neutral-50 border-neutral-100"
              />
              <Input
                placeholder="Email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                className="bg-neutral-50 border-neutral-100"
              />
              <Input
                placeholder="Phone"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                className="bg-neutral-50 border-neutral-100"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-neutral-900">Customer Information</h4>
            <div className="space-y-3">
              <Input
                placeholder="Customer Name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="bg-neutral-50 border-neutral-100"
              />
              <Input
                placeholder="Customer Email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="bg-neutral-50 border-neutral-100"
              />
              <Input
                placeholder="Customer Address (optional)"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="bg-neutral-50 border-neutral-100"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-6 mb-6">
          <h4 className="text-sm font-medium text-neutral-900 mb-4">Invoice Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">Invoice Number:</span>
              <span className="ml-2 font-medium text-neutral-900">{invoiceNumber}</span>
            </div>
            <div>
              <span className="text-neutral-500">Date:</span>
              <span className="ml-2 font-medium text-neutral-900">
                {payment.paid_at
                  ? format(new Date(payment.paid_at), 'MMM dd, yyyy')
                  : format(new Date(), 'MMM dd, yyyy')}
              </span>
            </div>
            <div>
              <span className="text-neutral-500">Project:</span>
              <span className="ml-2 font-medium text-neutral-900">
                {payment.project_name || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-neutral-500">Amount:</span>
              <span className="ml-2 font-semibold text-orange-600">
                {formatCurrency(payment.amount, payment.currency)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-neutral-500">Description:</span>
              <span className="ml-2 font-medium text-neutral-900">
                {payment.description || 'Payment'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={generatePDF}
            className="flex-1 gap-2 bg-neutral-900 text-white hover:bg-black transition-all duration-300"
            disabled={generatedPDF}
          >
            {generatedPDF ? (
              <>
                <Check className="w-4 h-4" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </Button>
          <Button
            onClick={printInvoice}
            variant="outline"
            className="gap-2 hover:bg-orange-50 transition-all duration-300"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="hover:bg-neutral-50 transition-all duration-300"
            >
              Close
            </Button>
          )}
        </div>

        {generatedPDF && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-light"
          >
            <Check className="w-4 h-4 inline mr-2" />
            Invoice generated successfully!
          </motion.div>
        )}
      </div>
    </Card>
  );
}
