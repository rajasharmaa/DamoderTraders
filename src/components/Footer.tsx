import { Link } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin, 
  Shield, Truck, Award, HeadphonesIcon, CreditCard, Building, Globe, 
  Mailbox, ChevronRight, CheckCircle, Star, Send, ArrowRight,
  ShieldCheck, Package, Users, TrendingUp, Smartphone, Download,
  FileText, HelpCircle, Award as AwardIcon, Calendar, TrendingUp as TrendingUpIcon
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/categories' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms & Conditions', path: '/terms-conditions' },
  ];

  const productLinks = [
    { name: 'Pipes & Tubes', path: '/products?category=pipes' },
    { name: 'Industrial Fittings', path: '/products?category=fittings' },
    { name: 'Valves & Controls', path: '/products?category=valves' },
    { name: 'Flanges & Gaskets', path: '/products?category=flanges' },
    { name: 'Pipe Supports', path: '/products?category=supports' },
    { name: 'Industrial Tools', path: '/products?category=tools' },
  ];

  const resources = [
    { name: 'Product Catalog', path: '/catalog', icon: Download },
    { name: 'Technical Specifications', path: '/specs', icon: FileText },
    { name: 'Installation Guides', path: '/guides', icon: ShieldCheck },
    { name: 'FAQs & Support', path: '/faq', icon: HelpCircle },
  ];

  const companyInfo = [
    { name: 'Our Certifications', path: '/certifications', icon: AwardIcon },
    { name: 'Career Opportunities', path: '/careers', icon: Users },
    { name: 'Industry Updates', path: '/blog', icon: TrendingUpIcon },
    { name: 'Events & Exhibitions', path: '/events', icon: Calendar },
  ];

  const contactInfo = [
    {
      icon: MapPin,
      text: '1st floor, 37 Ellora plaza, 3, Maharani Rd, Indore, Madhya Pradesh 452007',
    },
    { icon: Phone, text: '+91 9876543210' },
    { icon: Mail, text: 'info@damodartraders.com' },
    { icon: Clock, text: 'Mon-Fri: 9:00 AM - 6:00 PM | Sat: 10:00 AM - 4:00 PM' },
    { icon: Globe, text: 'www.damodartraders.com' },
  ];

  const features = [
    { icon: ShieldCheck, text: 'ISO 9001 Certified', color: 'bg-emerald-50 text-emerald-700' },
    { icon: Award, text: 'Industry Leader', color: 'bg-amber-50 text-amber-700' },
    { icon: Truck, text: 'Fast Delivery', color: 'bg-blue-50 text-blue-700' },
    { icon: HeadphonesIcon, text: '24/7 Support', color: 'bg-purple-50 text-purple-700' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-[#1877F2]' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-[#1DA1F2]' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-[#0A66C2]' },
  ];

  return (
    <footer className="bg-white relative overflow-hidden">
      {/* Modern Gradient Top Border */}
      <div className="h-1 w-full bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900"></div>
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`${feature.color} p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">{feature.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Company Info - 5 columns */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl transform rotate-6"></div>
                <div className="relative p-4 bg-white rounded-2xl border border-gray-200 shadow-lg">
                  <img
                    src="/logo.png"
                    alt="Damodar Traders Logo"
                    className="w-40 h-auto"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/160x60/111827/ffffff?text=DT+Industries';
                    }}
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Damodar Traders
                </h1>
                <p className="text-gray-600 font-medium text-sm">Industrial Excellence Since 2011</p>
              </div>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-8 text-base">
              Pioneering industrial solutions with precision engineering and unwavering commitment 
              to quality. We deliver superior pipe fittings and components across India, 
              empowering industries to build with confidence.
            </p>

            {/* Quick Contact Button */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <HeadphonesIcon className="w-5 h-5 text-gray-900" />
                  <h4 className="text-gray-900 font-semibold">Need Quick Assistance?</h4>
                </div>
                <div className="space-y-3">
                  <a 
                    href="tel:+919876543210"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3 rounded-lg font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now: +91 9876543210
                  </a>
                  <a 
                    href="mailto:info@damodartraders.com"
                    className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                  >
                    <Mail className="w-4 h-4" />
                    Email Us
                  </a>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-gray-700">Trusted by 1500+ Industrial Clients</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Pan-India Delivery Network</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-gray-700">12+ Years of Excellence</span>
              </div>
            </div>
          </div>

          {/* Links Grid - 7 columns */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Quick Links */}
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  {quickLinks.map((link) => (
                    <li key={link.path}>
                      <Link 
                        to={link.path} 
                        className="group flex items-center text-gray-700 hover:text-gray-900 transition-all duration-300"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-900 transition-colors duration-300"></div>
                        <span className="group-hover:font-medium transition-all duration-300 text-sm">{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                  Our Products
                </h3>
                <ul className="space-y-3">
                  {productLinks.map((link) => (
                    <li key={link.path}>
                      <Link 
                        to={link.path} 
                        className="group flex items-center text-gray-700 hover:text-gray-900 transition-all duration-300"
                      >
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 group-hover:bg-gray-900 transition-colors duration-300"></div>
                        <span className="group-hover:font-medium transition-all duration-300 text-sm">{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                  Resources
                </h3>
                <ul className="space-y-3">
                  {resources.map((resource) => (
                    <li key={resource.path}>
                      <Link 
                        to={resource.path} 
                        className="group flex items-center text-gray-700 hover:text-gray-900 transition-all duration-300"
                      >
                        <div className="p-1.5 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors duration-300">
                          <resource.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="group-hover:font-medium transition-all duration-300 text-sm">{resource.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-gray-900 to-gray-700 rounded-full"></div>
                  Company
                </h3>
                <ul className="space-y-3">
                  {companyInfo.map((item) => (
                    <li key={item.path}>
                      <Link 
                        to={item.path} 
                        className="group flex items-center text-gray-700 hover:text-gray-900 transition-all duration-300"
                      >
                        <div className="p-1.5 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors duration-300">
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="group-hover:font-medium transition-all duration-300 text-sm">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-gray-900 font-bold text-lg mb-6 flex items-center gap-2">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contactInfo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm flex-shrink-0">
                      <item.icon className="w-4 h-4 text-gray-900" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Social Media */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-gray-900 font-bold">Follow Us:</span>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`p-3 bg-gray-100 rounded-xl text-gray-700 transition-all duration-300 hover:text-white hover:scale-105 shadow-sm ${social.color}`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-gray-700 font-medium">ISO 9001:2015</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-700 font-medium">Pan-India Delivery</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-gray-700 font-medium">Industry Awards</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-gray-900 font-semibold text-sm">
                © {new Date().getFullYear()} Damodar Traders Industries
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Registered Under Companies Act | GST: 23ABCDE1234F1Z5
                <span className="block lg:inline lg:ml-3">All Rights Reserved</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Live Support Available</span>
            </div>
            <span className="text-gray-300 text-sm">🚚 Same-Day Dispatch • 📞 24/7 Support • 🔒 Secure Transactions</span>
            <span className="text-emerald-300 text-sm font-medium">★★★★★ 4.9/5 (Based on 1200+ Reviews)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;