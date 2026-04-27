import { ref, get, set } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

/**
 * Utility script to remove Sitemap link from footer bottomLinks in Firebase
 * Run this once to clean up the footer data
 */
export const removeSitemapFromFooter = async () => {
  try {
    console.log('🔍 Checking footer data...');

    // Reference to home page sections
    const sectionsRef = ref(realtimeDb, 'pageContent/home/sections');
    const snapshot = await get(sectionsRef);

    if (!snapshot.exists()) {
      console.log('❌ No sections found in database');
      return;
    }

    const sections = snapshot.val();

    // Find footer section
    const footerSectionIndex = sections.findIndex(s => s.type === 'footer');

    if (footerSectionIndex === -1) {
      console.log('❌ No footer section found');
      return;
    }

    const footerSection = sections[footerSectionIndex];

    // Check if bottomLinks exists
    if (!footerSection.bottomLinks) {
      console.log('ℹ️ No bottomLinks found in footer');
      return;
    }

    console.log('📝 Current bottomLinks:', footerSection.bottomLinks);

    // Filter out sitemap
    const updatedBottomLinks = footerSection.bottomLinks.filter(
      link => link.text.toLowerCase() !== 'sitemap'
    );

    if (updatedBottomLinks.length === footerSection.bottomLinks.length) {
      console.log('ℹ️ No Sitemap link found to remove');
      return;
    }

    // Update the footer section
    sections[footerSectionIndex] = {
      ...footerSection,
      bottomLinks: updatedBottomLinks
    };

    // Save back to Firebase
    await set(sectionsRef, sections);

    console.log('✅ Sitemap removed successfully!');
    console.log('📝 New bottomLinks:', updatedBottomLinks);

    return true;
  } catch (error) {
    console.error('❌ Error removing sitemap:', error);
    throw error;
  }
};

// Auto-run if this file is imported
if (typeof window !== 'undefined') {
  // Only run in browser, not during SSR
  console.log('Sitemap removal utility loaded. Call removeSitemapFromFooter() to execute.');
}
