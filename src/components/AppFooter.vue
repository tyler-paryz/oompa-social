<template>
  <footer v-if="isAuthenticated">
    <div class="footer-content">
      <p>&copy; 2023 Oompa Social - A Wonka Industries Company</p>
      <div class="footer-links">
        <a href="#" @click.prevent="trackFooterLink('terms')">Terms</a>
        <a href="#" @click.prevent="trackFooterLink('privacy')">Privacy</a>
        <a href="#" @click.prevent="trackFooterLink('help')">Help</a>
      </div>
      <div class="slugworth-ecosystem">
        <span class="ecosystem-title">Slugworth Ecosystem:</span>
        <div class="ecosystem-links">
          <a 
            href="https://slugworth-corp.vercel.app/" 
            target="_blank"
            @click="trackCrossAppNavigation('slugworth-corp')"
            class="ecosystem-link"
          >
            Slugworth Corp
          </a>
          <a 
            href="#" 
            class="ecosystem-link current"
            @click.prevent
          >
            Oompa Social
          </a>
          <a 
            href="https://golden-ticket-booking.vercel.app/" 
            target="_blank"
            @click="trackCrossAppNavigation('golden-ticket')"
            class="ecosystem-link"
          >
            Golden Ticket
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue';
import { useUserStore } from '../stores/user';
import { storeToRefs } from 'pinia';

export default {
  name: 'AppFooter',
  setup() {
    const userStore = useUserStore();
    const { isAuthenticated } = storeToRefs(userStore);
    
    const trackFooterLink = (linkType) => {
      // Track footer link clicks in Pendo
      if (window.pendo) {
        window.pendo.track('footer_link_clicked', {
          linkType
        });
      }
    };
    
    const trackCrossAppNavigation = (destination) => {
      // Track cross-app navigation in Pendo
      if (window.pendo) {
        window.pendo.track('cross_app_navigation', {
          source: 'oompa-social',
          destination: destination,
          location: 'footer',
          timestamp: new Date().toISOString()
        });
      }
    };
    
    return {
      isAuthenticated,
      trackFooterLink,
      trackCrossAppNavigation
    };
  }
};
</script>

<style scoped>
footer {
  background-color: var(--card-bg);
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.footer-links a {
  margin-left: 1rem;
  color: var(--text-dark);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--primary);
}

.slugworth-ecosystem {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.ecosystem-title {
  font-size: 0.85rem;
  color: var(--secondary);
  margin-right: 0.5rem;
  font-weight: 500;
}

.ecosystem-links {
  display: flex;
  gap: 0.75rem;
}

.ecosystem-link {
  color: var(--text-dark);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.ecosystem-link:hover {
  background-color: var(--primary-light);
  color: var(--text-light);
}

.ecosystem-link.current {
  background-color: var(--primary);
  color: var(--text-light);
  cursor: default;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .footer-links a {
    margin: 0 0.5rem 0 0;
  }
  
  .slugworth-ecosystem {
    margin-left: 0;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .ecosystem-links {
    margin-top: 0.5rem;
  }
}
</style> 