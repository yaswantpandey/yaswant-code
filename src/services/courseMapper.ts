import { Course, Instructor } from '../types/lms';
import { PRIMARY_INSTRUCTOR } from '../config/brand';

export function optimizeImageUrl(url: string, width: number = 600, quality: number = 75): string {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', String(quality));
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    } catch {
      return url;
    }
  }
  return url;
}

export function mapApiCourseToLmsCourse(apiCourse: any): Course {
  const defaultInstructor: Instructor = PRIMARY_INSTRUCTOR;

  const rawAvatar = apiCourse.instructor?.avatar || apiCourse.instructor_avatar || defaultInstructor.avatar;
  const optimizedAvatar = optimizeImageUrl(rawAvatar, 96, 75);

  const instructor: Instructor = apiCourse.instructor && typeof apiCourse.instructor === 'object'
    ? {
        id: apiCourse.instructor.id || apiCourse.instructor_id || defaultInstructor.id,
        name: apiCourse.instructor.name || apiCourse.instructor_name || defaultInstructor.name,
        role: apiCourse.instructor.role || apiCourse.instructor_title || defaultInstructor.role,
        avatar: optimizedAvatar,
        bio: apiCourse.instructor.bio || defaultInstructor.bio,
        rating: Number(apiCourse.instructor.rating ?? defaultInstructor.rating),
        reviewsCount: Number(apiCourse.instructor.reviewsCount ?? apiCourse.instructor.reviews_count ?? defaultInstructor.reviewsCount),
        studentsCount: Number(apiCourse.instructor.studentsCount ?? apiCourse.instructor.students_count ?? defaultInstructor.studentsCount),
        coursesCount: Number(apiCourse.instructor.coursesCount ?? defaultInstructor.coursesCount),
        expertise: Array.isArray(apiCourse.instructor.expertise) ? apiCourse.instructor.expertise : defaultInstructor.expertise,
        socialLinks: apiCourse.instructor.socialLinks || {
          github: apiCourse.instructor.githubUrl || apiCourse.instructor_github || defaultInstructor.socialLinks.github,
          twitter: apiCourse.instructor.twitterUrl || apiCourse.instructor_twitter || defaultInstructor.socialLinks.twitter,
          linkedin: apiCourse.instructor.linkedinUrl || apiCourse.instructor_linkedin || defaultInstructor.socialLinks.linkedin,
        },
        achievements: apiCourse.instructor.achievements || defaultInstructor.achievements,
      }
    : {
        id: apiCourse.instructor_id || defaultInstructor.id,
        name: apiCourse.instructor_name || defaultInstructor.name,
        role: apiCourse.instructor_title || defaultInstructor.role,
        avatar: optimizedAvatar,
        bio: apiCourse.instructor_bio || defaultInstructor.bio,
        rating: Number(apiCourse.instructor_rating ?? defaultInstructor.rating),
        reviewsCount: Number(apiCourse.instructor_reviews_count ?? defaultInstructor.reviewsCount),
        studentsCount: Number(apiCourse.instructor_students_count ?? defaultInstructor.studentsCount),
        coursesCount: defaultInstructor.coursesCount,
        expertise: defaultInstructor.expertise,
        socialLinks: {
          github: apiCourse.instructor_github || defaultInstructor.socialLinks.github,
          twitter: apiCourse.instructor_twitter || defaultInstructor.socialLinks.twitter,
          linkedin: apiCourse.instructor_linkedin || defaultInstructor.socialLinks.linkedin,
        },
        achievements: defaultInstructor.achievements,
      };

  return {
    id: String(apiCourse.id),
    title: apiCourse.title || '',
    tagline: apiCourse.tagline || apiCourse.short_description || '',
    description: apiCourse.description || '',
    thumbnail: optimizeImageUrl(apiCourse.thumbnail || apiCourse.cover_image || '', 600, 75),
    instructor,
    category: apiCourse.category || 'General',
    difficulty: (['Beginner', 'Intermediate', 'Advanced', 'All Levels'].includes(apiCourse.difficulty)
      ? apiCourse.difficulty
      : 'All Levels') as Course['difficulty'],
    rating: Number(apiCourse.rating ?? 5.0),
    reviewsCount: Number(apiCourse.reviewsCount ?? apiCourse.reviews_count ?? 0),
    studentsCount: Number(apiCourse.studentsCount ?? apiCourse.students_count ?? 0),
    durationHours: Number(apiCourse.durationHours ?? apiCourse.duration_hours ?? 10),
    lessonsCount: Number(apiCourse.lessonsCount ?? apiCourse.lessons_count ?? 0),
    price: Number(apiCourse.price ?? 0),
    originalPrice: apiCourse.originalPrice != null || apiCourse.original_price != null 
      ? Number(apiCourse.originalPrice ?? apiCourse.original_price) 
      : undefined,
    discountPercentage: apiCourse.discountPercentage != null || apiCourse.discount_percentage != null
      ? Number(apiCourse.discountPercentage ?? apiCourse.discount_percentage)
      : undefined,
    isBestseller: Boolean(apiCourse.isBestseller ?? apiCourse.is_bestseller),
    isFeatured: Boolean(apiCourse.isFeatured ?? apiCourse.is_featured),
    language: apiCourse.language || 'English & Hindi',
    lastUpdated: apiCourse.lastUpdated || apiCourse.updated_at || new Date().toISOString().split('T')[0],
    hasCertificate: apiCourse.hasCertificate != null 
      ? Boolean(apiCourse.hasCertificate) 
      : (apiCourse.has_certificate != null ? Boolean(apiCourse.has_certificate) : true),
    enrolled: Boolean(apiCourse.enrolled),
    progressPercent: Number(apiCourse.progressPercent ?? apiCourse.progress_percent ?? 0),
    currentLessonId: apiCourse.currentLessonId || apiCourse.current_lesson_id,
    whatYouWillLearn: Array.isArray(apiCourse.whatYouWillLearn) 
      ? apiCourse.whatYouWillLearn 
      : (Array.isArray(apiCourse.what_you_will_learn) ? apiCourse.what_you_will_learn : []),
    requirements: Array.isArray(apiCourse.requirements) ? apiCourse.requirements : [],
    modules: Array.isArray(apiCourse.modules) 
      ? apiCourse.modules.map((m: any) => ({
          id: String(m.id),
          title: m.title || '',
          duration: m.duration || '',
          chapters: Array.isArray(m.chapters)
            ? m.chapters.map((ch: any) => ({
                id: String(ch.id),
                title: ch.title || '',
                duration: ch.duration || '',
                lessons: Array.isArray(ch.lessons)
                  ? ch.lessons.map((l: any) => ({
                      id: String(l.id),
                      title: l.title || '',
                      duration: l.duration || '0:00',
                      type: (['video', 'quiz', 'assignment', 'reading'].includes(l.type) ? l.type : 'video') as any,
                      completed: Boolean(l.completed),
                      locked: Boolean(l.locked),
                      previewAvailable: Boolean(l.previewAvailable ?? l.preview_available),
                      videoUrl: l.videoUrl || l.video_url || '',
                      description: l.description || '',
                      codeSnippet: l.codeSnippet || l.code_snippet || '',
                      codeLanguage: l.codeLanguage || l.code_language || '',
                      resources: Array.isArray(l.resources) ? l.resources : [],
                      transcript: Array.isArray(l.transcript) ? l.transcript : [],
                    }))
                  : []
              }))
            : []
        }))
      : [],
    skills: Array.isArray(apiCourse.skills) ? apiCourse.skills : [],
    projectsCount: Number(apiCourse.projectsCount ?? apiCourse.projects_count ?? 0),
  };
}
