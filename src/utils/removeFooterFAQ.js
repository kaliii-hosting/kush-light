// Utility to remove FAQs from footer in Firebase
import { ref, update, get } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

export const removeFooterFAQ = async () => {
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
          const currentFooter = data.home.sections[footerIndex];
          
          // Update the Support column to remove FAQs if it exists
          const updatedColumns = currentFooter.columns?.map(column => {
            if (column.id === 'support' || column.title === 'Support') {
              // Remove FAQs from the links array
              return {
                ...column,
                links: column.links?.filter(link => 
                  !link.text?.toLowerCase().includes('faq')
                ) || []
              };
            }
            return column;
          }) || [];
          
          // Create updated footer
          const updatedFooter = {
            ...currentFooter,
            columns: updatedColumns
          };
          
          // Update the sections array
          const updatedSections = [...data.home.sections];
          updatedSections[footerIndex] = updatedFooter;
          
          // Update Firebase
          await update(ref(realtimeDb, 'pageContent/home'), {
            sections: updatedSections
          });
          
          console.log('Footer FAQs removed successfully');
          return true;
        }
      }
    }
    
    console.log('No footer section found to update');
    return false;
  } catch (error) {
    console.error('Error removing footer FAQs:', error);
    return false;
  }
};

// Run the update when this module is imported
removeFooterFAQ();