const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Privacy Policy",
      subtitle: "Last Updated: January 2025",
      content: `Brand Brand ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

By accessing or using our website, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the site.`
    },
    {
      title: "Information We Collect",
      subtitle: "Personal Data",
      content: `We may collect personally identifiable information that you voluntarily provide to us when you:

• Register on the website or create an account
• Make a purchase or place an order
• Subscribe to our newsletter or marketing communications
• Fill out a form or contact us
• Participate in contests, promotions, or surveys

This information may include:
• Name and contact information (email address, phone number, mailing address)
• Date of birth (for age verification)
• Billing and shipping addresses
• Payment information (credit card numbers, billing details)
• Account credentials (username and password)
• Purchase history and preferences
• Any other information you choose to provide`
    },
    {
      title: "Age Verification",
      subtitle: "21+ Requirement",
      content: `Our products and services are intended for individuals who are 21 years of age or older. We implement age verification measures to ensure compliance with applicable laws and regulations.

By using our website, you confirm that you are at least 21 years old. We reserve the right to verify your age and may request additional documentation. If we determine that you are under 21, we will terminate your account and delete your personal information.`
    },
    {
      title: "How We Use Your Information",
      subtitle: "Purpose of Data Collection",
      content: `We use the information we collect to:

• Process and fulfill your orders
• Send you order confirmations and shipping updates
• Manage your account and provide customer support
• Send marketing communications (with your consent)
• Personalize your experience and improve our services
• Comply with legal obligations and regulations
• Prevent fraud and maintain security
• Analyze usage patterns and improve our website
• Respond to your comments, questions, and requests
• Send you technical notices and security alerts`
    },
    {
      title: "Information Sharing and Disclosure",
      subtitle: "Third Party Access",
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information in the following situations:

• Service Providers: We may share your information with third-party vendors who perform services on our behalf (payment processing, shipping, email delivery, analytics)
• Legal Requirements: We may disclose your information if required by law or in response to valid legal requests
• Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred
• Protection of Rights: We may disclose information to protect our rights, property, or safety, or that of our users
• With Your Consent: We may share your information for any other purpose with your explicit consent`
    },
    {
      title: "Data Security",
      subtitle: "Protection Measures",
      content: `We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

These measures include:
• Secure Socket Layer (SSL) encryption for data transmission
• Secure servers and firewalls
• Regular security assessments and updates
• Limited access to personal information by employees
• PCI DSS compliance for payment processing

However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.`
    },
    {
      title: "Cookies and Tracking Technologies",
      subtitle: "Website Analytics",
      content: `We use cookies and similar tracking technologies to:

• Remember your preferences and settings
• Authenticate your identity
• Analyze website traffic and usage
• Personalize content and advertising
• Improve website functionality

You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.

We may also use third-party analytics services (such as Google Analytics) to help us understand how our website is used.`
    },
    {
      title: "Your Rights and Choices",
      subtitle: "Data Control",
      content: `You have the following rights regarding your personal information:

• Access: Request a copy of the personal information we hold about you
• Correction: Request that we correct any inaccurate or incomplete information
• Deletion: Request that we delete your personal information (subject to legal requirements)
• Opt-out: Unsubscribe from marketing communications at any time
• Data Portability: Request your data in a structured, machine-readable format
• Restriction: Request that we limit the processing of your information

To exercise these rights, please contact us using the information provided below.`
    },
    {
      title: "California Privacy Rights",
      subtitle: "CCPA Compliance",
      content: `If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):

• Right to know what personal information we collect, use, disclose, and sell
• Right to request deletion of your personal information
• Right to opt-out of the sale of personal information (we do not sell personal information)
• Right to non-discrimination for exercising your privacy rights

To make a request under the CCPA, please contact us at privacy@kushiebrand.com or use our designated request form.`
    },
    {
      title: "International Users",
      subtitle: "Data Transfers",
      content: `If you are accessing our website from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States.

By using our website and providing your information, you consent to the transfer and processing of your information in the United States, which may have different data protection laws than your country of residence.`
    },
    {
      title: "Children's Privacy",
      subtitle: "Age Restrictions",
      content: `Our website is not intended for individuals under the age of 21. We do not knowingly collect personal information from anyone under 21 years of age.

If we become aware that we have collected personal information from someone under 21, we will take steps to delete that information as soon as possible. If you believe we have collected information from someone under 21, please contact us immediately.`
    },
    {
      title: "Changes to This Policy",
      subtitle: "Updates and Modifications",
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.

We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically.

Your continued use of our website after any changes indicates your acceptance of the updated Privacy Policy.`
    },
    {
      title: "Contact Information",
      subtitle: "Get in Touch",
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:

Brand Brand
Email: privacy@kushiebrand.com
Phone: 1-800-KUSHIE1
Address: Los Angeles, California

For data protection inquiries, you may also contact our Data Protection Officer at dpo@kushiebrand.com.`
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
              Privacy Policy
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Your privacy matters to us
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

export default PrivacyPolicy;