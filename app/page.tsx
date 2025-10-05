'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PackageSearch, QrCode, ArrowRight, CircleCheck as CheckCircle, ChartBar as BarChart3, MapPin, TriangleAlert as AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LandingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('leads').insert({
      name,
      email,
      company,
      message,
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to submit. Please try again.');
    } else {
      setSubmitted(true);
      toast.success('Thank you! We will be in touch soon.');
      setName('');
      setEmail('');
      setCompany('');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold">InventoryQR</span>
          </div>
          <Link href="/app">
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
              Open App
            </Button>
          </Link>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Inventory Management
              <br />
              Powered by QR Codes
            </h1>
            <p className="text-xl sm:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Track every item, scan to move stock, manage locations with precision. Real-time alerts keep you ahead of shortages and expirations.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/app">
                <Button size="lg" className="bg-cyan-400 text-black hover:bg-cyan-500">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-gray-700" onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400">Everything you need to manage inventory at scale</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <QrCode className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle>QR Code Labels</CardTitle>
                <CardDescription className="text-gray-400">
                  Generate and print QR labels for items and stock lots. Scan to instantly access details and perform actions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <MapPin className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle>Location Tracking</CardTitle>
                <CardDescription className="text-gray-400">
                  Organize inventory with warehouse, aisle, rack, and bin hierarchy. Transfer stock with ease.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <AlertTriangle className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle>Smart Alerts</CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time notifications for low stock, near-expiry items, and negative balance prevention.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle>Stock Movements</CardTitle>
                <CardDescription className="text-gray-400">
                  Track every receive, pick, transfer, and adjustment with complete audit trail and timestamps.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription className="text-gray-400">
                  On-hand valuation, movement ledgers, and CSV exports for deeper analysis.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-cyan-400 mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription className="text-gray-400">
                  Admin and staff roles with protected routes and secure authentication.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Simple workflow, powerful results</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Add Items', desc: 'Create items with SKU, name, and minimum stock levels' },
              { step: '2', title: 'Generate QR Codes', desc: 'Print labels for items and stock lots' },
              { step: '3', title: 'Scan & Move', desc: 'Use camera to scan and perform receive/pick/transfer' },
              { step: '4', title: 'Track & Report', desc: 'View real-time inventory and export data' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-cyan-400 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gray-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Get Started Today</h2>
            <p className="text-xl text-gray-400">Fill out the form and our team will reach out</p>
          </div>

          {submitted ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-gray-400">We received your message and will be in touch soon.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Company Name (Optional)"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Tell us about your needs (Optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-cyan-400 text-black hover:bg-cyan-500">
                    {loading ? 'Submitting...' : 'Submit'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <PackageSearch className="h-6 w-6 text-cyan-400" />
              <span className="font-bold">InventoryQR</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 InventoryQR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
