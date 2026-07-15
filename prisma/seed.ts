import { PrismaClient, PublishStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  ['Latest News', 'latest-news', 'Recent announcements and company updates.'],
  ['Brigade History', 'brigade-history', 'Educational articles on Boys Brigade and Girls Brigade heritage.'],
  ['Faith & Devotion', 'faith-devotion', 'Bible studies, devotions and reflections.'],
  ['Leadership & Training', 'leadership-training', 'Guides for members, officers and young leaders.'],
  ['Events & Reports', 'events-reports', 'Reports from parades, camps, outreach and enrolments.'],
  ['Golden Jubilee', 'golden-jubilee', 'Archive stories and updates for the 50th anniversary.'],
] as const;

const articles = [
  {
    slug: 'history-of-the-brigade',
    title: "The Full History Of The Boys' Brigade And The Girls' Brigade",
    eyebrow: 'Archive Feature',
    categorySlug: 'brigade-history',
    excerpt: "A researched full read on two separate Christian youth organisations: The Boys' Brigade and The Girls' Brigade.",
    deck: "The Boys' Brigade and The Girls' Brigade share Christian roots and a similar language of faith, discipline and service, but they are not the same organisation.",
    coverImageUrl: '/about/william-A-Smith.jpg',
    readTime: '12 min read',
    featured: true,
    publishedAt: '2026-07-07',
    tags: ['history', 'boys-brigade', 'girls-brigade'],
    timeline: [
      { year: '1883', title: "The Boys' Brigade Is Founded", description: 'Sir William Alexander Smith founded The Boys Brigade in Glasgow, Scotland.' },
      { year: '1893', title: "The Girls' Brigade Begins In Dublin", description: 'The Girls Brigade tradition began in Dublin as a Christian movement for girls and young women.' },
      { year: '1965', title: "The Modern Girls' Brigade Is Formed", description: 'Three related girls movements joined to form the modern Girls Brigade.' },
    ],
    sections: [
      {
        heading: "The Boys' Brigade: A Separate Organisation",
        body: [
          "The Boys' Brigade is a Christian uniformed youth organisation founded in Glasgow, Scotland, on 4 October 1883 by Sir William Alexander Smith.",
          'Its early company life combined church, Bible teaching, drill, recreation, physical exercise and organised duty.',
        ],
      },
      {
        heading: "The Girls' Brigade: Its Own History",
        body: [
          'The Girls Brigade is also an international Christian youth organisation, but it has its own beginning and identity.',
          'The movement began in Dublin in 1893 and later grew through related girls organisations that shared a concern for faith, character and service.',
        ],
      },
      {
        heading: 'How Both Legacies Meet Locally',
        body: [
          'The two organisations are different, but local church life can honour both through worship, training, service, enrolment, camps and leadership development.',
        ],
      },
    ],
  },
  {
    slug: 'community-care-visit-2025',
    title: 'Community Care Visit Strengthens Service Culture',
    eyebrow: 'Latest Report',
    categorySlug: 'latest-news',
    excerpt: 'Members stepped into the community with care packs, prayers and practical support for families around Surulere.',
    deck: 'The visit reminded members that Brigade service is practical, local and deeply personal.',
    coverImageUrl: '/gallery/outreach2025.jpg',
    readTime: '4 min read',
    featured: false,
    publishedAt: '2026-07-04',
    tags: ['outreach', 'service'],
    sections: [{ heading: 'Care Beyond The Hall', body: ['The outreach gave members a chance to serve families with practical support and encouragement.'] }],
  },
  {
    slug: 'enrolment-service-meaning',
    title: 'What Enrolment Service Teaches Every Member',
    eyebrow: 'Formation',
    categorySlug: 'brigade-history',
    excerpt: 'Enrolment is more than a ceremony. It is a public promise of belonging, discipline and Christian witness.',
    deck: 'Every enrolment service gives the company a chance to remember its promise and renew its purpose.',
    coverImageUrl: '/gallery/gallery1.png',
    readTime: '5 min read',
    featured: false,
    publishedAt: '2026-06-29',
    tags: ['enrolment', 'formation'],
    sections: [{ heading: 'A Public Promise', body: ['Enrolment marks a member formal place in the company and gathers the church around that commitment.'] }],
  },
  {
    slug: 'golden-jubilee-why-fifty-years-matters',
    title: 'Golden Jubilee: Why Fifty Years Matters',
    eyebrow: 'Anniversary Collection',
    categorySlug: 'golden-jubilee',
    excerpt: 'A Jubilee is thanksgiving for people, prayers, service and continuity.',
    deck: 'Fifty years asks a company to look back with gratitude and forward with renewed courage.',
    coverImageUrl: '/images/hero.jpeg',
    readTime: '5 min read',
    featured: false,
    publishedAt: '2026-06-08',
    tags: ['jubilee', 'archive'],
    sections: [{ heading: 'Memory With A Mission', body: ['A Golden Jubilee should preserve names, stories, photographs and milestones while renewing mission.'] }],
  },
];

