export const formatTime = (timestamp) => {
  const date = new Date(timestamp);

  // Extract the hours and minutes
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Format the hours and minutes as needed (e.g., adding leading zeroes)
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  // Combine the hours and minutes
  const time = `${formattedHours}:${formattedMinutes}`;
  return time;
};

export const activityList = [
  "Go to a dog park and socialize with other pet owners",
  "Listen to music while relaxing in a hammock",
  "Read a book at a cozy café",
  "Ride a bicycle through a scenic park",
  "Watch a sunrise from a mountain viewpoint",
  "Go to a dog park and bring a picnic",
  "Listen to music during a long drive",
  "Read a book in a quiet library",
  "Ride a bicycle along a beachfront path",
  "Watch a sunset from a rooftop terrace",
  "Go to a dog park and participate in a dog training class",
  "Listen to music while cooking a new recipe",
  "Read a book by the fireplace on a rainy day",
  "Ride a bicycle on a nature trail",
  "Watch a sunrise with a yoga session in the park",
  "Go to a dog park and join a local dog meet-up group",
  "Listen to music while working out at the gym",
  "Read a book in a park under a tree",
  "Ride a bicycle and explore new neighborhoods",
  "Watch a sunset during a beach bonfire",
];

export const users = [
  { name: "Priya Sharma", points: 300 },
  { name: "Suresh Kumar", points: 295 },
  { name: "Anita Verma", points: 290 },
  { name: "Vikram Singh", points: 285 },
  { name: "Meera Patel", points: 280 },
  { name: "Krishna Iyer", points: 275 },
  { name: "Sita Joshi", points: 270 },
  { name: "Ravi Desai", points: 265 },
  { name: "Lakshmi Nair", points: 260 },
  { name: "Arjun Reddy", points: 250 },
];

export function chatHrefConstructor(id1, id2) {
  const sortedIds = [id1, id2].sort();
  return `${sortedIds[0]}--${sortedIds[1]}`;
}
