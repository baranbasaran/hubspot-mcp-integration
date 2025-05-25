// /services/conversationService.ts

interface Message {
    sender: 'You' | 'Client';
    time: string;
    text: string;
  }
  
  export const fetchRecentMessages = async (contactId: string): Promise<Message[]> => {
    // 🔧 Replace with DB/API call later
    return [
      {
        sender: 'You',
        time: 'May 23, 10:45',
        text: 'Thanks for the update!'
      },
      {
        sender: 'Client',
        time: 'May 22, 17:12',
        text: 'Did you get my message?'
      }
    ];
  };
  
  export const generateSmartReplies = async (messages: Message[]): Promise<string[]> => {
    // 🔧 Replace with GPT/Gemini API call later
    return [
      'Thanks for checking in! I’ll follow up shortly.',
      'Appreciate your patience — I’ll update you soon.'
    ];
  };
  