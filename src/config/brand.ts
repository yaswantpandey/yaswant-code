import { Instructor } from '../types/lms';

export const BRAND_CONFIG = {
  name: "Yaswant Code",
  shortName: "YaswantCode",
  tagline: "Empowering Developers with Modern Engineering & Practical Tech Skills",
  description: "Master modern software engineering, web development, cloud computing, and systems architecture with practical, industry-aligned courses by Yaswant Pandey.",
  founded: "2026",
  founder: "Yaswant Pandey",
  email: "support@yaswant.co.in",
  website: "https://yaswant.co.in",
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    youtube: "https://youtube.com",
  },
};

export const PRIMARY_INSTRUCTOR: Instructor = {
  id: "inst-yaswant",
  name: "Yaswant Pandey",
  role: "Founder & Lead Software Engineer",
  avatar: "/og-image.svg",
  bio: "Full-stack software developer and tech educator specializing in modern web architecture, distributed systems, cloud infrastructure, and practical developer tooling.",
  rating: 5.0,
  reviewsCount: 150,
  studentsCount: 1200,
  coursesCount: 6,
  expertise: [
    "Full-Stack Development",
    "React & TypeScript",
    "Node.js & PHP",
    "Cloud & DevOps",
    "System Design & APIs"
  ],
  socialLinks: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    website: "https://yaswant.co.in"
  },
  achievements: [
    "Founder of Yaswant Code Learning Platform",
    "Over 1,000+ students mentored across web & software engineering",
    "Production cloud infrastructure and open-source tooling specialist"
  ]
};

export const MOCK_INSTRUCTORS: Instructor[] = [PRIMARY_INSTRUCTOR];
