// Simple FAQ Chatbot Demo for Intraform
const FAQS = [
  {
    q: ["what services do you offer", "what can you do", "services", "solutions"],
    a: "We offer FAQ chatbots, inbound voice agents, and outbound voice agents to automate customer service and business communications for small businesses."
  },
  {
    q: ["how much does it cost", "pricing", "price", "cost"],
    a: "Pricing depends on your business needs. Most solutions start at a few hundred dollars per month. Contact us for a custom quote!"
  },
  {
    q: ["how long does implementation take", "setup time", "how fast", "timeline"],
    a: "Most implementations take just 2-4 weeks from initial call to launch, depending on complexity."
  },
  {
    q: ["can you integrate with my systems", "integration", "crm", "connect"],
    a: "Yes! Our AI agents can integrate with your existing systems, CRMs, and workflows."
  },
  {
    q: ["is my data secure", "privacy", "security", "safe"],
    a: "Your data is secure and never shared with third parties. We take privacy seriously."
  },
  {
    q: ["how do i get started", "contact", "demo", "discovery call", "start"],
    a: "Just fill out the contact form or click 'Schedule a Discovery Call' and we'll get in touch within 24 hours!"
  }
];

function findFaqAnswer(input) {
  const text = input.trim().toLowerCase();
  for (const faq of FAQS) {
    if (faq.q.some(q => text.includes(q))) return faq.a;
  }
  return "I'm not confident I can answer that. Please reach our team directly: email hello@intraform.ca, call +1 (775) 429-7429, or use the contact form.";
}

document.addEventListener('DOMContentLoaded', function () {
  const widget = document.getElementById('faq-chatbot-widget');
  const toggleBtn = document.getElementById('faq-chatbot-toggle');
  const windowEl = document.getElementById('faq-chatbot-window');
  const closeBtn = document.getElementById('faq-chatbot-close');
  const messagesEl = document.getElementById('faq-chatbot-messages');
  const form = document.getElementById('faq-chatbot-form');
  const input = document.getElementById('faq-chatbot-input');

  function showChatbot() {
    windowEl.hidden = false;
    windowEl.classList.add('open');
    input.focus();
    // Only show welcome if no messages yet
    if (!messagesEl.hasChildNodes()) {
      setTimeout(() => addBotMessage("Hi! I'm the Intraform FAQ bot. How can I help you?"), 250);
    }
  }
  function hideChatbot() {
    windowEl.classList.remove('open');
    setTimeout(() => {
      windowEl.hidden = true;
      messagesEl.innerHTML = '';
    }, 200);
  }
  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `faq-chatbot-message ${sender}`;
    const bubble = document.createElement('div');
    bubble.className = 'faq-chatbot-bubble';
    bubble.textContent = text;
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    // Animate bubble in
    setTimeout(() => bubble.classList.add('bubble-in'), 10);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function addBotMessage(text) {
    addMessage(text, 'bot');
  }
  function addUserMessage(text) {
    addMessage(text, 'user');
  }
  function addTypingBubble() {
    const typing = document.createElement('div');
    typing.className = 'faq-chatbot-typing';
    typing.id = 'faq-chatbot-typing';
    const bubble = document.createElement('div');
    bubble.className = 'faq-chatbot-typing-bubble';
    const dots = document.createElement('div');
    dots.className = 'faq-chatbot-typing-dots';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'faq-chatbot-typing-dot';
      dots.appendChild(dot);
    }
    bubble.appendChild(dots);
    typing.appendChild(bubble);
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function removeTypingBubble() {
    const typing = document.getElementById('faq-chatbot-typing');
    if (typing) typing.remove();
  }

  toggleBtn.addEventListener('click', () => {
    if (windowEl.hidden) {
      showChatbot();
    } else {
      hideChatbot();
    }
  });
  closeBtn.addEventListener('click', hideChatbot);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const userText = input.value;
    if (!userText.trim()) return;
    addUserMessage(userText);
    addTypingBubble();
    setTimeout(() => {
      const answer = findFaqAnswer(userText);
      removeTypingBubble();
      addBotMessage(answer);
    }, 700);
    input.value = '';
  });
  // Accessibility: ESC to close
  windowEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') hideChatbot();
  });
});
