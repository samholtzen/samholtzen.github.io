// Site-wide settings: name, tagline, links, and navigation.
// Edit this file to change what appears in the header, footer, and home page.

export const site = {
  name: 'Sam Holtzen',
  tagline: 'Known to dabble.',
  // One line shown under your name on the home page.
  position: 'Postdoctoral Fellow, California Institute of Technology',
  // Used in search results and link previews.
  description:
    'Sam Holtzen is a postdoctoral fellow at Caltech researching (like most biologists) how beautifully complex life can be.',

  // Remove a link by deleting its line. Leave `href` empty to hide it.
  links: [
    { label: 'Email', href: 'mailto:sholtzen@caltech.edu' },
    { label: 'Google Scholar', href: 'https://scholar.google.com/citations?user=1Qz60QMAAAAJ' },
    { label: 'Bluesky', href: 'https://bsky.app/profile/samholtzen.bsky.social' },
    { label: 'GitHub', href: 'https://github.com/samholtzen' },
    // TODO(sam): add ORCID, e.g. { label: 'ORCID', href: 'https://orcid.org/0000-...' },
  ],

  // Header navigation, in order. "Writing" is hidden until a post is published.
  nav: [
    { label: 'Research', href: '/research/' },
    { label: 'Publications', href: '/publications/' },
    { label: 'CV', href: '/cv/' },
    { label: 'Writing', href: '/writing/' },
  ],

  // Your name as it appears in author lists; it is bolded in publications.
  authorLastName: 'Holtzen',
};
