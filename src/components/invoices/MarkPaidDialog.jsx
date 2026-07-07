import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";

export default function MarkPaidDialog({ open, onOpenChange, invoice, onConfirm }) {
  const [paymentDate, setPaymentDate] = useState(moment().format("YYYY-MM-DD"));

  const handleConfirm = async () => {
    await onConfirm(invoice.id, paymentDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Mark as Paid</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-gray-600">
            Confirm payment for <span className="font-semibold">{invoice?.invoice_number}</span> (${Number(invoice?.amount || 0).toLocaleString()})
          </p>
          <div>
            <Label>Payment Date</Label>
            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
          </div>
          <Button onClick={handleConfirm} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            Confirm Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
