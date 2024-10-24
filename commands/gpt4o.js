const axios = require('axios');

module.exports = {
  name: 'Gpt4',
  description: 'Pose une question à chatgpt4 et obtient une réponse,utilise le comande g.',
  author: 'ArYAN',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const query = args.join(' ');

    if (!query) {
      return sendMessage(senderId, { text: "Veuillez entrer une question valide." }, pageAccessToken);
    }

    try {
      // Envoyer un message indiquant que l'IA réfléchit
      const thinkingMessage = await sendMessage(senderId, { text: '🪐 🪔Rtm GPT-4 réfléchit... ⏳' }, pageAccessToken);

      // Appel de l'API pour obtenir la réponse de GPT-4
      const fastestAnswer = await getFastestValidAnswer(query, senderId);

      // Envoyer la réponse formatée
      const formattedResponse = `🇲🇬 | GPT-4omini rtm🧾\n━━━━━━━━✨━━━━━━━\n${fastestAnswer}\n━━━━━━━━━━━━━━━━`;
      await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);

      // Supprimer le message d'attente
      await thinkingMessage.delete();
    } catch (error) {
      console.error('Erreur lors de la requête à GPT-4o :', error);
      await sendMessage(senderId, { text: "" }, pageAccessToken);
    }
  }
};

// Fonction pour appeler le service GPT-4o
async function getFastestValidAnswer(prompt, senderID) {
  const services = [
    { url: 'https://gpt-four.vercel.app/gpt', param: { prompt: 'prompt' }, isCustom: true }
  ];

  const promises = services.map(service => callService(service, prompt, senderID));
  const results = await Promise.allSettled(promises);
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }
  throw new Error('Tous les services ont échoué à fournir une réponse valide');
}

async function callService(service, prompt, senderID) {
  if (service.isCustom) {
    try {
      const response = await axios.get(`${service.url}?${service.param.prompt}=${encodeURIComponent(prompt)}`);
      return response.data.answer || response.data;
    } catch (error) {
      console.error(`Erreur du service personnalisé ${service.url}: ${error.message}`);
      throw new Error(`Erreur du service ${service.url}: ${error.message}`);
    }
  } else {
    const params = {};
    for (const [key, value] of Object.entries(service.param)) {
      params[key] = key === 'uid' ? senderID : encodeURIComponent(prompt);
    }
    const queryString = new URLSearchParams(params).toString();
    try {
      const response = await axios.get(`${service.url}?${queryString}`);
      return response.data.answer || response.data;
    } catch (error) {
      console.error(`Erreur du service ${service.url}: ${error.message}`);
      throw new Error(`Erreur du service ${service.url}: ${error.message}`);
    }
  }
}
