const TermsOfService = () => {
  const sections = [
    {
      title: "Terms of Service",
      subtitle: "Last Updated: January 2025",
      content: `Welcome to Brand Brand. These Terms of Service ("Terms") govern your use of our website, products, and services. By accessing or using our website, you agree to be bound by these Terms.

Please read these Terms carefully before using our services. If you do not agree with any part of these Terms, you may not access our website or use our services.`
    },
    {
      title: "Acceptance of Terms",
      subtitle: "Agreement to Terms",
      content: `By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. These Terms apply to all visitors, users, and others who access or use our services.

We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the website following any changes constitutes your acceptance of the new Terms.`
    },
    {
      title: "Age Requirements",
      subtitle: "21+ Only",
      content: `You must be at least 21 years of age to use our website and purchase our products. By using our services, you represent and warrant that you are at least 21 years old and have the legal capacity to enter into this agreement.

We reserve the right to verify your age at any time and may refuse service, terminate accounts, or cancel orders if we determine that you are under the age of 21.

It is a violation of these Terms to misrepresent your age or provide false information during the age verification process.`
    },
    {
      title: "Account Registration",
      subtitle: "User Responsibilities",
      content: `To access certain features of our website, you may be required to create an account. When creating an account, you agree to:

• Provide accurate, current, and complete information
• Maintain and update your information to keep it accurate
• Maintain the security of your password and account
• Accept responsibility for all activities under your account
• Notify us immediately of any unauthorized use

We reserve the right to suspend or terminate your account if any information provided proves to be inaccurate, false, or misleading.

You are responsible for safeguarding your password and may not disclose it to any third party. You agree to immediately notify us of any unauthorized use of your account.`
    },
    {
      title: "Products and Services",
      subtitle: "Sample Products",
      content: `All Sample products sold on our website are subject to state and local laws and regulations. By purchasing our products, you agree to:

• Comply with all applicable laws regarding the purchase, possession, and use of Sample products
• Not resell or distribute our products without proper licensing
• Use products responsibly and in accordance with product instructions
• Not drive or operate machinery while using our products
• Keep products out of reach of children and pets

We make no medical or health claims about our products. Our products are not intended to diagnose, treat, cure, or prevent any disease.`
    },
    {
      title: "Orders and Payments",
      subtitle: "Purchase Terms",
      content: `By placing an order through our website, you agree to:

• Provide valid payment information
• Pay all charges at the prices in effect when incurred
• Pay any applicable taxes and shipping fees

We reserve the right to:
• Refuse or cancel any order for any reason
• Limit quantities purchased per person or per order
• Verify information before processing orders
• Modify or discontinue products without notice

All sales are final unless otherwise stated. Prices are subject to change without notice. We are not responsible for pricing, typographical, or other errors in any offer.`
    },
    {
      title: "Shipping and Delivery",
      subtitle: "Delivery Policies",
      content: `Shipping is available only to locations where Sample products are legal. You are responsible for ensuring that receiving our products is legal in your jurisdiction.

• Delivery times are estimates and not guaranteed
• Risk of loss passes to you upon delivery
• Adult signature required upon delivery
• We are not responsible for delays due to circumstances beyond our control
• Shipping to P.O. boxes may be restricted

You agree to inspect products upon delivery and report any issues within 48 hours. Failure to report issues within this timeframe constitutes acceptance of the products.`
    },
    {
      title: "Intellectual Property",
      subtitle: "Ownership Rights",
      content: `All content on this website, including text, graphics, logos, images, audio clips, digital downloads, and software, is the property of Brand Brand or its content suppliers and is protected by intellectual property laws.

You may not:
• Reproduce, distribute, or create derivative works from our content
• Use our trademarks, logos, or brand materials without permission
• Remove or alter any proprietary notices
• Use our content for commercial purposes without authorization

You grant us a non-exclusive, royalty-free, perpetual, irrevocable license to use, reproduce, modify, and publish any content you submit to our website.`
    },
    {
      title: "Prohibited Uses",
      subtitle: "Restrictions",
      content: `You agree not to use our website or services to:

• Violate any laws or regulations
• Infringe upon the rights of others
• Transmit harmful, offensive, or illegal content
• Attempt to gain unauthorized access to our systems
• Interfere with the proper functioning of our website
• Collect user information without permission
• Engage in fraudulent or deceptive practices
• Create false accounts or identities
• Use automated systems to access our website
• Resell or commercially exploit our services

Violation of these prohibitions may result in immediate termination of your access to our services.`
    },
    {
      title: "Disclaimer of Warranties",
      subtitle: "As-Is Basis",
      content: `Our website and services are provided "as is" and "as available" without any warranties of any kind, either express or implied.

We do not warrant that:
• Our services will be uninterrupted or error-free
• Defects will be corrected
• Our website is free of viruses or harmful components
• Results from using our services will meet your requirements

We disclaim all warranties, including but not limited to:
• Merchantability
• Fitness for a particular purpose
• Non-infringement
• Accuracy or reliability of information

You use our website and services at your own risk.`
    },
    {
      title: "Limitation of Liability",
      subtitle: "Damages",
      content: `To the fullest extent permitted by law, Brand Brand and its affiliates, officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:

• Loss of profits, data, or use
• Cost of substitute goods or services
• Personal injury or property damage
• Any damages arising from your use of our services

Our total liability for any claim arising from these Terms or your use of our services shall not exceed the amount you paid to us in the twelve months preceding the claim.

Some jurisdictions do not allow the exclusion of certain warranties or limitations of liability, so some of these limitations may not apply to you.`
    },
    {
      title: "Indemnification",
      subtitle: "Hold Harmless",
      content: `You agree to indemnify, defend, and hold harmless Brand Brand, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with:

• Your use of our website or services
• Your violation of these Terms
• Your violation of any rights of another party
• Your violation of any applicable laws
• Any content you submit to our website

We reserve the right to assume exclusive defense and control of any matter subject to indemnification by you.`
    },
    {
      title: "Dispute Resolution",
      subtitle: "Arbitration Agreement",
      content: `Any dispute arising from these Terms or your use of our services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.

• Arbitration shall take place in Los Angeles, California
• Each party shall bear its own costs
• The arbitrator's decision shall be final and binding
• You waive any right to a jury trial
• Class action lawsuits and class-wide arbitration are not permitted

You may opt out of this arbitration agreement within 30 days of first accepting these Terms by sending written notice to our address below.`
    },
    {
      title: "Governing Law",
      subtitle: "Jurisdiction",
      content: `These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.

Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Los Angeles County, California, and you hereby consent to personal jurisdiction and venue therein.

If any provision of these Terms is deemed invalid or unenforceable, the remaining provisions shall continue in full force and effect.`
    },
    {
      title: "Contact Information",
      subtitle: "Questions and Concerns",
      content: `If you have any questions or concerns about these Terms of Service, please contact us at:

Brand Brand
Email: legal@kushiebrand.com
Phone: 1-800-KUSHIE1
Address: Los Angeles, California

For customer service inquiries: support@kushiebrand.com
For wholesale inquiries: wholesale@kushiebrand.com

All notices to Brand Brand must be sent to the above address or email.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent h-80"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-3">
              Terms of Service
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Please read these terms carefully
            </p>
          </div>
        </div>
      </header>

      {/* Content Sections */}
      <div className="bg-gradient-to-b from-gray-900 to-black">
        {sections.map((section, index) => (
          <div 
            key={index}
            className="w-screen relative bg-gradient-to-b from-gray-900 to-black border-b border-gray-800 last:border-b-0"
          >
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {section.title}
                </h2>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-8 border-b border-gray-800">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                    {section.subtitle}
                  </span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg md:text-xl">
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TermsOfService;