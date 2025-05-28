<template>
  <div class="ecosystem-container">
    <section class="ecosystem-header">
      <h1>Slugworth Ecosystem</h1>
      <p>Explore the full suite of Slugworth Corp applications</p>
    </section>

    <section class="apps-grid">
      <!-- Slugworth Corp -->
      <div class="app-card">
        <div class="app-header">
          <h2>Slugworth Corp</h2>
          <span class="app-tag">Corporate Portal</span>
        </div>
        <div class="app-content">
          <p>The main corporate portal for Slugworth Corp employees.</p>
          <div class="app-features">
            <div class="feature"><i class="mdi mdi-check-circle"></i> Corporate resources</div>
            <div class="feature"><i class="mdi mdi-check-circle"></i> Employee tools</div>
            <div class="feature"><i class="mdi mdi-check-circle"></i> Management dashboard</div>
          </div>
        </div>
        <div class="app-actions">
          <a 
            href="https://slugworth-corp.vercel.app/" 
            target="_blank" 
            class="app-button primary"
            @click="trackAppLaunch('slugworth-corp', 'button')"
          >
            Open App
          </a>
          <button 
            class="app-button secondary"
            @click="toggleAppDetails('slugworth-corp')"
          >
            Learn More
          </button>
        </div>
      </div>

      <!-- Oompa Social -->
      <div class="app-card current">
        <div class="app-header">
          <h2>Oompa Social</h2>
          <span class="app-tag">Social Network</span>
        </div>
        <div class="app-content">
          <p>Connect with fellow Oompa Loompas and share your chocolate experiences.</p>
          <div class="app-features">
            <div class="feature"><i class="mdi mdi-check-circle"></i> Social feed</div>
            <div class="feature"><i class="mdi mdi-check-circle"></i> Messaging</div>
            <div class="feature"><i class="mdi mdi-check-circle"></i> Friend connections</div>
          </div>
        </div>
        <div class="app-actions">
          <router-link 
            to="/"
            class="app-button primary"
            @click="trackAppLaunch('oompa-social', 'button')"
          >
            Open App
          </router-link>
          <button 
            class="app-button secondary"
            @click="toggleAppDetails('oompa-social')"
          >
            Learn More
          </button>
        </div>
      </div>

      <!-- Golden Ticket -->
      <div class="app-card">
        <div class="app-header">
          <h2>Golden Ticket</h2>
          <span class="app-tag">Booking Platform</span>
        </div>
        <div class="app-content">
          <p>Book factory tours and chocolate tastings at Wonka Industries.</p>
          <div class="app-features">
            <div class="feature"><i class="mdi mdi-check-circle"></i> Tour booking</div>
            <div class="feature"><i class="mdi mdi-check-circle"></i> Tasting reservations</div>
            <div class="feature"><i class="mdi mdi-check-circle"></i> Golden ticket contests</div>
          </div>
        </div>
        <div class="app-actions">
          <a 
            href="https://golden-ticket-booking.vercel.app/" 
            target="_blank" 
            class="app-button primary"
            @click="trackAppLaunch('golden-ticket', 'button')"
          >
            Open App
          </a>
          <button 
            class="app-button secondary"
            @click="toggleAppDetails('golden-ticket')"
          >
            Learn More
          </button>
        </div>
      </div>
    </section>

    <!-- App Details Modal -->
    <div class="modal-overlay" v-if="showModal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">
          <i class="mdi mdi-close"></i>
        </button>
        
        <div v-if="selectedApp === 'slugworth-corp'">
          <h2>Slugworth Corp Portal</h2>
          <p class="modal-description">The central hub for all Slugworth Corp employees.</p>
          
          <h3>Key Features</h3>
          <div class="feature-list">
            <div class="feature-item" @click="trackFeatureInterest('slugworth-corp', 'resources')">
              <i class="mdi mdi-folder"></i>
              <div>
                <h4>Corporate Resources</h4>
                <p>Access HR documents, corporate policies, and company announcements.</p>
              </div>
            </div>
            
            <div class="feature-item" @click="trackFeatureInterest('slugworth-corp', 'tools')">
              <i class="mdi mdi-tools"></i>
              <div>
                <h4>Employee Tools</h4>
                <p>Time tracking, expense reporting, and project management tools.</p>
              </div>
            </div>
            
            <div class="feature-item" @click="trackFeatureInterest('slugworth-corp', 'dashboard')">
              <i class="mdi mdi-view-dashboard"></i>
              <div>
                <h4>Management Dashboard</h4>
                <p>Performance metrics, team analytics, and resource allocation tools.</p>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <a 
              href="https://slugworth-corp.vercel.app/" 
              target="_blank" 
              class="app-button primary"
              @click="trackAppLaunch('slugworth-corp', 'modal')"
            >
              Open Slugworth Corp
            </a>
          </div>
        </div>
        
        <div v-if="selectedApp === 'oompa-social'">
          <h2>Oompa Social Network</h2>
          <p class="modal-description">Connect with fellow Oompa Loompas in the Wonka ecosystem.</p>
          
          <h3>Key Features</h3>
          <div class="feature-list">
            <div class="feature-item" @click="trackFeatureInterest('oompa-social', 'feed')">
              <i class="mdi mdi-post"></i>
              <div>
                <h4>Social Feed</h4>
                <p>Share updates, photos, and stories with your Oompa Loompa network.</p>
              </div>
            </div>
            
            <div class="feature-item" @click="trackFeatureInterest('oompa-social', 'messaging')">
              <i class="mdi mdi-message"></i>
              <div>
                <h4>Messaging</h4>
                <p>Private conversations with other Oompa Loompas in real-time.</p>
              </div>
            </div>
            
            <div class="feature-item" @click="trackFeatureInterest('oompa-social', 'friends')">
              <i class="mdi mdi-account-group"></i>
              <div>
                <h4>Friend Connections</h4>
                <p>Build your network with friend requests and suggestions.</p>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <router-link 
              to="/"
              class="app-button primary"
              @click="trackAppLaunch('oompa-social', 'modal')"
            >
              Go to Oompa Social
            </router-link>
          </div>
        </div>
        
        <div v-if="selectedApp === 'golden-ticket'">
          <h2>Golden Ticket Booking</h2>
          <p class="modal-description">Book exclusive Wonka factory experiences.</p>
          
          <h3>Key Features</h3>
          <div class="feature-list">
            <div class="feature-item" @click="trackFeatureInterest('golden-ticket', 'tours')">
              <i class="mdi mdi-map-marker"></i>
              <div>
                <h4>Factory Tours</h4>
                <p>Book guided tours of the famous Wonka chocolate factory.</p>
              </div>
            </div>
            
            <div class="feature-item" @click="trackFeatureInterest('golden-ticket', 'tastings')">
              <i class="mdi mdi-food-croissant"></i>
              <div>
                <h4>Chocolate Tastings</h4>
                <p>Reserve spots for exclusive tastings of new Wonka creations.</p>
              </div>
            </div>
            
            <div class="feature-item" @click="trackFeatureInterest('golden-ticket', 'contests')">
              <i class="mdi mdi-ticket-percent"></i>
              <div>
                <h4>Golden Ticket Contests</h4>
                <p>Participate in contests to win special factory access.</p>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <a 
              href="https://golden-ticket-booking.vercel.app/" 
              target="_blank" 
              class="app-button primary"
              @click="trackAppLaunch('golden-ticket', 'modal')"
            >
              Open Golden Ticket
            </a>
          </div>
        </div>
      </div>
    </div>
    
    <router-debug />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import RouterDebug from '../components/RouterDebug.vue';

