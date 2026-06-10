'use client';

import { useState } from 'react';

interface PaystackGiftProps {
  publicKey: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => { openIframe: () => void };
    };
  }
}

export function PaystackGift({ publicKey }: PaystackGiftProps) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('10000');
  const [loading, setLoading] = useState(false);

  const suggestedAmounts = ['5000', '10000', '20000', '50000'];

  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack'));
      document.body.appendChild(script);
    });
  };

  const handleOpenPaystack = async () => {
    if (!email || !amount) {
      alert('Please enter your email and amount.');
      return;
    }

    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount < 100) {
      alert('Please enter a valid amount (minimum ₦100).');
      return;
    }

    setLoading(true);

    try {
      await loadPaystackScript();

      if (!window.PaystackPop) {
        throw new Error('Paystack failed to initialize');
      }

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email.trim(),
        amount: numericAmount * 100, // convert to kobo
        currency: 'NGN',
        ref: `gift_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
        label: 'Monetary Gift',
        onClose: () => {
          setLoading(false);
        },
        callback: (response: any) => {
          setLoading(false);
          // In a real implementation we would verify this on the server
          alert(`Thank you! Payment reference: ${response.reference}`);
          setShowForm(false);
          setEmail('');
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error(err);
      alert('Unable to open Paystack at the moment. Please try again later or use the bank details.');
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="btn w-full"
        disabled={loading}
      >
        Send Gift via Paystack
      </button>
    );
  }

  return (
    <div className="card text-left space-y-3">
      <div className="text-sm font-medium">Send a gift via Paystack</div>

      <div>
        <label className="block text-xs mb-1 text-[#f5f0e6]/70">Your Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full"
          required
        />
      </div>

      <div>
        <label className="block text-xs mb-1 text-[#f5f0e6]/70">Amount (₦)</label>
        <div className="flex gap-2 mb-2">
          {suggestedAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              className={`px-3 py-1 text-xs rounded border ${amount === amt ? 'border-[#C5A26F] bg-[#C5A26F]/10' : 'border-[#2a2a2a] hover:border-[#C5A26F]/50'}`}
            >
              ₦{parseInt(amt).toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="100"
          step="100"
          className="w-full"
          required
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => {
            setShowForm(false);
            setEmail('');
          }}
          className="btn-outline flex-1 text-sm py-2"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleOpenPaystack}
          className="btn flex-1 text-sm py-2"
          disabled={loading || !email || !amount}
        >
          {loading ? 'Opening...' : 'Proceed to Pay'}
        </button>
      </div>

      <p className="text-[10px] text-[#f5f0e6]/50">
        You will be redirected to Paystack to complete payment securely.
      </p>
    </div>
  );
}
