export interface MindTreeNode {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedHours: number;
  tools: string[];
  concepts: string[];
  projectIdea: string;
  isPopular?: boolean;
}

export interface MindTreeBranch {
  id: string;
  title: string;
  tagline: string;
  iconName: string;
  phaseNumber: number;
  estimatedWeeks: number;
  nodes: MindTreeNode[];
}

export interface RoadmapMilestone {
  phase: number;
  title: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Capstone' | 'Industry Ready';
  description: string;
  deliverable: string;
  keySkills: string[];
  checkpointProjects: string[];
}

export interface TechRoadmap {
  id: string;
  title: string;
  category: 'web' | 'security' | 'cloud' | 'automation' | 'ai' | 'data';
  categoryLabel: string;
  tagline: string;
  description: string;
  iconName?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  weeklyCommitment?: string;
  totalTopics: number;
  salaryBenchmark?: string;
  badgeColor?: string;
  accentGradient?: string;
  careerRoles: string[];
  overviewStats?: {
    phasesCount: number;
    projectsCount: number;
    estimatedTotalHours: number;
  };
  mindtree?: MindTreeBranch[];
  milestones?: RoadmapMilestone[];
  relatedCourses?: string[];
  relatedTools?: string[];
  relatedNotes?: string[];
}