const events = [
  {
    slug: 'monthly-fellowship',
    title: 'Monthly Fellowship & Devotion',
    startsAt: '2026-07-18T10:00:00.000Z',
    time: '10:00 AM',
    location: 'Brigade Hall, Surulere',
    description: 'A morning of devotion, worship, mentoring and group fellowship for members and leaders.',
    content: 'Monthly Fellowship & Devotion keeps the company spiritually grounded through worship, prayer, scripture reflection and practical mentoring.',
    coverImageUrl: '/events/pic1.png',
    galleryImageUrls: ['/events/pic1.png', '/events/pic2.png', '/events/pic3.png'],
    featured: false,
  },
  {
    slug: 'community-outreach-program',
    title: 'Medical & Charity Outreach',
    startsAt: '2026-08-22T09:00:00.000Z',
    time: '9:00 AM',
    location: "All Saints' Anglican Church, Surulere, Ojuelegba",
    description: 'Join us as we serve families around Surulere through practical support, prayer and shared hope.',
    content: 'The Community Outreach Program is one of the clearest expressions of the Brigade service mission.',
    coverImageUrl: '/events/outreach2026.png',
    galleryImageUrls: ['/events/pic2.png', '/events/pic1.png', '/events/pic3.png'],
    featured: true,
  },
  {
    slug: 'leadership-training',
    title: 'Leadership Training Camp',
    startsAt: '2026-08-08T09:00:00.000Z',
    time: '9:00 AM',
    location: 'Camp Ground, Lagos',
    description: 'A focused training day for young leaders, with team-building drills and guided leadership sessions.',
    content: 'Leadership Training Camp helps members practice discipline, responsibility and teamwork in a structured environment.',
    coverImageUrl: '/events/pic3.png',
    galleryImageUrls: ['/events/pic3.png', '/events/pic1.png', '/events/pic2.png'],
    featured: false,
  },
];

const gallery = [
  {
    slug: 'enrolment',
    name: 'Enrolment & Rededication Service',
    description: 'Enrolment and rededication ceremonies across the years.',
    coverImageUrl: '/gallery/gallery1.png',
    sortOrder: 1,
    albums: [
      { slug: 'enrolment-2025', title: 'Rededication Service', year: 2025, coverImageUrl: '/gallery/gallery1.png', images: ['/gallery/gallery1.png', '/about/biblestud.jpeg', '/images/hero.jpeg'] },
      { slug: 'enrolment-2024', title: 'Service Of Welcome', year: 2024, coverImageUrl: '/about/biblestud.jpeg', images: ['/about/biblestud.jpeg', '/gallery/gallery1.png'] },
    ],
  },
  {
    slug: 'parade',
    name: 'Parade & Drill',
    description: 'Discipline, inspection and excellence.',
    coverImageUrl: '/gallery/gallery1.png',
    sortOrder: 2,
    albums: [{ slug: 'parade-2025', title: 'Inspection And March Past', year: 2025, coverImageUrl: '/events/pic1.png', images: ['/events/pic1.png', '/events/pic2.png'] }],
  },
  {
    slug: 'outreach',
    name: 'Medical & Charity Outreach',
    description: 'Medical outreach, charity visits and community service activities.',
    coverImageUrl: '/gallery/outreach2025.jpg',
    sortOrder: 3,
    albums: [{ slug: 'outreach-2025', title: 'Community Care Visit', year: 2025, coverImageUrl: '/gallery/outreach2025.jpg', images: ['/gallery/outreach2025.jpg', '/events/pic2.png'] }],
  },
];

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, active: true, role: UserRole.SUPER_ADMIN },
    create: { name: process.env.SEED_ADMIN_NAME ?? 'Admin User', email: email.toLowerCase(), passwordHash, role: UserRole.SUPER_ADMIN },
  });
}

async function main() {
  await seedAdmin();

  for (const [name, slug, description] of categories) {
    await prisma.articleCategory.upsert({ where: { slug }, update: { name, description }, create: { name, slug, description } });
  }

  for (const article of articles) {
    const { categorySlug, sections, timeline, publishedAt, ...data } = article;
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        ...data,
        content: sections.map((section) => `${section.heading}\n${section.body.join('\n\n')}`).join('\n\n'),
        sections,
        timeline: timeline ?? undefined,
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(`${publishedAt}T00:00:00.000Z`),
        category: { connect: { slug: categorySlug } },
      },
      create: {
        ...data,
        content: sections.map((section) => `${section.heading}\n${section.body.join('\n\n')}`).join('\n\n'),
        sections,
        timeline: timeline ?? undefined,
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date(`${publishedAt}T00:00:00.000Z`),
        category: { connect: { slug: categorySlug } },
      },
    });
  }

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: { ...event, startsAt: new Date(event.startsAt), status: PublishStatus.PUBLISHED },
      create: { ...event, startsAt: new Date(event.startsAt), status: PublishStatus.PUBLISHED },
    });
  }

  for (const category of gallery) {
    const galleryCategory = await prisma.galleryCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, coverImageUrl: category.coverImageUrl, sortOrder: category.sortOrder },
      create: { name: category.name, slug: category.slug, description: category.description, coverImageUrl: category.coverImageUrl, sortOrder: category.sortOrder },
    });

    for (const album of category.albums) {
      const galleryAlbum = await prisma.galleryAlbum.upsert({
        where: { slug: album.slug },
        update: { title: album.title, year: album.year, coverImageUrl: album.coverImageUrl, categoryId: galleryCategory.id },
        create: { title: album.title, slug: album.slug, year: album.year, coverImageUrl: album.coverImageUrl, categoryId: galleryCategory.id },
      });

      await prisma.galleryImage.deleteMany({ where: { albumId: galleryAlbum.id } });
      await prisma.galleryImage.createMany({
        data: album.images.map((url, index) => ({ url, albumId: galleryAlbum.id, alt: `${album.title} photo ${index + 1}` })),
      });
    }
  }

  await prisma.siteSetting.upsert({ where: { key: 'siteName' }, update: { value: 'Boys & Girls Brigade Surulere Company', public: true }, create: { key: 'siteName', value: 'Boys & Girls Brigade Surulere Company', public: true } });
  await prisma.siteSetting.upsert({ where: { key: 'contactEmail' }, update: { value: 'info@bgb-surulere.org', public: true }, create: { key: 'contactEmail', value: 'info@bgb-surulere.org', public: true } });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
