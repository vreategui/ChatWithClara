// The daily topic bank. Each one is a real-life speaking situation.
// A new one is picked every day (no repeats until the list runs out, then it reshuffles).
// Feel free to add more scenarios to this list any time.

const TOPICS = [
  { key: "coffee_order", title: "Ordering a coffee", seed: "You're at a cafe ordering your usual coffee and maybe a snack." },
  { key: "making_friend_shops", title: "Striking up a chat at the shops", seed: "You bump into someone friendly while shopping and have a short, casual chat." },
  { key: "restaurant_order", title: "Ordering at a restaurant", seed: "You're at a restaurant, looking at the menu, asking the waiter questions and ordering." },
  { key: "ask_product_in_store", title: "Asking if a product is in stock", seed: "You're in a shop looking for a specific item and need to ask a staff member if they have it." },
  { key: "asking_directions", title: "Asking for directions", seed: "You're a little lost and ask a stranger how to get somewhere nearby." },
  { key: "doctor_appointment", title: "Booking a doctor's appointment", seed: "You call a clinic to book an appointment and describe briefly why you need one." },
  { key: "small_talk_neighbour", title: "Small talk with a neighbour", seed: "You run into a neighbour outside and make some friendly small talk about the weather and the week." },
  { key: "returning_item", title: "Returning an item to a shop", seed: "You go back to a shop to return or exchange something you bought." },
  { key: "phone_call_booking", title: "Making a booking over the phone", seed: "You call a hairdresser or restaurant to make a booking for a particular day and time." },
  { key: "chatting_at_park", title: "Chatting with someone at the park", seed: "You're at the park and strike up a friendly conversation with another person walking there." },
  { key: "asking_price", title: "Asking about price or a discount", seed: "You ask a shop assistant about the price of something, or whether it's on sale." },
  { key: "public_transport", title: "Asking about a bus or train", seed: "You ask someone at a station which bus or train to take, and when it leaves." },
  { key: "ordering_takeaway_phone", title: "Ordering takeaway on the phone", seed: "You call a restaurant to order food for pickup and give your name and order clearly." },
  { key: "pharmacy_question", title: "Asking a pharmacist for advice", seed: "You ask the pharmacist a simple question about a common medicine, like how to take it." },
  { key: "catching_up_friend", title: "Catching up with an old friend", seed: "You run into an old friend you haven't seen in a while and catch up on each other's news." },
];

/**
 * Picks today's topic for a given user, deterministically per day so everyone
 * who opens the app on the same day without having done it yet sees a stable pick,
 * but it still rotates day to day and doesn't repeat until the whole bank is used.
 */
function topicForDate(userId, date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  const idx = (dayIndex + userId) % TOPICS.length;
  return TOPICS[idx];
}

function findTopic(key) {
  return TOPICS.find((t) => t.key === key);
}

module.exports = { TOPICS, topicForDate, findTopic };
