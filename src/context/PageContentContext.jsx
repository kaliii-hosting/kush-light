import React, { createContext, useContext, useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

const PageContentContext = createContext();

export const usePageContent = () => {
  const context = useContext(PageContentContext);
  if (!context) {
    throw new Error('usePageContent must be used within a PageContentProvider');
  }
  return context;
};

// Section templates for easy addition
export const sectionTemplates = {
  hero: {
    basic: {
      id: 'hero_' + Date.now(),
      type: 'hero',
      name: 'Hero Section',
      title: 'Welcome to Our Site',
      subtitle: 'Discover amazing products and services',
      buttonText: 'Get Started',
      buttonLink: '/shop',
      videoUrl: '',
      imageUrl: ''
    },
    video: {
      id: 'hero_video_' + Date.now(),
      type: 'hero',
      name: 'Video Hero',
      title: 'Experience Excellence',
      subtitle: 'Watch our story unfold',
      buttonText: 'Learn More',
      buttonLink: '/about',
      videoUrl: 'https://example.com/video.mp4',
      imageUrl: ''
    }
  },
  content: {
    basic: {
      id: 'content_' + Date.now(),
      type: 'content',
      name: 'Content Section',
      title: 'Our Features',
      subtitle: 'What makes us special',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      items: []
    },
    withItems: {
      id: 'content_items_' + Date.now(),
      type: 'content',
      name: 'Features List',
      title: 'Why Choose Us',
      subtitle: 'Benefits that matter',
      items: [
        { title: 'Quality Products', description: 'Premium quality guaranteed' },
        { title: 'Fast Delivery', description: 'Quick and reliable shipping' },
        { title: 'Great Support', description: '24/7 customer service' }
      ]
    }
  },
  cta: {
    basic: {
      id: 'cta_' + Date.now(),
      type: 'cta',
      name: 'Call to Action',
      title: 'Ready to Get Started?',
      subtitle: 'Join thousands of satisfied customers',
      buttonText: 'Shop Now',
      buttonLink: '/shop'
    },
    newsletter: {
      id: 'cta_newsletter_' + Date.now(),
      type: 'cta',
      name: 'Newsletter CTA',
      title: 'Stay Updated',
      subtitle: 'Get the latest news and offers',
      newsletterEnabled: true,
      buttonText: 'Subscribe',
      placeholderText: 'Enter your email'
    }
  }
};

// Default content structure for all pages with sections
const defaultPageContent = {
  home: {
    sections: [
      {
        id: 'hero_main',
        type: 'hero',
        name: 'Main Hero',
        videoUrl: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/videos/background%20real.mp4',
        title: 'Good Afternoon',
        subtitle: 'What would you like to order today?',
        buttonText: 'Shop Now',
        buttonLink: '/shop'
      },
      {
        id: 'hero_gold',
        type: 'hero',
        name: 'Gold Cartridges Hero',
        videoUrl: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/videos/Gold%20Cartridges%20Video.mp4',
        title: 'Gold Standard Cartridges',
        subtitle: 'Experience luxury with our gold series',
        buttonText: 'Discover Gold Series',
        buttonLink: '/shop'
      },
      {
        id: 'products_featured',
        type: 'products',
        name: 'Featured Products',
        title: 'Featured Products',
        productType: 'featured',
        editable: false
      },
      {
        id: 'hero_disposables',
        type: 'hero',
        name: 'Disposables Hero',
        videoUrl: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/videos/Dspsbls%20NeoGreen%20Video.mp4',
        title: 'Disposables Redefined',
        subtitle: 'Premium disposable vapes with cutting-edge technology',
        buttonText: 'Shop Disposables',
        buttonLink: '/shop?category=disposables'
      },
      {
        id: 'products_new',
        type: 'products',
        name: 'New Arrivals',
        title: 'New Arrivals',
        productType: 'new',
        editable: false
      },
      {
        id: 'hero_premium',
        type: 'hero',
        name: 'Premium Experience Hero',
        videoUrl: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/videos/background%20video%201.mp4',
        title: 'Experience Premium Quality',
        subtitle: 'Discover our exclusive collection of artisanal Sample products',
        buttonText: 'Explore Collection',
        buttonLink: '/shop'
      },
      {
        id: 'award_winning',
        type: 'awardWinning',
        name: 'Award Winning Section',
        editable: false
      },
      {
        id: 'hero_innovation',
        type: 'hero',
        name: 'Innovation Hero',
        videoUrl: 'https://fchtwxunzmkzbnibqbwl.supabase.co/storage/v1/object/public/kushie01/videos/background%20video%202.mp4',
        title: 'The Future of Sample is Here',
        subtitle: 'Cutting-edge extraction methods and innovative delivery systems',
        buttonText: 'Shop New Arrivals',
        buttonLink: '/shop?filter=new'
      },
      {
        id: 'products_bestsellers',
        type: 'products',
        name: 'Best Sellers',
        title: 'Best Sellers',
        productType: 'bestsellers',
        editable: false
      },
      {
        id: 'footer',
        type: 'footer',
        name: 'Footer',
        newsletter: {
          title: 'Stay Updated',
          description: 'Get the latest news and exclusive offers',
          placeholder: 'Enter your email',
          buttonText: 'Subscribe'
        },
        columns: [
          {
            id: 'company',
            title: 'Company',
            links: [
              { text: 'About Us', url: '/about' },
              { text: 'Blog', url: '/blog' }
            ]
          },
          {
            id: 'products', 
            title: 'Products',
            links: [
              { text: 'Shop All', url: '/shop' },
              { text: 'New Arrivals', url: '/shop?filter=new' },
              { text: 'Best Sellers', url: '/shop?filter=bestsellers' },
              { text: 'Wholesale', url: '/wholesale' }
            ]
          },
          {
            id: 'support',
            title: 'Support',
            links: [
              { text: 'Contact Us', url: '/contact' },
              { text: 'Careers', url: '/careers' }
            ]
          },
          {
            id: 'legal',
            title: 'Legal',
            links: [
              { text: 'Privacy Policy', url: '/privacy-policy' },
              { text: 'Terms of Service', url: '/terms-of-service' },
              { text: 'Lab Results', url: '/lab-results' }
            ]
          }
        ],
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com/brand' },
          { platform: 'instagram', url: 'https://instagram.com/brand' },
          { platform: 'twitter', url: 'https://twitter.com/brand' },
          { platform: 'youtube', url: 'https://youtube.com/brand' }
        ],
        copyright: '© 2024 Brand. All rights reserved.',
        bottomLinks: [
          { text: 'Accessibility', url: '/accessibility' }
        ]
      }
    ]
  },
  about: {
    sections: [
      {
        id: 'hero',
        type: 'hero',
        name: 'About Hero',
        imageUrl: '',
        videoUrl: '',
        title: 'Our Story',
        subtitle: 'Pioneering Excellence in Sample Since Day One',
        buttonText: 'Learn More',
        buttonLink: '#mission',
        editable: false // About hero is not editable per requirements
      },
      {
        id: 'mission',
        type: 'content',
        name: 'Our Mission',
        title: 'Our Mission',
        subtitle: 'Elevating Sample Culture',
        description: 'We believe in providing premium Sample products that enhance your lifestyle while maintaining the highest standards of quality and safety.'
      },
      {
        id: 'values',
        type: 'content',
        name: 'Our Values',
        title: 'Our Values',
        subtitle: 'What drives us forward',
        items: [
          { title: 'Quality First', description: 'Every product meets our rigorous standards' },
          { title: 'Innovation', description: 'Constantly pushing boundaries in Sample technology' },
          { title: 'Sustainability', description: 'Committed to environmental responsibility' },
          { title: 'Community', description: 'Building connections through shared experiences' }
        ]
      },
      {
        id: 'team',
        type: 'content',
        name: 'Our Team',
        title: 'Meet the Team',
        subtitle: 'Passionate professionals dedicated to excellence',
        description: 'Our team brings together decades of experience in Sample cultivation, extraction, and product development.'
      },
      {
        id: 'cta',
        type: 'cta',
        name: 'Join Us CTA',
        title: 'Ready to Experience the Difference?',
        subtitle: 'Join thousands of satisfied customers',
        buttonText: 'Shop Now',
        buttonLink: '/shop'
      }
    ]
  },
  wholesale: {
    sections: [
      {
        id: 'hero',
        type: 'hero',
        name: 'Wholesale Hero',
        videoUrl: '',
        imageUrl: '',
        title: 'Partner With Brand',
        subtitle: 'Join the fastest growing Sample brand in the industry',
        buttonText: 'Apply Now',
        buttonLink: '#apply'
      },
      {
        id: 'benefits',
        type: 'content',
        name: 'Partner Benefits',
        title: 'Why Partner With Us',
        subtitle: 'Benefits that set us apart',
        items: [
          { title: 'Premium Products', description: 'Access to our full line of award-winning products' },
          { title: 'Marketing Support', description: 'Professional materials and campaigns' },
          { title: 'Fast Shipping', description: 'Same-day processing on most orders' },
          { title: 'Dedicated Support', description: 'Personal account manager for your business' }
        ]
      },
      {
        id: 'requirements',
        type: 'content',
        name: 'Requirements',
        title: 'Partnership Requirements',
        subtitle: 'What we look for in partners',
        description: 'We partner with established businesses that share our commitment to quality and compliance.',
        items: [
          { title: 'Valid License', description: 'Active state Sample retail license' },
          { title: 'Storefront', description: 'Physical retail location or delivery service' },
          { title: 'Compliance', description: 'Track record of regulatory compliance' }
        ]
      },
      {
        id: 'process',
        type: 'content',
        name: 'Application Process',
        title: 'How to Get Started',
        subtitle: 'Simple steps to partnership',
        items: [
          { title: 'Apply Online', description: 'Fill out our simple application form' },
          { title: 'Review', description: 'Our team reviews your application within 48 hours' },
          { title: 'Onboarding', description: 'Get set up with your account manager' },
          { title: 'Start Ordering', description: 'Access our full product catalog' }
        ]
      },
      {
        id: 'cta',
        type: 'cta',
        name: 'Apply CTA',
        title: 'Ready to Partner?',
        subtitle: 'Start your wholesale application today',
        buttonText: 'Apply Now',
        buttonLink: '/wholesale/apply'
      }
    ]
  },
  contact: {
    sections: [
      {
        id: 'hero',
        type: 'hero',
        name: 'Contact Hero',
        title: 'Get in Touch',
        subtitle: 'We\'re here to help with any questions',
        backgroundImage: '',
        imageUrl: ''
      },
      {
        id: 'info',
        type: 'content',
        name: 'Contact Information',
        title: 'Contact Information',
        subtitle: 'Multiple ways to reach us',
        items: [
          { title: 'Email', description: 'support@brand.com' },
          { title: 'Phone', description: '1-800-BRAND' },
          { title: 'Hours', description: 'Monday - Friday: 9AM - 6PM PST' }
        ]
      },
      {
        id: 'locations',
        type: 'content',
        name: 'Locations',
        title: 'Visit Our Locations',
        subtitle: 'Find us near you',
        description: 'We have multiple locations to serve you better.',
        items: [
          { title: 'Los Angeles', description: '123 Sample Blvd, LA, CA 90001' },
          { title: 'San Francisco', description: '456 Green St, SF, CA 94101' },
          { title: 'San Diego', description: '789 Pacific Ave, SD, CA 92101' }
        ]
      },
      {
        id: 'support',
        type: 'content',
        name: 'Support',
        title: 'How Can We Help?',
        subtitle: 'Common questions and support',
        description: 'Our support team is ready to assist you with any questions about our products, orders, or wholesale partnerships.'
      }
    ]
  },
  shop: {
    sections: [
      {
        id: 'hero',
        type: 'hero',
        name: 'Shop Hero',
        title: 'Premium Sample Collection',
        subtitle: 'Discover our carefully curated selection',
        backgroundImage: '',
        editable: false // Shop page is not editable
      },
      {
        id: 'categories',
        type: 'content',
        name: 'Shop Categories',
        title: 'Shop by Category',
        subtitle: 'Find exactly what you\'re looking for',
        editable: false
      }
    ]
  }
};

