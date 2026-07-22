import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/dbConfig";
import { Service } from "../models/serviceModel";

dotenv.config();

// One-time migration of the services that used to live hardcoded in
// frontend/src/components/services/serviceList.tsx. Upserts on `title` so
// re-running is safe and won't duplicate or clobber admin-edited prices —
// price fields are only set with $setOnInsert, everything else with $set.
const services = [
  {
    title: "Birthday Surprise Calls",
    description:
      "Make their special day unforgettable with a personalized birthday call filled with wishes, songs, and joy.",
    category: "celebration",
    iconKey: "cake",
    thumbnail:
      "https://images.unsplash.com/photo-1545696563-af8f6ec2295a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YmlydGhkYXklMjBjYWtlfGVufDB8fDB8fHww",
    regular: {
      features: [
        "Deliver your heartfelt birthday message",
        "Includes a cheerful celebration tip",
      ],
      localPrice: 2000,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your heartfelt birthday message",
        "Includes a cheerful celebration tip",
        "Personalized birthday song option",
      ],
      localPrice: 2500,
      internationalPrice: 3500,
    },
  },
  {
    title: "Anniversary Wishes",
    description:
      "Celebrate love and milestones with heartfelt anniversary calls that honor special relationships.",
    category: "celebration",
    iconKey: "heart",
    thumbnail:
      "https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    regular: {
      features: [
        "Deliver your loving anniversary message",
        "Includes a romantic memory highlight",
      ],
      localPrice: 2000,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your loving anniversary message",
        "Includes a romantic memory highlight",
        "Personalized anniversary song option",
      ],
      localPrice: 2500,
      internationalPrice: 3500,
    },
  },
  {
    title: "Friendship Reconnection",
    description:
      "Surprise old friends and strengthen bonds with unexpected calls that bring back beautiful memories.",
    category: "relationship",
    iconKey: "users",
    thumbnail:
      "https://images.unsplash.com/photo-1665686377065-08ba896d16fd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZyaWVuZHNoaXB8ZW58MHx8MHx8fDA%3D",
    regular: {
      features: ["Deliver your thoughtful friendship message", "Includes a fun memory share"],
      localPrice: 2500,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your thoughtful friendship message",
        "Includes a fun memory share",
        "Personalized friendship song option",
      ],
      localPrice: 3000,
      internationalPrice: 3500,
    },
  },
  {
    title: "Graduation Congratulations",
    description:
      "Honor academic achievements with congratulatory calls that celebrate hard work and success.",
    category: "achievement",
    iconKey: "graduationCap",
    thumbnail:
      "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    regular: {
      features: ["Deliver your congratulatory graduation message", "Includes a motivational quote"],
      localPrice: 2000,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your congratulatory graduation message",
        "Includes a motivational quote",
        "Personalized graduation song option",
      ],
      localPrice: 2500,
      internationalPrice: 3500,
    },
  },
  {
    title: "Congratulatory Calls",
    description: "Welcome new arrivals and achievements with joyful calls that celebrate success.",
    category: "celebration",
    iconKey: "partyPopper",
    thumbnail:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    regular: {
      features: ["Deliver your congratulatory message", "Includes a joyful celebration tip"],
      localPrice: 2000,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your congratulatory message",
        "Includes a joyful celebration tip",
        "Personalized congratulatory song option",
      ],
      localPrice: 2500,
      internationalPrice: 3500,
    },
  },
  {
    title: "Holiday Greetings",
    description:
      "Spread holiday cheer with seasonal calls that bring warmth and joy during special times of year.",
    category: "holiday",
    iconKey: "gift",
    thumbnail:
      "https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    regular: {
      features: ["Deliver your festive holiday message", "Includes a seasonal greeting"],
      localPrice: 2000,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your festive holiday message",
        "Includes a seasonal greeting",
        "Personalized holiday song option",
      ],
      localPrice: 2500,
      internationalPrice: 3500,
    },
  },
  {
    title: "Romantic Calls",
    description:
      "Express your love and affection with a heartfelt romantic call, perfect for anniversaries, proposals, or just because.",
    category: "relationship",
    iconKey: "heart",
    thumbnail:
      "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    regular: {
      features: ["Deliver your romantic message", "Includes a sweet compliment"],
      localPrice: 3000,
      internationalPrice: 3500,
    },
    special: {
      features: [
        "Deliver your romantic message",
        "Includes a sweet compliment",
        "Personalized romantic song option",
      ],
      localPrice: 3500,
      internationalPrice: 4000,
    },
  },
  {
    title: "Apology Calls",
    description:
      "Mend relationships and say sorry with a sincere apology call, delivered with empathy and understanding.",
    category: "relationship",
    iconKey: "phone",
    thumbnail: "https://cdn.pixabay.com/photo/2020/06/05/16/27/excuse-me-5263696_960_720.jpg",
    regular: {
      features: [
        "Deliver your heartfelt apology message",
        "Includes a gesture of reconciliation",
      ],
      localPrice: 2500,
      internationalPrice: 3500,
    },
    special: {
      features: [
        "Deliver your heartfelt apology message",
        "Includes a gesture of reconciliation",
        "Personalized apology song option",
      ],
      localPrice: 3000,
      internationalPrice: 4000,
    },
  },
  {
    title: "Encouragement/Cheer Up Calls",
    description:
      "Lift spirits and motivate loved ones with uplifting calls designed to encourage and inspire.",
    category: "achievement",
    iconKey: "sun",
    thumbnail:
      "https://images.unsplash.com/photo-1721059050927-dfad8ff13e07?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    regular: {
      features: ["Deliver your encouraging message", "Includes a positive affirmation"],
      localPrice: 2000,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your encouraging message",
        "Includes a positive affirmation",
        "Personalized encouragement song option",
      ],
      localPrice: 2500,
      internationalPrice: 3500,
    },
  },
  {
    title: "Appreciation Call",
    description: "Show gratitude and appreciation to someone special with a heartfelt call that makes their day.",
    category: "relationship",
    iconKey: "heart",
    thumbnail: "https://cdn.pixabay.com/photo/2015/09/17/13/18/thank-you-944086_1280.jpg",
    regular: {
      features: ["Deliver your appreciation message", "Includes a thank you note"],
      localPrice: 2000,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your appreciation message",
        "Includes a thank you note",
        "Personalized appreciation song option",
      ],
      localPrice: 2500,
      internationalPrice: 3500,
    },
  },
  {
    title: "Father's Day Call",
    description: "Honor fathers with a special call filled with love, gratitude, and memorable moments.",
    category: "celebration",
    iconKey: "users",
    thumbnail:
      "https://images.unsplash.com/photo-1605812830455-2fadc55bc4ba?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    regular: {
      features: ["Deliver your Father's Day message", "Includes a special dad tribute"],
      localPrice: 2500,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your Father's Day message",
        "Includes a special dad tribute",
        "Personalized Father's Day song option",
      ],
      localPrice: 3000,
      internationalPrice: 3500,
    },
  },
  {
    title: "Mother's Day Call",
    description: "Celebrate mothers with a loving call that expresses gratitude, love, and admiration.",
    category: "celebration",
    iconKey: "users",
    thumbnail:
      "https://images.unsplash.com/photo-1628191013085-990d39ec25b8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    regular: {
      features: ["Deliver your Mother's Day message", "Includes a special mom tribute"],
      localPrice: 2500,
      internationalPrice: 3000,
    },
    special: {
      features: [
        "Deliver your Mother's Day message",
        "Includes a special mom tribute",
        "Personalized Mother's Day song option",
      ],
      localPrice: 3000,
      internationalPrice: 3500,
    },
  },
  {
    title: "Valentine's Day Call",
    description: "Express your love and affection with a romantic call, perfect for Valentine's Day.",
    category: "relationship",
    iconKey: "heart",
    thumbnail:
      "https://images.unsplash.com/photo-1487035242901-d419a42d17af?q=80&w=727&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    regular: {
      features: ["Deliver your Valentine's Day message", "Includes a romantic gesture"],
      localPrice: 2500,
      internationalPrice: 3500,
    },
    special: {
      features: [
        "Deliver your Valentine's Day message",
        "Includes a romantic gesture",
        "Personalized Valentine's Day song option",
      ],
      localPrice: 3000,
      internationalPrice: 4000,
    },
  },
  {
    title: "Conference Surprise Call",
    description:
      "A group surprise call that brings multiple loved ones together to celebrate or cheer someone on—all at once. Perfect for creating unforgettable moments with a personal touch.",
    category: "group",
    iconKey: "users",
    thumbnail:
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    regular: {
      features: [
        "Deliver your group celebration message",
        "Nigerian calls use standard phone networks; International calls are via WhatsApp",
      ],
      localPrice: 5000,
      internationalPrice: 6000,
    },
    special: {
      features: [
        "Deliver your group celebration message",
        "Nigerian calls use standard phone networks; International calls are via WhatsApp",
        "Personalized group song option",
      ],
      localPrice: 6000,
      internationalPrice: 7000,
    },
  },
];

async function seed() {
  await connectDB();

  const bulkOps = services.map((s) => ({
    updateOne: {
      filter: { title: s.title },
      update: {
        $set: {
          description: s.description,
          category: s.category,
          iconKey: s.iconKey,
          thumbnail: s.thumbnail,
        },
        $setOnInsert: {
          title: s.title,
          regular: s.regular,
          special: s.special,
          active: true,
        },
      },
      upsert: true,
    },
  }));

  const result = await Service.bulkWrite(bulkOps);

  console.log("Service seed summary:");
  console.log(`  services in script: ${services.length}`);
  console.log(`  upserted (new): ${result.upsertedCount}`);
  console.log(`  updated (existing, non-price fields only): ${result.modifiedCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed();
