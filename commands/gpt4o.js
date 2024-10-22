const axios = require('axios');

module.exports = {
  name: 'gpt4o',
  description: 'Pose une question à GPT-4o et analyse les images.',
  author: 'ChatGPT + Deku (rest api)',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');

    if (!prompt) {
      return sendMessage(senderId, { text: "Veuillez entrer une question valide." }, pageAccessToken);
    }

    try {
      // Envoyer un message indiquant que GPT-4o est en train de répondre
      await sendMessage(senderId, { text: 'GPT-4o websearche en cours⏳...\n\n─────★─────' }, pageAccessToken);

      // URL pour appeler l'API GPT-4o avec une question
      const apiUrl = `https://deku-rest-apis.ooguy.com/api/gpt-4o?q=${encodeURIComponent(prompt)}&uid=100${senderId}`;
      const response = await axios.get(apiUrl);

      const text = response.data.result;

      // Créer un style avec un contour pour la réponse de GPT-4o
      const formattedResponse = `─────★─────\n` +
                                `✨GPT-4o web scrapers🤖🇲🇬\n\n${text}\n` +
                                `─────★─────`;

      // Gérer les réponses longues de plus de 2000 caractères
      const maxMessageLength = 2000;
      if (formattedResponse.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(formattedResponse, maxMessageLength);
        for (const message of messages) {
          await sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
      }

    } catch (error) {
      console.error('Erreur lors de l\'appel à GPT-4o:', error);
      // Message de réponse d'erreur
      await sendMessage(senderId, { text: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.' }, pageAccessToken);
    }
  },

  // Fonction pour gérer les images
  async handleImage(senderId, imageUrl, sendMessage, pageAccessToken) {
    try {
      const query = "Décris cette image.";
      const apiUrl = `https://deku-rest-apis.ooguy.com/gemini?prompt=${encodeURIComponent(query)}&url=${encodeURIComponent(imageUrl)}`;
      const { data } = await axios.get(apiUrl);
      
      const formattedResponse = `─────★─────\n` +
                                `✨GPT-4o🤖🇲🇬\n\n${data.gemini}\n` +
                                `─────★─────`;

      await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
    } catch (error) {
      console.error('Erreur lors de l\'analyse de l\'image avec GPT-4o:', error);
      await sendMessage(senderId, { text: "Désolé, je n'ai pas pu analyser l'image." }, pageAccessToken);
    }
  }
};

// Fonction pour découper les messages en morceaux de 2000 caractères
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