export const PageContentProvider = ({ children }) => {
  const [pageContent, setPageContent] = useState(defaultPageContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load content from Firebase
  useEffect(() => {
    const contentRef = ref(realtimeDb, 'pageContent');
    
    const unsubscribe = onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPageContent(data);
      } else {
        // If no content exists, populate with defaults
        set(contentRef, defaultPageContent);
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase listener error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update specific section
  const updateSection = async (pageName, sectionId, content) => {
    setSaving(true);
    try {
      const pageData = pageContent[pageName];
      if (!pageData || !pageData.sections) return false;

      const updatedSections = pageData.sections.map(section =>
        section.id === sectionId ? { ...section, ...content } : section
      );

      const updates = {
        ...pageContent,
        [pageName]: {
          ...pageData,
          sections: updatedSections
        }
      };
      
      await set(ref(realtimeDb, 'pageContent'), updates);
      setPageContent(updates);
      return true;
    } catch (error) {
      console.error('Error updating section:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Add new section
  const addSection = async (pageName, sectionTemplate) => {
    setSaving(true);
    try {
      const pageData = pageContent[pageName];
      if (!pageData) return false;

      const newSection = {
        ...sectionTemplate,
        id: sectionTemplate.id || `section_${Date.now()}`
      };

      const updatedSections = [...(pageData.sections || []), newSection];

      const updates = {
        ...pageContent,
        [pageName]: {
          ...pageData,
          sections: updatedSections
        }
      };
      
      await set(ref(realtimeDb, 'pageContent'), updates);
      setPageContent(updates);
      return true;
    } catch (error) {
      console.error('Error adding section:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Delete section
  const deleteSection = async (pageName, sectionId) => {
    setSaving(true);
    try {
      const pageData = pageContent[pageName];
      if (!pageData || !pageData.sections) return false;

      const updatedSections = pageData.sections.filter(
        section => section.id !== sectionId
      );

      const updates = {
        ...pageContent,
        [pageName]: {
          ...pageData,
          sections: updatedSections
        }
      };
      
      await set(ref(realtimeDb, 'pageContent'), updates);
      setPageContent(updates);
      return true;
    } catch (error) {
      console.error('Error deleting section:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Reorder sections
  const reorderSections = async (pageName, newSections) => {
    setSaving(true);
    try {
      const pageData = pageContent[pageName];
      if (!pageData) return false;

      const updates = {
        ...pageContent,
        [pageName]: {
          ...pageData,
          sections: newSections
        }
      };
      
      await set(ref(realtimeDb, 'pageContent'), updates);
      setPageContent(updates);
      return true;
    } catch (error) {
      console.error('Error reordering sections:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Legacy method for backward compatibility
  const updatePageContent = async (pageName, section, content) => {
    return updateSection(pageName, section, content);
  };

  // Update entire page
  const updateEntirePage = async (pageName, content) => {
    setSaving(true);
    try {
      const updates = {
        ...pageContent,
        [pageName]: content
      };
      
      await set(ref(realtimeDb, 'pageContent'), updates);
      setPageContent(updates);
      return true;
    } catch (error) {
      console.error('Error updating page:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    setSaving(true);
    try {
      await set(ref(realtimeDb, 'pageContent'), defaultPageContent);
      setPageContent(defaultPageContent);
      return true;
    } catch (error) {
      console.error('Error resetting content:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const value = {
    pageContent,
    loading,
    saving,
    updatePageContent,
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    updateEntirePage,
    resetToDefaults,
    defaultPageContent,
    sectionTemplates
  };

  return (
    <PageContentContext.Provider value={value}>
      {children}
    </PageContentContext.Provider>
  );
};

export default PageContentContext;