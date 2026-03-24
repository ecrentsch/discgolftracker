import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as coursesService from '../services/courses.service';

const createCourseSchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(50),
  holeCount: z.number().int().min(1).max(100),
  par: z.number().int().min(1).max(300),
});

const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  review: z.string().max(500).optional(),
});

export async function searchCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = req.query.q as string | undefined;
    const state = req.query.state as string | undefined;
    const courses = await coursesService.searchCourses(q, state);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

export async function getCourseDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const course = await coursesService.getCourseDetail(id, req.user?.id);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = createCourseSchema.parse(req.body);
    const course = await coursesService.createCourse(body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

export async function rateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const courseId = parseInt(req.params.id);
    const body = ratingSchema.parse(req.body);
    const rating = await coursesService.rateCourse(req.user!.id, courseId, body.stars, body.review);
    res.json(rating);
  } catch (err) {
    next(err);
  }
}
