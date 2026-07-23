import apiClient from '../../services/apiClient';

export const idCardService = {
  async saveCardProfile(mode, cardData) {
    return apiClient.post('/api/id-cards', {
      card_type: mode,
      card_data: cardData
    });
  },

  async getSavedCards() {
    return apiClient.get('/api/id-cards');
  }
};

export default idCardService;
