import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Target, Eye, Medal, Handshake, Shield, 
  Building, Award, Users, Clock, TrendingUp, MapPin,
  Star, CheckCircle, ArrowRight, ChevronRight, Globe,
  Factory, Truck, Package, HeadphonesIcon, Sparkles,
  Mail, Calendar, Target as TargetIcon, 
  Award as AwardIcon, Users as UsersIcon, Building as BuildingIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';

const About = () => {
  const values = [
    {
      icon: Medal,
      title: 'Quality Excellence',
      description: 'Every product undergoes rigorous testing to ensure it meets international standards and exceeds customer expectations.',
      color: 'from-amber-500 to-yellow-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Handshake,
      title: 'Customer Commitment',
      description: 'Building lasting partnerships through exceptional service, personalized solutions, and unwavering support.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Shield,
      title: 'Integrity First',
      description: 'Operating with complete transparency, ethical practices, and honesty in every business interaction.',
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: TrendingUp,
      title: 'Innovation Driven',
      description: 'Continuously evolving our product range and services to meet the dynamic needs of modern industries.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Fostering a culture of teamwork, knowledge sharing, and mutual growth among our employees.',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
    },
    {
      icon: Globe,
      title: 'Sustainable Growth',
      description: 'Committed to environmentally responsible practices and sustainable business development.',
      color: 'from-teal-500 to-emerald-500',
      bgColor: 'bg-teal-50',
    },
  ];

  const stats = [
    { icon: Clock, value: '12+', label: 'Years of Excellence', suffix: 'Years' },
    { icon: Users, value: '1500+', label: 'Satisfied Clients', suffix: 'Clients' },
    { icon: Package, value: '5000+', label: 'Products Range', suffix: 'Products' },
    { icon: MapPin, value: 'Pan-India', label: 'Service Coverage', suffix: 'Delivery' },
    { icon: Award, value: '25+', label: 'Industry Awards', suffix: 'Awards' },
    { icon: Truck, value: '98%', label: 'On-Time Delivery', suffix: 'Rate' },
  ];

  const milestones = [
    { year: '2011', title: 'Foundation', description: 'Started operations in Indore with a small warehouse' },
    { year: '2014', title: 'Expansion', description: 'Expanded product range to include industrial valves' },
    { year: '2017', title: 'Growth', description: 'Established Pan-India distribution network' },
    { year: '2020', title: 'Digital Shift', description: 'Launched e-commerce platform and digital services' },
    { year: '2023', title: 'Excellence', description: 'Awarded "Best Industrial Supplier" by Manufacturing Association' },
  ];

  return (
    <>
      <Helmet>
        <title>About Us - Damodar Traders | Leading Industrial Solutions Provider</title>
        <meta
          name="description"
          content="Discover Damodar Traders' journey since 2011. Leading manufacturers of quality pipe fittings, valves, and industrial solutions. ISO certified with 1500+ satisfied clients."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 overflow-x-hidden">
        {/* Hero Section - Mobile Optimized */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-16 pb-20 lg:py-32">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Established 2011</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 sm:mb-6 px-2">
                Building <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Industrial</span> Excellence
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-10 px-2">
                For over a decade, we've been at the forefront of industrial solutions, 
                delivering quality and innovation across India.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
                <Link 
                  to="/products"
                  className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Explore Our Products <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link 
                  to="/contact"
                  className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm rounded-lg font-semibold text-sm sm:text-base hover:bg-white/20 transition-all duration-300 text-center"
                >
                  Contact Our Team
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section - Mobile Optimized */}
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="text-center p-3 sm:p-4 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                    <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg sm:rounded-xl">
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium leading-tight">{stat.label}</div>
                  {stat.suffix && <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">{stat.suffix}</div>}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Story Section - Mobile Optimized with Google 3D View */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center"
            >
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm mb-3 sm:mb-4">
                  <div className="w-6 sm:w-8 md:w-12 h-0.5 bg-blue-600"></div>
                  OUR JOURNEY
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Pioneering Industrial Solutions <span className="text-blue-600">Since 2011</span>
                </h2>
                <div className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                  <p>
                    What began as a modest family enterprise in the heart of Indore has evolved into 
                    one of Central India's most trusted industrial suppliers.
                  </p>
                  <p>
                    Founded by <span className="font-semibold text-gray-900">Damodar Prasad Sharma</span>, 
                    our company started with a simple yet powerful vision: to deliver uncompromising quality 
                    in industrial fittings and valves.
                  </p>
                  <p>
                    Our growth is built on the pillars of quality, reliability, and customer satisfaction. 
                    Today, we serve clients across India, from small workshops to major industrial 
                    conglomerates.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    <span className="font-medium text-gray-900 text-sm sm:text-base">ISO 9001 Certified</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    <span className="font-medium text-gray-900 text-sm sm:text-base">1500+ Happy Clients</span>
                  </div>
                </div>
              </div>
              
              <div className="relative order-1 lg:order-2 w-full">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
                  {/* Google 3D Photosphere View */}
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m0!4v1704123456789!6m8!1m7!1sCAoSFENJSE0wb2dLRUlDQWdJRFNuWjQw!2m2!1d22.7195687!2d75.8577258!3f106.0!4f0!5f0.7820865974627469"
                    title="Damodar Traders 3D View"
                    className="w-full h-48 sm:h-64 md:h-80 lg:h-96 border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      <Factory className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-semibold text-sm sm:text-base">3D View - Our Facility</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">12+</div>
                  <div className="text-xs sm:text-sm font-medium">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values Section - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12 md:mb-16 px-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our <span className="text-blue-600">Core Values</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide our decisions, actions, and relationships
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`${value.bgColor} p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-gray-200 hover:border-transparent hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 group`}
                >
                  <div className={`inline-flex p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r ${value.color} mb-3 sm:mb-4 md:mb-6 group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{value.description}</p>
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200/50 flex items-center justify-between">
                    <Link 
                      to="/about#values" 
                      className="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Learn More
                    </Link>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute -top-3 -left-3 sm:-top-6 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Our Mission</h3>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
                    To revolutionize industrial procurement by delivering superior quality products, 
                    innovative solutions, and exceptional service that empowers businesses to thrive.
                  </p>
                  <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 border-t border-white/20">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <span className="text-blue-300 font-medium text-sm sm:text-base">5000+ Quality Products</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-purple-500/20 rounded-full blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl">
                      <Eye className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Our Vision</h3>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
                    To become India's leading industrial solutions provider, recognized globally for 
                    innovation, quality, and sustainable practices.
                  </p>
                  <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 border-t border-white/20">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
                      <span className="text-purple-300 font-medium text-sm sm:text-base">National & Global Expansion</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founder Profile Section - Only Damodar Sharma */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12 md:mb-16 px-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our <span className="text-blue-600">Founder & Visionary</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                The driving force behind our success and growth
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col lg:flex-row gap-8 sm:gap-10 items-center">
                {/* Founder Image */}
                <div className="relative lg:w-2/5">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    {/* Frame Effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                    
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl">
                      <img
                        src="\Screenshot 2026-01-01 191041.png"
                        alt="Damodar Prasad Sharma - Founder & CEO"
                        className="w-full h-64 sm:h-80 md:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent"></div>
                      
                      {/* Floating Badge */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-full shadow-lg"
                      >
                        <span className="text-sm font-bold">FOUNDER</span>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Experience Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="absolute -bottom-4 -left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 sm:p-4 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <div>
                        <div className="text-lg sm:text-xl font-bold">35+</div>
                        <div className="text-xs font-medium">Years Experience</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Founder Details */}
                <div className="lg:w-3/5">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Damodar Prasad Sharma
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-0.5 bg-blue-600"></div>
                    <p className="text-blue-600 font-medium text-lg sm:text-xl">Founder & CEO</p>
                  </div>
                  
                  <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                    With over 35 years of unparalleled experience in industrial manufacturing, 
                    Mr. Damodar Prasad Sharma is the visionary architect behind Damodar Traders. 
                    His deep understanding of industrial needs, combined with an unwavering 
                    commitment to quality, has shaped our company into a trusted industry leader.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <TargetIcon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 text-sm sm:text-base">
                        <span className="font-semibold">Vision:</span> To create India's most reliable 
                        industrial supply chain through innovation and integrity
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <AwardIcon className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 text-sm sm:text-base">
                        <span className="font-semibold">Achievements:</span> Spearheaded expansion 
                        from a single warehouse to Pan-India operations with 1500+ clients
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <UsersIcon className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 text-sm sm:text-base">
                        <span className="font-semibold">Leadership Philosophy:</span> Empowering 
                        teams through collaboration and fostering a culture of excellence
                      </p>
                    </div>
                  </div>
                  
                  {/* Email Contact Button */}
                  <div className="mt-8">
                    <a 
                      href="mailto:damodar@damodartraders.com"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Mail className="w-5 h-5" />
                      Connect via Email
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Milestones - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12 md:mb-16 px-2"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our <span className="text-blue-600">Journey</span> Through Time
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Key milestones that shaped our growth and success
              </p>
            </motion.div>

            <div className="relative">
              {/* Hide timeline line on mobile, show on sm+ */}
              <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              
              <div className="space-y-6 sm:space-y-8 md:space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-2 border-white shadow flex items-center justify-center">
                          <Star className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-sm font-semibold text-blue-600">{milestone.year}</div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h4>
                      <p className="text-gray-600 text-sm">{milestone.description}</p>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:block relative">
                      <div className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`w-5/12 ${index % 2 === 0 ? 'pr-6 sm:pr-12' : 'pl-6 sm:pl-12'}`}>
                          <div className={`p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                            <div className="text-sm font-semibold text-blue-600 mb-2">{milestone.year}</div>
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{milestone.title}</h4>
                            <p className="text-gray-600 text-sm sm:text-base">{milestone.description}</p>
                          </div>
                        </div>
                        
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Mobile Optimized */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
                Ready to Partner with Excellence?
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto px-2">
                Join 1500+ satisfied clients who trust us for their industrial needs. 
                Experience the difference that quality, reliability, and exceptional service makes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                <Link 
                  to="/contact"
                  className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-blue-600 rounded-lg font-bold text-sm sm:text-base hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <HeadphonesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Contact Our Team
                </Link>
                <Link 
                  to="/products"
                  className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-transparent border border-white sm:border-2 text-white rounded-lg font-bold text-sm sm:text-base hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                  Browse Products
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default About;
