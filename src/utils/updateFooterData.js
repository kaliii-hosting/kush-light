// Utility to update footer data in Firebase
import { ref, update, get } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

export const updateFooterDataInFirebase = async () => {
  try {
    // Get current page content
    const contentRef = ref(realtimeDb, 'pageContent');
    const snapshot = await get(contentRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Update footer section in home page
      if (data.home && data.home.sections) {
        const footerIndex = data.home.sections.findIndex(s => s.type === 'footer');
        
        if (footerIndex !== -1) {
          // Update the footer with new structure (no FAQs, Careers under Support)
          const updatedFooter = {
            ...data.home.sections[footerIndex],
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
            ]
          };
          
          // Update the sections array
          const updatedSections = [...data.home.sections];
          updatedSections[footerIndex] = updatedFooter;
          
          // Update Firebase
          await update(ref(realtimeDb, 'pageContent/home'), {
            sections: updatedSections
          });
          
          console.log('Footer data updated successfully');
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error updating footer data:', error);
    return false;
  }
};