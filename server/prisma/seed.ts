import { PrismaClient, Weather } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Courses ────────────────────────────────────────────────────────────────
  // All courses verified as real disc golf courses via PDGA course directory & UDisc
  const courses = [
    // Midland, MI
    { name: 'Chippewa Banks Disc Golf Course', city: 'Midland', state: 'MI', holeCount: 18, par: 54 },
    { name: 'Midland College Disc Golf Course', city: 'Midland', state: 'MI', holeCount: 9, par: 27 },
    // Sanford, MI (~15 miles from Midland)
    { name: 'The Jungle at Sanford Lake Park', city: 'Sanford', state: 'MI', holeCount: 18, par: 58 },
    // Saginaw, MI (~20 miles from Midland)
    { name: 'Wickes Woods Disc Golf Course', city: 'Saginaw', state: 'MI', holeCount: 18, par: 54 },
    { name: 'Thompson Memorial Disc Golf Course', city: 'Saginaw', state: 'MI', holeCount: 9, par: 27 },
    { name: 'Muellers Valley View', city: 'Saginaw', state: 'MI', holeCount: 18, par: 54 },
    // Mount Pleasant, MI (~30 miles from Midland)
    { name: 'Deerfield Park - Deerfield Course', city: 'Mount Pleasant', state: 'MI', holeCount: 18, par: 55 },
    { name: 'Deerfield Park - Wildwood Course', city: 'Mount Pleasant', state: 'MI', holeCount: 18, par: 56 },
    { name: 'Central Michigan University Disc Golf', city: 'Mount Pleasant', state: 'MI', holeCount: 18, par: 54 },
    // Bay City, MI (~30 miles from Midland)
    { name: 'Putz Putt and Approach Disc Golf Park', city: 'Bay City', state: 'MI', holeCount: 9, par: 27 },
  ];

  const createdCourses: { id: number; par: number; name: string }[] = [];
  for (const course of courses) {
    const c = await prisma.course.upsert({
      where: { name_city_state: { name: course.name, city: course.city, state: course.state } },
      update: {},
      create: course,
    });
    createdCourses.push({ id: c.id, par: c.par, name: c.name });
  }
  console.log(`✅ ${createdCourses.length} courses seeded`);

  // ─── Seed Users ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'disc@test.com' },
    update: {},
    create: {
      username: 'discmaster',
      email: 'disc@test.com',
      passwordHash,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'ace@test.com' },
    update: {},
    create: {
      username: 'fairwayace',
      email: 'ace@test.com',
      passwordHash,
    },
  });
  console.log('✅ Seed users created: discmaster, fairwayace');

  // ─── Friendship ─────────────────────────────────────────────────────────────
  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: user1.id, addresseeId: user2.id } },
    update: { status: 'ACCEPTED' },
    create: { requesterId: user1.id, addresseeId: user2.id, status: 'ACCEPTED' },
  });
  console.log('✅ Friendship created between discmaster and fairwayace');

  // ─── Discs ──────────────────────────────────────────────────────────────────
  const disc1Data = [
    { name: 'Destroyer', brand: 'Innova', plasticType: 'Star', weight: 175, speed: 12, glide: 5, turn: -1, fade: 3 },
    { name: 'Roc3', brand: 'Innova', plasticType: 'Champion', weight: 180, speed: 7, glide: 4, turn: 0, fade: 3 },
    { name: 'Aviar', brand: 'Innova', plasticType: 'DX', weight: 170, speed: 2, glide: 3, turn: 0, fade: 1 },
    { name: 'Firebird', brand: 'Innova', plasticType: 'Champion', weight: 175, speed: 9, glide: 3, turn: 0, fade: 4 },
  ];

  const disc2Data = [
    { name: 'Zeus', brand: 'Discraft', plasticType: 'ESP', weight: 173, speed: 12, glide: 5, turn: -1, fade: 2 },
    { name: 'Buzzz', brand: 'Discraft', plasticType: 'Z-Line', weight: 177, speed: 5, glide: 4, turn: -1, fade: 1 },
    { name: 'Luna', brand: 'Discraft', plasticType: 'Pro-D', weight: 174, speed: 3, glide: 3, turn: 0, fade: 3 },
  ];

  for (const disc of disc1Data) {
    await prisma.disc.create({ data: { userId: user1.id, ...disc } });
  }
  for (const disc of disc2Data) {
    await prisma.disc.create({ data: { userId: user2.id, ...disc } });
  }
  console.log('✅ Discs seeded for both users');

  // ─── Rounds ─────────────────────────────────────────────────────────────────
  const chippewa = createdCourses.find(c => c.name === 'Chippewa Banks Disc Golf Course')!;
  const midlandCollege = createdCourses.find(c => c.name === 'Midland College Disc Golf Course')!;
  const jungle = createdCourses.find(c => c.name === 'The Jungle at Sanford Lake Park')!;
  const wickes = createdCourses.find(c => c.name === 'Wickes Woods Disc Golf Course')!;
  const deerfield = createdCourses.find(c => c.name === 'Deerfield Park - Deerfield Course')!;

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  const user1Rounds = [
    { courseId: chippewa.id, date: daysAgo(1), score: chippewa.par - 3, weather: 'SUNNY' as Weather, notes: 'Great round, hit a 200ft ace on hole 7!' },
    { courseId: midlandCollege.id, date: daysAgo(4), score: midlandCollege.par + 2, weather: 'CLOUDY' as Weather, notes: null },
    { courseId: jungle.id, date: daysAgo(8), score: jungle.par - 1, weather: 'WINDY' as Weather, notes: 'Wind was brutal on the back nine but managed to stay under par.' },
    { courseId: chippewa.id, date: daysAgo(14), score: chippewa.par - 5, weather: 'SUNNY' as Weather, notes: 'Personal best at Chippewa Banks!' },
    { courseId: deerfield.id, date: daysAgo(21), score: deerfield.par + 1, weather: 'RAINY' as Weather, notes: 'Wet conditions made it tough but worth the drive.' },
  ];

  const user2Rounds = [
    { courseId: wickes.id, date: daysAgo(2), score: wickes.par - 2, weather: 'SUNNY' as Weather, notes: 'Love the wooded layout at Wickes!' },
    { courseId: chippewa.id, date: daysAgo(5), score: chippewa.par + 4, weather: 'COLD' as Weather, notes: 'Off day, but still fun.' },
    { courseId: deerfield.id, date: daysAgo(10), score: deerfield.par - 1, weather: 'CLOUDY' as Weather, notes: null },
    { courseId: jungle.id, date: daysAgo(16), score: jungle.par - 3, weather: 'SUNNY' as Weather, notes: 'The Jungle lives up to its name — tough but so fun!' },
    { courseId: midlandCollege.id, date: daysAgo(25), score: midlandCollege.par + 3, weather: 'WINDY' as Weather, notes: null },
  ];

  for (const round of user1Rounds) {
    await prisma.round.create({ data: { userId: user1.id, ...round } });
  }
  for (const round of user2Rounds) {
    await prisma.round.create({ data: { userId: user2.id, ...round } });
  }
  console.log('✅ Rounds seeded');

  // ─── Course Ratings ─────────────────────────────────────────────────────────
  const ratings = [
    { userId: user1.id, courseId: chippewa.id, stars: 5, review: 'Best course in Midland! Great layout, well-maintained.' },
    { userId: user1.id, courseId: jungle.id, stars: 4, review: 'The Jungle earns its name — tight wooded holes with serious elevation. Worth the drive from Midland.' },
    { userId: user2.id, courseId: chippewa.id, stars: 4, review: 'Solid course, gets busy on weekends though.' },
    { userId: user2.id, courseId: wickes.id, stars: 5, review: 'Beautiful wooded layout. One of the best in the Saginaw area!' },
    { userId: user2.id, courseId: deerfield.id, stars: 4, review: 'Good mix of open and wooded holes. Love having two courses in one park.' },
  ];

  for (const rating of ratings) {
    await prisma.courseRating.upsert({
      where: { userId_courseId: { userId: rating.userId, courseId: rating.courseId } },
      update: {},
      create: rating,
    });
  }
  console.log('✅ Course ratings seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  Email: disc@test.com  |  Password: password123  |  Username: discmaster');
  console.log('  Email: ace@test.com   |  Password: password123  |  Username: fairwayace');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
