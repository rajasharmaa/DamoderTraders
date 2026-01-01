// pages/TermsConditions.tsx
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText, Scale, Shield, AlertTriangle, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';

const TermsConditions = () => {
  const effectiveDate = 'January 1, 2024';
  
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      content: 'By accessing and using Damodar Traders website and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.',
      points: [
        'You must be at least 18 years old or have legal authority to enter into contracts',
        'You agree to provide accurate and complete information',
        'You are responsible for maintaining the confidentiality of your account'
      ]
    },
    {
      title: 'Product Information & Pricing',
      icon: Scale,
      content: 'We strive to provide accurate product information and pricing. However, errors may occur.',
      points: [
        'Prices are subject to change without notice',
        'Product availability may vary',
        'We reserve the right to correct pricing errors',
        'Quotations are valid for 30 days from issue date'
      ]
    },
    {
      title: 'Ordering & Payment',
      icon: BookOpen,
      content: 'All orders are subject to acceptance and availability.',
      points: [
        'Orders are confirmed upon receipt of payment',
        'Payment must be received before shipment',
        'Accepted payment methods: Bank Transfer, Credit Card, UPI',
        'Taxes and shipping charges are additional'
      ]
    },
    {
      title: 'Shipping & Delivery',
      icon: Shield,
      content: 'Delivery times are estimates and may vary based on location and product availability.',
      points: [
        'Standard delivery: 3-7 business days',
        'Express delivery available at additional cost',
        'Risk of loss passes to buyer upon delivery',
        'International shipping available upon request'
      ]
    },
    {
      title: 'Returns & Refunds',
      icon: AlertTriangle,
      content: 'We accept returns under specific conditions.',
      points: [
        'Returns must be initiated within 7 days of delivery',
        'Products must be unused and in original packaging',
        'Custom or special-order items cannot be returned',
        'Refunds processed within 14 business days'
      ]
    },
    {
      title: 'Warranty & Liability',
      icon: XCircle,
      content: 'Our products come with standard warranties as specified.',
      points: [
        'Standard warranty: 1 year from date of purchase',
        'Warranty covers manufacturing defects only',
        'Proper installation and maintenance required',
        'Liability limited to product replacement or refund'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Terms & Conditions - Damodar Traders | Legal Agreement</title>
        <meta
          name="description"
          content="Terms and conditions for using Damodar Traders website and services. Read our legal agreement before making purchases."
        />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Legal Agreement
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms & <span className="text-blue-600">Conditions</span>
          </h1>
          
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Please read these terms carefully before using our website or placing an order.
            These terms govern your use of Damodar Traders services.
          </p>
          
          <div className="mt-6 text-sm text-gray-500">
            Effective Date: {effectiveDate}
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 mb-8 border border-red-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Notice</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions constitute a legally binding agreement between you
                and Damodar Traders. By accessing our website, placing an order, or using our
                services, you acknowledge that you have read, understood, and agree to be bound
                by these terms.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900">{section.title}</h3>
                      <p className="text-gray-700 mt-2">{section.content}</p>
                    </div>
                  </div>
                  
                  {section.points && (
                    <ul className="space-y-3 ml-14">
                      {section.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Clauses */}
        <motion.div
          className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Additional Legal Clauses</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Intellectual Property</h4>
              <p className="text-gray-700">
                All content on this website, including text, graphics, logos, and images,
                is the property of Damodar Traders and protected by intellectual property laws.
                You may not reproduce, distribute, or modify any content without our written permission.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Governing Law</h4>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of India.
                Any disputes arising from these Terms shall be subject to the exclusive jurisdiction
                of the courts in Indore, Madhya Pradesh.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Force Majeure</h4>
              <p className="text-gray-700">
                We shall not be liable for any failure or delay in performance due to circumstances
                beyond our reasonable control, including natural disasters, government actions,
                or supply chain disruptions.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Amendments</h4>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Changes will be effective
                immediately upon posting on our website. Your continued use of our services
                constitutes acceptance of the modified Terms.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact for Clarification */}
        <motion.div
          className="mt-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 text-center border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Clarification?</h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            If you have any questions about these Terms & Conditions or need clarification
            on any points, please don't hesitate to contact our legal team.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:legal@damodartraders.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-5 h-5" />
              Contact Legal Department
            </a>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Customer Support
            </a>
          </div>
        </motion.div>

        {/* Acceptance Section */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-gray-700 text-lg mb-6">
            By using our website and services, you acknowledge that you have read,
            understood, and agree to be bound by these Terms & Conditions.
          </p>
          
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Last updated: {effectiveDate}
          </div>
        </motion.div>
      </main>

      <Footer />
    </>
  );
};

export default TermsConditions;