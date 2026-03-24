import { Link } from 'react-router-dom';
import type { CourseSummary } from '../../../../shared/src/types';
import { Card } from '../ui/Card';
import { StarRating } from '../ui/StarRating';

interface CourseCardProps {
  course: CourseSummary;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link to={`/courses/${course.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-stone-900 mb-0.5 line-clamp-1">{course.name}</h3>
        <p className="text-sm text-stone-500 mb-2">{course.city}, {course.state}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-3 text-stone-600">
            <span>{course.holeCount} holes</span>
            <span>Par {course.par}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StarRating value={Math.round(course.avgRating ?? 0)} size="sm" />
            {course.avgRating && (
              <span className="text-xs text-stone-400">({course.ratingCount})</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
