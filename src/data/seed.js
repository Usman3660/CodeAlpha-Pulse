export const seedUsers = [
  {
    id: 'u1',
    name: 'Alex Rivera',
    handle: '@arivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    bio: 'Product designer & creative coder. Experimenting with spatial interfaces and generative typography.',
    followers: ['u2', 'u3'],
    following: ['u2', 'u4']
  },
  {
    id: 'u2',
    name: 'Maya Chen',
    handle: '@mayacodes',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
    bio: 'Building open-source tools for the modern web. Coffee enthusiast & sunset photographer.',
    followers: ['u1', 'u3', 'u4'],
    following: ['u1', 'u3']
  },
  {
    id: 'u3',
    name: 'Liam Vance',
    handle: '@liamvance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    bio: 'Motion director & 3D artist. Exploring realtime graphics and kinetic light structures.',
    followers: ['u1', 'u2'],
    following: ['u2']
  },
  {
    id: 'u4',
    name: 'Elena Rostova',
    handle: '@elenarostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    bio: 'Architectural photographer & urban nomad. Documenting concrete geometries across the globe.',
    followers: ['u1'],
    following: ['u1', 'u2', 'u3']
  }
];

export const seedPosts = [
  {
    id: 'p1',
    authorId: 'u2',
    content: 'Just deployed the new fluid animation system. The responsiveness on mobile displays feels like butter! What do you all think of the subtle micro-interactions? #DesignSystems #WebDev',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    tag: 'DesignSystems',
    timestamp: Date.now() - 1000 * 60 * 25,
    likes: ['u1', 'u3'],
    comments: [
      {
        id: 'c1',
        authorId: 'u1',
        content: 'The 3D tilt tracking elevates the overall feeling so well!',
        timestamp: Date.now() - 1000 * 60 * 12
      },
      {
        id: 'c2',
        authorId: 'u3',
        content: 'Agreed, incredible attention to detail Maya.',
        timestamp: Date.now() - 1000 * 60 * 5
      }
    ]
  },
  {
    id: 'p2',
    authorId: 'u3',
    content: 'Working on a new kinetic visual installation today. Finding harmony between organic curves and mathematical precision. 🎨✨ #CreativeCode #3DArt',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
    tag: 'CreativeCode',
    timestamp: Date.now() - 1000 * 60 * 110,
    likes: ['u1', 'u2', 'u4'],
    comments: [
      {
        id: 'c3',
        authorId: 'u4',
        content: 'Those sunset tones are sublime!',
        timestamp: Date.now() - 1000 * 60 * 45
      }
    ]
  },
  {
    id: 'p3',
    authorId: 'u1',
    content: 'Great design is often about what you choose to remove rather than what you pack in. Keeping the experience lightweight and uncluttered makes every interaction intentional. #Minimalism',
    image: '',
    tag: 'Minimalism',
    timestamp: Date.now() - 1000 * 60 * 240,
    likes: ['u2', 'u3'],
    comments: []
  }
];

export const demoUsers = seedUsers;
export const initialPosts = seedPosts;