export default {
  name: 'EcosystemView',
  components: {
    RouterDebug
  },
  setup() {
    const showModal = ref(false);
    const selectedApp = ref(null);
    
    onMounted(() => {
      // Track ecosystem page view in Pendo
      if (window.pendo) {
        window.pendo.track('ecosystem_page_viewed', {
          source: 'oompa-social',
          timestamp: new Date().toISOString()
        });
      }
    });
    
    const toggleAppDetails = (appId) => {
      selectedApp.value = appId;
      showModal.value = true;
      
      // Track app detail view in Pendo
      if (window.pendo) {
        window.pendo.track('app_details_viewed', {
          app_id: appId,
          source: 'ecosystem_page',
          timestamp: new Date().toISOString()
        });
      }
    };
    
    const closeModal = () => {
      showModal.value = false;
    };
    
    const trackAppLaunch = (appId, source) => {
      // Track app launch in Pendo
      if (window.pendo) {
        window.pendo.track('app_launched', {
          app_id: appId,
          source: source,
          origin: 'oompa-social',
          location: 'ecosystem_page',
          timestamp: new Date().toISOString()
        });
      }
    };
    
    const trackFeatureInterest = (appId, featureId) => {
      // Track feature interest in Pendo
      if (window.pendo) {
        window.pendo.track('feature_interest', {
          app_id: appId,
          feature_id: featureId,
          source: 'ecosystem_page',
          timestamp: new Date().toISOString()
        });
      }
    };
    
    return {
      showModal,
      selectedApp,
      toggleAppDetails,
      closeModal,
      trackAppLaunch,
      trackFeatureInterest
    };
  }
};
</script>

<style scoped>
.ecosystem-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.ecosystem-header {
  text-align: center;
  margin-bottom: 2rem;
}

.ecosystem-header h1 {
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.app-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.app-card.current {
  border: 2px solid var(--primary);
}

.app-header {
  padding: 1.25rem;
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h2 {
  margin: 0;
  color: var(--text-dark);
  font-size: 1.25rem;
}

.app-tag {
  background-color: var(--primary-light);
  color: var(--text-light);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.app-content {
  padding: 1.25rem;
  flex: 1;
}

.app-features {
  margin-top: 1rem;
}

.feature {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.feature i {
  color: var(--success);
  margin-right: 0.5rem;
}

.app-actions {
  display: flex;
  padding: 1.25rem;
  border-top: 1px solid var(--border);
  gap: 0.5rem;
}

.app-button {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
  font-size: 0.9rem;
}

.app-button.primary {
  background-color: var(--primary);
  color: var(--text-light);
}

.app-button.primary:hover {
  background-color: var(--primary-dark);
}

.app-button.secondary {
  background-color: var(--background);
  color: var(--text-dark);
  border: 1px solid var(--border);
}

.app-button.secondary:hover {
  background-color: var(--border);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: var(--card-bg);
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 2rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-dark);
}

.modal-description {
  margin-bottom: 1.5rem;
  color: var(--secondary);
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature-item {
  display: flex;
  background-color: var(--background);
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.feature-item:hover {
  background-color: var(--border);
}

.feature-item i {
  font-size: 1.5rem;
  color: var(--primary);
  margin-right: 1rem;
  flex-shrink: 0;
}

.feature-item h4 {
  margin: 0 0 0.5rem 0;
}

.feature-item p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-dark);
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.modal-actions .app-button {
  min-width: 200px;
}

@media (max-width: 768px) {
  .apps-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
}
</style> 