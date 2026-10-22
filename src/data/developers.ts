export type Developer = {
  id?: string
  name: string
  role: string
  location: string
  experience: string
  years: number
  skills: string[]
  image: string
  initials: string
  available: boolean
  publicProfile?: boolean
  bio: string
  website?: string
  github?: string
  linkedin?: string
  company?: string
  email?: string
}

// Public examples, linked to each person's own GitHub profile. They are not members of DevDirectory.
export const publicDevelopers: Developer[] = [
  { name: 'Evan You', role: 'Creator of Vue and Vite', location: 'Singapore', experience: 'Open source', years: 0, skills: ['Vue', 'Vite', 'TypeScript'], image: 'https://github.com/yyx990803.png', initials: 'EY', available: false, publicProfile: true, bio: 'Open-source developer and creator of Vue.js and Vite. His work focuses on making the modern web easier to build for, with tools used by teams around the world.', github: 'https://github.com/yyx990803', website: 'https://evanyou.me', company: 'VoidZero' },
  { name: 'Dan Abramov', role: 'React ecosystem developer', location: 'Location not listed', experience: 'Open source', years: 0, skills: ['React', 'Redux', 'JavaScript'], image: 'https://github.com/gaearon.png', initials: 'DA', available: false, publicProfile: true, bio: 'Known for contributions across the React ecosystem, including Redux and React Hot Loader. He writes and speaks about building interfaces, developer tools, and the craft of software.', github: 'https://github.com/gaearon', website: 'https://danabra.mov' },
  { name: 'Kent C. Dodds', role: 'Developer educator', location: 'Salt Lake City, Utah', experience: 'Open source', years: 0, skills: ['React', 'Testing Library', 'TypeScript'], image: 'https://github.com/kentcdodds.png', initials: 'KD', available: false, publicProfile: true, bio: 'Developer educator focused on improving the world with quality software. He creates practical learning resources and is known for the Testing Library project and a broad collection of web development courses.', github: 'https://github.com/kentcdodds', website: 'https://kentcdodds.com', company: 'EpicWeb.dev' },
  { name: 'Cassidy Williams', role: 'Software developer and educator', location: 'Chicago, Illinois', experience: 'Open source', years: 0, skills: ['JavaScript', 'TypeScript', 'Web'], image: 'https://github.com/cassidoo.png', initials: 'CW', available: false, publicProfile: true, bio: 'Making memes and dreams... and software. Cassidy builds approachable developer tools, teaches through talks and demos, and shares a weekly newsletter about web development.', github: 'https://github.com/cassidoo', website: 'https://cassidoo.co', company: 'GitHub' },
  { name: 'Sindre Sorhus', role: 'Open-source developer', location: 'Location not listed', experience: 'Open source', years: 0, skills: ['JavaScript', 'Swift', 'Node.js'], image: 'https://github.com/sindresorhus.png', initials: 'SS', available: false, publicProfile: true, bio: 'A full-time open-source maintainer focused on Swift and JavaScript. His work spans macOS apps, command-line tools, and widely used npm packages.', github: 'https://github.com/sindresorhus', website: 'https://sindresorhus.com' },
  { name: 'Addy Osmani', role: 'Software engineer', location: 'Sunnyvale, California', experience: 'Open source', years: 0, skills: ['JavaScript', 'Web performance', 'Chrome'], image: 'https://github.com/addyosmani.png', initials: 'AO', available: false, publicProfile: true, bio: 'Software engineer and author whose work spans JavaScript, web performance, and browser tooling. His public projects include tools for faster page loads and service-worker applications.', github: 'https://github.com/addyosmani', website: 'https://addyosmani.com' },
  { name: 'Wes Bos', role: 'Developer educator', location: 'Hamilton, Ontario', experience: 'Open source', years: 0, skills: ['JavaScript', 'CSS', 'React'], image: 'https://github.com/wesbos.png', initials: 'WB', available: false, publicProfile: true, bio: 'Creates courses that make learning JavaScript and web development approachable. His teaching covers modern frontend tools, CSS, React, and practical projects for people learning by building.', github: 'https://github.com/wesbos', website: 'https://wesbos.com' },
  { name: 'Simon Willison', role: 'Developer and open-source author', location: 'Half Moon Bay, California', experience: 'Open source', years: 0, skills: ['Python', 'SQLite', 'AI'], image: 'https://github.com/simonw.png', initials: 'SW', available: false, publicProfile: true, bio: 'Developer and creator of Datasette, an open-source tool for exploring and publishing data. His recent work also covers SQLite, command-line tools, and practical experiments with language models.', github: 'https://github.com/simonw', website: 'https://simonwillison.net', company: 'Datasette' },
  { name: 'Guillermo Rauch', role: 'Open-source developer', location: 'Location not listed', experience: 'Open source', years: 0, skills: ['JavaScript', 'React', 'Next.js'], image: 'https://github.com/rauchg.png', initials: 'GR', available: false, publicProfile: true, bio: 'Developer and founder whose public work has helped shape the JavaScript and React ecosystem. His repositories and writing explore tools for building and deploying modern web applications.', github: 'https://github.com/rauchg', website: 'https://rauchg.com' },
  { name: 'Sarah Drasner', role: 'Developer and author', location: 'Location not listed', experience: 'Open source', years: 0, skills: ['JavaScript', 'Vue', 'Animation'], image: 'https://github.com/sdras.png', initials: 'SD', available: false, publicProfile: true, bio: 'Distinguished Engineer at Google working across Chrome, AI, and the web ecosystem. She also creates open-source developer tools and writes books and courses about engineering, management, and creative web development.', github: 'https://github.com/sdras', website: 'https://sarah.dev', company: 'Google' },
  { name: 'Julia Evans', role: 'Software developer and writer', location: 'Location not listed', experience: 'Open source', years: 0, skills: ['Ruby', 'Linux', 'Systems'], image: 'https://github.com/jvns.png', initials: 'JE', available: false, publicProfile: true, bio: 'Software developer and writer who makes illustrated zines about programming and computers. Her open-source work includes rbspy, a Ruby profiler, and learning resources for tools such as pandas.', github: 'https://github.com/jvns', website: 'https://jvns.ca' },
  { name: 'Tanner Linsley', role: 'Open-source developer', location: 'Location not listed', experience: 'Open source', years: 0, skills: ['TypeScript', 'React', 'TanStack'], image: 'https://github.com/tannerlinsley.png', initials: 'TL', available: false, publicProfile: true, bio: 'Creator and maintainer of the TanStack ecosystem of web development tools. His projects focus on practical building blocks for routing, data fetching, tables, and application state.', github: 'https://github.com/tannerlinsley', website: 'https://tanstack.com' },
]

export const publicDirectoryStats = {
  profiles: publicDevelopers.filter(person => person.publicProfile).length,
  githubLinks: publicDevelopers.filter(person => person.github).length,
  websites: publicDevelopers.filter(person => person.website).length,
  organizations: new Set(publicDevelopers.map(person => person.company).filter(Boolean)).size,
}
