import { prisma } from '@skillarena/db';
import bcrypt from 'bcryptjs';

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Password@123', 12);
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@skillarena.dev' },
    update: {},
    create: {
      name: 'Demo Candidate',
      email: 'candidate@skillarena.dev',
      password: passwordHash,
      role: 'CANDIDATE',
      skills: ['javascript', 'react'],
    },
  });
  const interviewer = await prisma.user.upsert({
    where: { email: 'interviewer@skillarena.dev' },
    update: {},
    create: {
      name: 'Demo Interviewer',
      email: 'interviewer@skillarena.dev',
      password: passwordHash,
      role: 'INTERVIEWER',
      skills: ['system-design', 'nodejs'],
    },
  });
  await prisma.user.upsert({
    where: { email: 'admin@skillarena.dev' },
    update: {},
    create: {
      name: 'Demo Admin',
      email: 'admin@skillarena.dev',
      password: passwordHash,
      role: 'ADMIN',
      skills: ['ops'],
    },
  });

  const existingTest = await prisma.test.findFirst({ where: { title: 'SkillArena JavaScript Fundamentals' } });
  let firstQuestion = await prisma.question.findFirst({
    where: { title: 'What is the output of typeof null?' },
  });
  let secondQuestion = await prisma.question.findFirst({
    where: { title: 'Which method converts JSON string to object?' },
  });

  if (!firstQuestion) {
    firstQuestion = await prisma.question.create({
      data: {
        title: 'What is the output of typeof null?',
        description: 'Pick the correct JavaScript type output.',
        category: 'CODING',
        difficulty: 'EASY',
        tags: ['javascript', 'basics'],
      },
    });
  }

  if (!secondQuestion) {
    secondQuestion = await prisma.question.create({
      data: {
        title: 'Which method converts JSON string to object?',
        description: 'Choose the correct built-in function.',
        category: 'CODING',
        difficulty: 'EASY',
        tags: ['javascript', 'json'],
      },
    });
  }

  if (!existingTest) {
    const test = await prisma.test.create({
      data: {
        title: 'SkillArena JavaScript Fundamentals',
        description: 'Starter assessment for JavaScript fundamentals and syntax basics.',
        category: 'CODING',
        duration: 30,
        totalMarks: 20,
        passingScore: 10,
        negativeMarks: 0.5,
        visibility: 'PUBLIC',
      },
    });

    const testQuestionOne = await prisma.testQuestion.create({
      data: {
        testId: test.id,
        questionId: firstQuestion.id,
        order: 1,
        marks: 10,
      },
    });

    const testQuestionTwo = await prisma.testQuestion.create({
      data: {
        testId: test.id,
        questionId: secondQuestion.id,
        order: 2,
        marks: 10,
      },
    });

    await prisma.option.createMany({
      data: [
        { testQuestionId: testQuestionOne.id, text: 'null', isCorrect: false },
        { testQuestionId: testQuestionOne.id, text: 'object', isCorrect: true },
        { testQuestionId: testQuestionOne.id, text: 'undefined', isCorrect: false },
        { testQuestionId: testQuestionOne.id, text: 'number', isCorrect: false },
        { testQuestionId: testQuestionTwo.id, text: 'JSON.parse()', isCorrect: true },
        { testQuestionId: testQuestionTwo.id, text: 'JSON.stringify()', isCorrect: false },
        { testQuestionId: testQuestionTwo.id, text: 'JSON.convert()', isCorrect: false },
        { testQuestionId: testQuestionTwo.id, text: 'JSON.object()', isCorrect: false },
      ],
    });
  }

  const existingHackathon = await prisma.hackathon.findFirst({
    where: { title: 'SkillArena Weekly Challenge' },
  });
  if (!existingHackathon) {
    const hackathon = await prisma.hackathon.create({
      data: {
        title: 'SkillArena Weekly Challenge',
        description: 'Solve practical coding tasks and compete on a live leaderboard.',
        startAt: new Date(Date.now() - 60 * 60 * 1000),
        endAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        maxTeamSize: 1,
        allowedLangs: ['python', 'javascript', 'java', 'cpp', 'go', 'rust'],
        status: 'LIVE',
      },
    });

    await prisma.problem.createMany({
      data: [
        { hackathonId: hackathon.id, questionId: firstQuestion.id, points: 100 },
        { hackathonId: hackathon.id, questionId: secondQuestion.id, points: 100 },
      ],
    });
  }

  const existingInterview = await prisma.interview.findFirst({
    where: { title: 'Demo Frontend Interview' },
  });
  if (!existingInterview) {
    const interviewRecord = await prisma.interview.create({
      data: {
        title: 'Demo Frontend Interview',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        duration: 60,
        roomId: `room-${crypto.randomUUID()}`,
        candidateId: candidate.id,
        interviewerId: interviewer.id,
      },
    });

    await prisma.notification.createMany({
      data: [
        {
          userId: candidate.id,
          title: 'Interview Scheduled',
          message: 'Demo Frontend Interview has been scheduled.',
          type: 'INTERVIEW',
          link: `/interviews/${interviewRecord.id}`,
        },
        {
          userId: interviewer.id,
          title: 'Interview Assigned',
          message: 'You have been assigned Demo Frontend Interview.',
          type: 'INTERVIEW',
          link: `/interviews/${interviewRecord.id}`,
        },
      ],
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
